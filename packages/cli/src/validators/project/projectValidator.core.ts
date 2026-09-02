/**
 * Project validator for generated projects.
 *
 * @module validators/project
 */

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { execCommand } from "../../utils/utils.exec.js";

/**
 * Project validation result.
 */
export interface ProjectValidationResult {
  readonly checks: readonly ProjectCheck[];
  readonly valid: boolean;
  readonly errors: readonly string[];
}

/**
 * Individual project check.
 */
export interface ProjectCheck {
  readonly name: string;
  readonly passed: boolean;
  readonly message?: string;
}

/**
 * Validates a generated project.
 */
export class ProjectValidator {
  /**
   * Validates the generated project structure and configuration.
   */
  async validate(projectPath: string): Promise<ProjectValidationResult> {
    const checks: ProjectCheck[] = [];
    const errors: string[] = [];

    checks.push(await this.checkPackageJson(projectPath));
    checks.push(await this.checkTsConfig(projectPath));
    checks.push(await this.checkNodeModules(projectPath));
    checks.push(await this.checkSourceFiles(projectPath));

    for (const check of checks) {
      if (!check.passed && check.message) {
        errors.push(check.message);
      }
    }

    return {
      checks,
      valid: errors.length === 0,
      errors,
    };
  }

  private async checkPackageJson(projectPath: string): Promise<ProjectCheck> {
    try {
      const content = await readFile(
        join(projectPath, "package.json"),
        "utf-8",
      );
      const pkg = JSON.parse(content) as {
        name?: string;
        scripts?: Record<string, string>;
      };

      if (!pkg.name) {
        return {
          name: "package.json",
          passed: false,
          message: "Missing package name",
        };
      }

      return { name: "package.json", passed: true };
    } catch {
      return {
        name: "package.json",
        passed: false,
        message: "package.json not found",
      };
    }
  }

  private async checkTsConfig(projectPath: string): Promise<ProjectCheck> {
    try {
      await readFile(join(projectPath, "tsconfig.json"), "utf-8");
      return { name: "tsconfig.json", passed: true };
    } catch {
      return {
        name: "tsconfig.json",
        passed: false,
        message: "tsconfig.json not found",
      };
    }
  }

  private async checkNodeModules(projectPath: string): Promise<ProjectCheck> {
    try {
      const { stat } = await import("node:fs/promises");
      await stat(join(projectPath, "node_modules"));
      return { name: "node_modules", passed: true };
    } catch {
      return {
        name: "node_modules",
        passed: false,
        message: "Dependencies not installed",
      };
    }
  }

  private async checkSourceFiles(projectPath: string): Promise<ProjectCheck> {
    try {
      const { stat } = await import("node:fs/promises");
      const srcPath = join(projectPath, "src");
      await stat(srcPath);
      return { name: "source files", passed: true };
    } catch {
      return {
        name: "source files",
        passed: false,
        message: "src directory not found",
      };
    }
  }
}
