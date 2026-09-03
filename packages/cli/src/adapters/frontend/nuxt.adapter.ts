/**
 * Nuxt frontend adapter.
 *
 * @module adapters/frontend/nuxt
 */

import { writeFileTree } from "../../utils/utils.fileSystem.js";
import { scaffoldWithFallback } from "../../scaffolders/scaffolder.helper.js";
import type {
  FrontendAdapter,
  FrontendGenerationContext,
  DependencyRequirement,
  ValidationResult,
} from "./frontendAdapter.type.js";

/**
 * Nuxt adapter with Nuxt 3 support.
 */
export class NuxtAdapter implements FrontendAdapter {
  readonly name = "nuxt";
  readonly framework = "nuxt";

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async getLatestVersion(): Promise<string> {
    return "3.15.0";
  }

  async scaffold(context: FrontendGenerationContext): Promise<void> {
    const files = this.getBaseFiles(context);
    await scaffoldWithFallback({
      command: "npx",
      args: ["nuxi@latest", "init", "."],
      targetPath: context.projectPath,
      fallbackFiles: files,
    });
  }

  getDependencies(
    context: FrontendGenerationContext,
  ): readonly DependencyRequirement[] {
    const deps: DependencyRequirement[] = [];

    if (context.features.stateManagement === "pinia") {
      deps.push({ name: "pinia", type: "dependency" });
    }

    if (context.features.testing) {
      deps.push(
        { name: "vitest", type: "devDependency" },
        { name: "@vue/test-utils", type: "devDependency" },
        { name: "jsdom", type: "devDependency" },
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

  private getBaseFiles(
    context: FrontendGenerationContext,
  ): Record<string, string> {
    return {
      "package.json": JSON.stringify(
        {
          name: context.project.name,
          version: "0.1.0",
          private: true,
          scripts: {
            dev: "nuxt dev",
            build: "nuxt build",
            preview: "nuxt preview",
          },
          dependencies: {
            nuxt: "^3.15.0",
          },
          devDependencies: {
            "@nuxt/devtools": "latest",
          },
        },
        null,
        2,
      ),
      "nuxt.config.ts": `export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
});
`,
      "app.vue": `<template>
  <div>
    <h1>Hello from Lattice</h1>
  </div>
</template>
`,
    };
  }

  private getStructure(
    context: FrontendGenerationContext,
  ): Record<string, string> {
    return {
      "components/.gitkeep": "",
      "composables/.gitkeep": "",
      "layouts/.gitkeep": "",
      "pages/.gitkeep": "",
      "server/.gitkeep": "",
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

      files["composables/useApi.ts"] = `/**
 * API Client for backend communication.
 */

const API_URL = import.meta.env.NUXT_PUBLIC_API_URL || "http://localhost:3000";

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
