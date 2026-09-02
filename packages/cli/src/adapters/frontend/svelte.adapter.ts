/**
 * Svelte frontend adapter using Vite.
 *
 * @module adapters/frontend/svelte
 */

import { execCommand } from "../../utils/utils.exec.js";
import { writeFileTree } from "../../utils/utils.fileSystem.js";
import type {
  FrontendAdapter,
  FrontendGenerationContext,
  DependencyRequirement,
  ValidationResult,
} from "./frontendAdapter.type.js";

/**
 * Svelte adapter using Vite as the build tool.
 */
export class SvelteAdapter implements FrontendAdapter {
  readonly name = "svelte";
  readonly framework = "svelte";

  async isAvailable(): Promise<boolean> {
    try {
      await execCommand("node --version", ".");
      return true;
    } catch {
      return false;
    }
  }

  async getLatestVersion(): Promise<string> {
    return "5";
  }

  async scaffold(context: FrontendGenerationContext): Promise<void> {
    const { projectPath, language } = context;
    const template = language === "typescript" ? "ts" : "default";

    await execCommand(
      `npx sv@latest create . --template ${template} --no-install`,
      projectPath,
    );
  }

  getDependencies(
    context: FrontendGenerationContext,
  ): readonly DependencyRequirement[] {
    const deps: DependencyRequirement[] = [
      { name: "svelte", type: "dependency" },
    ];

    if (context.features.stateManagement === "svelte-store") {
      // Svelte stores are built-in
    }

    if (context.features.testing) {
      deps.push(
        { name: "vitest", type: "devDependency" },
        { name: "@testing-library/svelte", type: "devDependency" },
        { name: "jsdom", type: "devDependency" },
      );
    }

    if (context.features.linting) {
      deps.push(
        { name: "eslint", type: "devDependency" },
        { name: "eslint-plugin-svelte", type: "devDependency" },
      );
    }

    if (context.features.formatting) {
      deps.push({ name: "prettier", type: "devDependency" });
    }

    return deps;
  }

  async applyLatticeStructure(
    context: FrontendGenerationContext,
  ): Promise<void> {
    const structure = this.getStructure(context);
    await writeFileTree(context.projectPath, structure);
  }

  async generateIntegration(context: FrontendGenerationContext): Promise<void> {
    const integrationFiles = this.getIntegrationFiles(context);
    await writeFileTree(context.projectPath, integrationFiles);
  }

  async validate(
    context: FrontendGenerationContext,
  ): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!context.project) {
      errors.push("Project configuration is required");
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  private getStructure(
    context: FrontendGenerationContext,
  ): Record<string, string> {
    const srcDir = "src";

    if (context.architecture === "feature-based") {
      return this.getFeatureBasedStructure(srcDir);
    }

    if (context.architecture === "minimal") {
      return this.getMinimalStructure(srcDir);
    }

    return this.getLatticeStandardStructure(srcDir);
  }

  private getLatticeStandardStructure(srcDir: string): Record<string, string> {
    return {
      [`${srcDir}/lib/components/.gitkeep`]: "",
      [`${srcDir}/lib/stores/.gitkeep`]: "",
      [`${srcDir}/lib/utils/.gitkeep`]: "",
      [`${srcDir}/lib/types/index.ts`]: "// Types\nexport {};\n",
      [`${srcDir}/routes/.gitkeep`]: "",
      [`${srcDir}/services/.gitkeep`]: "",
    };
  }

  private getFeatureBasedStructure(srcDir: string): Record<string, string> {
    return {
      [`${srcDir}/lib/features/.gitkeep`]: "",
      [`${srcDir}/lib/components/.gitkeep`]: "",
      [`${srcDir}/lib/stores/.gitkeep`]: "",
      [`${srcDir}/lib/services/.gitkeep`]: "",
      [`${srcDir}/lib/types/index.ts`]: "// Types\nexport {};\n",
      [`${srcDir}/lib/utils/.gitkeep`]: "",
    };
  }

  private getMinimalStructure(srcDir: string): Record<string, string> {
    return {
      [`${srcDir}/lib/components/.gitkeep`]: "",
      [`${srcDir}/lib/utils/.gitkeep`]: "",
    };
  }

  private getIntegrationFiles(
    context: FrontendGenerationContext,
  ): Record<string, string> {
    const files: Record<string, string> = {};

    if (context.project.type === "fullstack") {
      files[".env.example"] = `VITE_API_URL=http://localhost:3000\n`;

      files["src/lib/services/api-client.ts"] = `/**
 * API Client for backend communication.
 */

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export interface ApiResponse<T> {
  readonly data: T;
  readonly status: number;
}

export async function apiGet<T>(path: string): Promise<ApiResponse<T>> {
  const response = await fetch(\`\${API_URL}\${path}\`);
  const data = await response.json() as T;
  return { data, status: response.status };
}

export async function apiPost<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
  const response = await fetch(\`\${API_URL}\${path}\`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json() as T;
  return { data, status: response.status };
}
`;
    }

    return files;
  }
}
