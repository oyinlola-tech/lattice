/**
 * Angular frontend adapter.
 *
 * @module adapters/frontend/angular
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
 * Angular adapter using Angular CLI.
 */
export class AngularAdapter implements FrontendAdapter {
  readonly name = "angular";
  readonly framework = "angular";

  async isAvailable(): Promise<boolean> {
    try {
      await execCommand("node --version", ".");
      return true;
    } catch {
      return false;
    }
  }

  async getLatestVersion(): Promise<string> {
    return "19";
  }

  async scaffold(context: FrontendGenerationContext): Promise<void> {
    const { projectPath, language } = context;
    const style = "scss";

    await execCommand(
      `npx @angular/cli@latest new . --style=${style} --routing --ssr --skip-git --skip-install`,
      projectPath,
    );
  }

  getDependencies(
    context: FrontendGenerationContext,
  ): readonly DependencyRequirement[] {
    const deps: DependencyRequirement[] = [];

    if (context.features.stateManagement === "ngrx") {
      deps.push(
        { name: "@ngrx/store", type: "dependency" },
        { name: "@ngrx/effects", type: "dependency" },
      );
    }

    if (context.features.testing) {
      deps.push(
        { name: "jasmine-core", type: "devDependency" },
        { name: "@angular/testing", type: "devDependency" },
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
      "src/app/core/.gitkeep": "",
      "src/app/shared/.gitkeep": "",
      "src/app/features/.gitkeep": "",
      "src/app/services/.gitkeep": "",
      "src/app/models/.gitkeep": "",
      "src/app/utils/.gitkeep": "",
    };
  }

  private getIntegrationFiles(
    context: FrontendGenerationContext,
  ): Record<string, string> {
    const files: Record<string, string> = {};

    if (context.project.type === "fullstack") {
      files["src/environments/environment.ts"] = `export const environment = {
  production: false,
  apiUrl: "http://localhost:3000",
};
`;

      files["src/environments/environment.prod.ts"] =
        `export const environment = {
  production: true,
  apiUrl: "",
};
`;

      files["src/app/services/api.service.ts"] =
        `import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";

export interface ApiResponse<T> {
  readonly data: T;
  readonly status: number;
}

@Injectable({
  providedIn: "root",
})
export class ApiService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  get<T>(path: string): Observable<T> {
    return this.http.get<T>(\`\${this.apiUrl}\${path}\`);
  }

  post<T>(path: string, body: unknown): Observable<T> {
    return this.http.post<T>(\`\${this.apiUrl}\${path}\`, body);
  }

  put<T>(path: string, body: unknown): Observable<T> {
    return this.http.put<T>(\`\${this.apiUrl}\${path}\`, body);
  }

  delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(\`\${this.apiUrl}\${path}\`);
  }
}
`;
    }

    return files;
  }
}
