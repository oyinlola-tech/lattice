/**
 * Frontend generator using the adapter system.
 *
 * @module generators/frontend
 */

import type { ProjectConfiguration } from "../../types/projectConfiguration.type.js";
import type { FrontendGenerationContext } from "../../adapters/frontend/frontendAdapter.type.js";
import { FrontendAdapterRegistry } from "../../registries/adapter/frontendAdapterRegistry.core.js";
import { PackageManagerRegistry } from "../../registries/adapter/packageManagerRegistry.core.js";
import { DependencyResolver } from "../../resolvers/dependency/dependencyResolver.core.js";
import { CLIGenerationError } from "../../errors/index.js";

/**
 * Frontend generation options.
 */
export interface FrontendGenerationOptions {
  readonly project: ProjectConfiguration;
  readonly projectPath: string;
  readonly framework: string;
  readonly architecture?:
    "zudojs-standard" | "feature-based" | "minimal" | "framework-default";
  readonly language?: "typescript" | "javascript";
  readonly packageManager?: "pnpm" | "npm" | "yarn" | "bun";
}

/**
 * Frontend generation result.
 */
export interface FrontendGenerationResult {
  readonly success: boolean;
  readonly framework: string;
  readonly files: readonly string[];
  readonly errors: readonly string[];
}

/**
 * Generates frontend projects using framework adapters.
 */
export class FrontendGenerator {
  private readonly adapterRegistry: FrontendAdapterRegistry;
  private readonly packageManagerRegistry: PackageManagerRegistry;
  private readonly dependencyResolver: DependencyResolver;

  constructor() {
    this.adapterRegistry = new FrontendAdapterRegistry();
    this.packageManagerRegistry = new PackageManagerRegistry();
    this.dependencyResolver = new DependencyResolver();
  }

  /**
   * Generates a frontend project.
   */
  async generate(
    options: FrontendGenerationOptions,
  ): Promise<FrontendGenerationResult> {
    const adapter = this.adapterRegistry.get(options.framework);

    if (!adapter) {
      throw new CLIGenerationError(
        `Unknown frontend framework: ${options.framework}. Available: ${this.adapterRegistry.getNames().join(", ")}`,
      );
    }

    const context: FrontendGenerationContext = {
      project: options.project,
      projectPath: options.projectPath,
      framework: adapter.framework,
      language: options.language ?? "typescript",
      architecture: options.architecture ?? "zudojs-standard",
      packageManager: options.packageManager ?? "pnpm",
      features: {
        testing: true,
        linting: true,
        formatting: true,
      },
    };

    const files: string[] = [];
    const errors: string[] = [];

    try {
      // 1. Scaffold using official tool
      await adapter.scaffold(context);
      files.push("scaffold");

      // 2. Apply Zudojs structure
      await adapter.applyZudojsStructure(context);
      files.push("structure");

      // 3. Resolve and install dependencies
      const deps = adapter.getDependencies(context);
      const resolution = this.dependencyResolver.resolve(deps);

      if (resolution.conflicts.length > 0) {
        for (const conflict of resolution.conflicts) {
          errors.push(`Conflict: ${conflict.reason}`);
        }
        return { success: false, framework: options.framework, files, errors };
      }

      // 4. Install dependencies
      const pmName = options.packageManager ?? "pnpm";
      const packageManager = this.packageManagerRegistry.get(pmName);

      if (packageManager) {
        const devDeps = resolution.devDependencies.map((d) => d.name);
        await packageManager.addDev(options.projectPath, devDeps);
        files.push("dependencies");
      }

      // 5. Validate
      const validation = await adapter.validate(context);
      if (!validation.valid) {
        errors.push(...validation.errors);
      }
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }

    return {
      success: errors.length === 0,
      framework: options.framework,
      files,
      errors,
    };
  }

  /**
   * Gets available frontend frameworks.
   */
  getAvailableFrameworks(): readonly string[] {
    return this.adapterRegistry.getNames();
  }
}
