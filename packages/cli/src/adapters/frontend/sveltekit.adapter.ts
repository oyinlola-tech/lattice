/**
 * SvelteKit frontend adapter.
 *
 * @module adapters/frontend/sveltekit
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
 * SvelteKit adapter with server-side rendering support.
 */
export class SvelteKitAdapter implements FrontendAdapter {
  readonly name = "sveltekit";
  readonly framework = "sveltekit";

  async isAvailable(): Promise<boolean> {
    try {
      await execCommand("node --version", ".");
      return true;
    } catch {
      return false;
    }
  }

  async getLatestVersion(): Promise<string> {
    return "2";
  }

  async scaffold(context: FrontendGenerationContext): Promise<void> {
    const { projectPath, language } = context;
    const template = language === "typescript" ? "ts" : "default";

    await execCommand(
      `npx sv@latest create . --template ${template} --types ${language === "typescript" ? "ts" : "js"} --no-install`,
      projectPath,
    );
  }

  getDependencies(
    context: FrontendGenerationContext,
  ): readonly DependencyRequirement[] {
    const deps: DependencyRequirement[] = [
      { name: "@sveltejs/kit", type: "dependency" },
      { name: "svelte", type: "dependency" },
    ];

    if (context.features.testing) {
      deps.push(
        { name: "vitest", type: "devDependency" },
        { name: "@sveltejs/vite-plugin-svelte", type: "devDependency" },
      );
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
    return {
      "src/lib/components/.gitkeep": "",
      "src/lib/stores/.gitkeep": "",
      "src/lib/utils/.gitkeep": "",
      "src/lib/types/index.ts": "// Types\nexport {};\n",
      "src/lib/services/.gitkeep": "",
      "src/routes/.gitkeep": "",
      "src/routes/api/.gitkeep": "",
    };
  }

  private getIntegrationFiles(
    context: FrontendGenerationContext,
  ): Record<string, string> {
    const files: Record<string, string> = {};

    if (context.project.type === "fullstack") {
      files[".env.example"] = `PUBLIC_API_URL=http://localhost:3000\n`;

      files["src/lib/services/api-client.ts"] = `/**
 * API Client for backend communication.
 */

import { PUBLIC_API_URL } from "$env/static/public";

const API_URL = PUBLIC_API_URL || "http://localhost:3000";

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
