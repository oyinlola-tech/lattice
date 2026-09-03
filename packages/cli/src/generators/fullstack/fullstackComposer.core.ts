/**
 * Fullstack project composer.
 *
 * Orchestrates frontend, backend, and integration generation.
 *
 * @module generators/fullstack
 */

import type { ProjectConfiguration } from "../../types/projectConfiguration.type.js";
import type {
  FrontendAdapter,
  FrontendGenerationContext,
} from "../../adapters/frontend/frontendAdapter.type.js";
import { FrontendAdapterRegistry } from "../../registries/adapter/frontendAdapterRegistry.core.js";
import { PackageManagerRegistry } from "../../registries/adapter/packageManagerRegistry.core.js";
import { DependencyResolver } from "../../resolvers/dependency/dependencyResolver.core.js";
import { IntegrationGenerator } from "../integration/integrationGenerator.core.js";
import { writeFileTree } from "../../utils/utils.fileSystem.js";
import { execCommand } from "../../utils/utils.exec.js";

/**
 * Fullstack generation context.
 */
export interface FullstackGenerationContext {
  readonly project: ProjectConfiguration;
  readonly projectPath: string;
}

/**
 * Fullstack generation result.
 */
export interface FullstackGenerationResult {
  readonly success: boolean;
  readonly files: readonly string[];
  readonly errors: readonly string[];
}

/**
 * Composes fullstack projects by orchestrating multiple generators.
 */
export class FullstackComposer {
  private readonly frontendRegistry: FrontendAdapterRegistry;
  private readonly packageManagerRegistry: PackageManagerRegistry;
  private readonly dependencyResolver: DependencyResolver;
  private readonly integrationGenerator: IntegrationGenerator;

  constructor() {
    this.frontendRegistry = new FrontendAdapterRegistry();
    this.packageManagerRegistry = new PackageManagerRegistry();
    this.dependencyResolver = new DependencyResolver();
    this.integrationGenerator = new IntegrationGenerator();
  }

  /**
   * Generates a fullstack project.
   */
  async generate(
    context: FullstackGenerationContext,
  ): Promise<FullstackGenerationResult> {
    const files: string[] = [];
    const errors: string[] = [];

    try {
      // 1. Create workspace structure
      await this.createWorkspace(context);
      files.push("package.json", "pnpm-workspace.yaml", "zudo.config.ts");

      // 2. Generate shared packages
      await this.generateSharedPackages(context);
      files.push("packages/contracts/", "packages/shared-types/");

      // 3. Generate frontend if configured
      if (context.project.frontend) {
        const frontendFiles = await this.generateFrontend(context);
        files.push(...frontendFiles);
      }

      // 4. Generate integration files
      await this.integrationGenerator.generate({
        project: context.project,
        projectPath: context.projectPath,
        backendPort: 3000,
        frontendPort:
          context.project.frontend?.framework === "next" ? 3000 : 5173,
      });
      files.push(
        ".env.example",
        "config/cors.ts",
        ...(context.project.frontend?.framework === "react" ||
        context.project.frontend?.framework === "vue"
          ? ["vite.config.ts"]
          : []),
      );

      // 5. Install dependencies
      await this.installDependencies(context);
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }

    return {
      success: errors.length === 0,
      files,
      errors,
    };
  }

  private async createWorkspace(
    context: FullstackGenerationContext,
  ): Promise<void> {
    const rootPackageJson = {
      name: context.project.name,
      private: true,
      scripts: {
        dev: "pnpm --parallel dev",
        build: "pnpm --parallel build",
        test: "pnpm --parallel test",
        lint: "pnpm --parallel lint",
        typecheck: "pnpm --parallel typecheck",
      },
      devDependencies: {
        typescript: "^5.0.0",
      },
    };

    const workspaceYaml = `packages:
  - "apps/*"
  - "packages/*"
`;

    const zudoConfig = `export default {
  version: 1,
  project: {
    name: "${context.project.name}",
    type: "fullstack",
  },
  backend: {
    architecture: "${context.project.backend?.architecture ?? "monolith"}",
    api: "${context.project.backend?.api ?? "rest"}",
  },
  frontend: {
    framework: "${context.project.frontend?.framework ?? "react"}",
    architecture: "${context.project.frontend?.architecture ?? "zudo-standard"}",
  },
  database: {
    provider: "${context.project.backend?.database ?? "postgresql"}",
  },
  workspace: {
    packageManager: "${context.project.workspace?.packageManager ?? "pnpm"}",
  },
};
`;

    await writeFileTree(context.projectPath, {
      "package.json": JSON.stringify(rootPackageJson, null, 2),
      "pnpm-workspace.yaml": workspaceYaml,
      "zudo.config.ts": zudoConfig,
    });
  }

  private async generateSharedPackages(
    context: FullstackGenerationContext,
  ): Promise<void> {
    const contractsIndex = `/**
 * Shared API contracts between frontend and backend.
 */

export interface ApiResponse<T> {
  readonly data: T;
  readonly status: number;
  readonly message?: string;
}

export interface PaginatedResponse<T> {
  readonly data: readonly T[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
}
`;

    const sharedTypesIndex = `/**
 * Shared types between frontend and backend.
 */

export type ID = string;
export type Timestamp = string;
`;

    await writeFileTree(context.projectPath, {
      "packages/contracts/src/index.ts": contractsIndex,
      "packages/shared-types/src/index.ts": sharedTypesIndex,
    });
  }

  private async generateFrontend(
    context: FullstackGenerationContext,
  ): Promise<readonly string[]> {
    if (!context.project.frontend) return [];

    const adapter = this.frontendRegistry.get(
      context.project.frontend.framework,
    );
    if (!adapter) {
      throw new Error(
        `Unknown frontend framework: ${context.project.frontend.framework}`,
      );
    }

    const frontendPath = `${context.projectPath}/apps/web`;
    const frontendContext: FrontendGenerationContext = {
      project: context.project,
      projectPath: frontendPath,
      framework: adapter.framework,
      language: context.project.frontend.language ?? "typescript",
      architecture: context.project.frontend.architecture,
      packageManager: context.project.workspace?.packageManager ?? "pnpm",
      features: {
        testing: true,
        linting: true,
        formatting: true,
        envValidation: true,
      },
    };

    await adapter.scaffold(frontendContext);
    await adapter.applyZudoStructure(frontendContext);
    await adapter.generateIntegration(frontendContext);

    return ["apps/web/"];
  }

  private async installDependencies(
    context: FullstackGenerationContext,
  ): Promise<void> {
    const pmName = context.project.workspace?.packageManager ?? "pnpm";
    const packageManager = this.packageManagerRegistry.get(pmName);

    if (packageManager) {
      await packageManager.install(context.projectPath);
    }
  }
}
