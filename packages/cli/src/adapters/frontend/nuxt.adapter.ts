/**
 * Nuxt frontend adapter.
 *
 * @module adapters/frontend/nuxt
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
 * Nuxt adapter with server-side rendering support.
 */
export class NuxtAdapter implements FrontendAdapter {
  readonly name = "nuxt";
  readonly framework = "nuxt";

  async isAvailable(): Promise<boolean> {
    try {
      await execCommand("node --version", ".");
      return true;
    } catch {
      return false;
    }
  }

  async getLatestVersion(): Promise<string> {
    return "3";
  }

  async scaffold(context: FrontendGenerationContext): Promise<void> {
    const { projectPath } = context;

    await execCommand(
      `npx nuxi@latest init . --force --packageManager ${context.packageManager}`,
      projectPath,
    );
  }

  getDependencies(
    context: FrontendGenerationContext,
  ): readonly DependencyRequirement[] {
    const deps: DependencyRequirement[] = [];

    if (context.features.stateManagement === "pinia") {
      deps.push({ name: "@pinia/nuxt", type: "dependency" });
    }

    if (context.features.testing) {
      deps.push(
        { name: "@nuxt/test-utils", type: "devDependency" },
        { name: "vitest", type: "devDependency" },
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
      "components/.gitkeep": "",
      "composables/.gitkeep": "",
      "layouts/.gitkeep": "",
      "pages/.gitkeep": "",
      "plugins/.gitkeep": "",
      "server/api/.gitkeep": "",
      "server/middleware/.gitkeep": "",
      "stores/.gitkeep": "",
      "types/index.ts": "// Types\nexport {};\n",
      "utils/.gitkeep": "",
    };
  }

  private getIntegrationFiles(
    context: FrontendGenerationContext,
  ): Record<string, string> {
    const files: Record<string, string> = {};

    if (context.project.type === "fullstack") {
      files[".env.example"] = `NUXT_PUBLIC_API_URL=http://localhost:3000\n`;

      files["services/api-client.ts"] = `/**
 * API Client for backend communication.
 */

const API_URL = useRuntimeConfig().public.apiUrl || "http://localhost:3000";

export interface ApiResponse<T> {
  readonly data: T;
  readonly status: number;
}

export async function apiGet<T>(path: string): Promise<ApiResponse<T>> {
  const response = await $fetch<T>(\`\${API_URL}\${path}\`);
  return { data: response as T, status: 200 };
}

export async function apiPost<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
  const response = await $fetch<T>(\`\${API_URL}\${path}\`, {
    method: "POST",
    body,
  });
  return { data: response as T, status: 200 };
}
`;
    }

    return files;
  }
}
