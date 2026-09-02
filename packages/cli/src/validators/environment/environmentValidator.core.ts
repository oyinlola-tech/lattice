/**
 * Environment validator for project generation.
 *
 * @module validators/environment
 */

import { execCommand } from "../../utils/utils.exec.js";

/**
 * Environment check result.
 */
export interface EnvironmentCheck {
  readonly name: string;
  readonly installed: boolean;
  readonly version?: string;
  readonly required: boolean;
}

/**
 * Environment validation result.
 */
export interface EnvironmentValidationResult {
  readonly checks: readonly EnvironmentCheck[];
  readonly valid: boolean;
  readonly missing: readonly string[];
}

/**
 * Validates the development environment before project generation.
 */
export class EnvironmentValidator {
  /**
   * Validates the environment for a given project type.
   */
  async validate(
    projectType: "backend" | "frontend" | "fullstack",
  ): Promise<EnvironmentValidationResult> {
    const checks: EnvironmentCheck[] = [];

    checks.push(await this.checkNode());
    checks.push(await this.checkGit());

    if (projectType === "frontend" || projectType === "fullstack") {
      checks.push(await this.checkPackageManager());
    }

    const missing = checks
      .filter((c) => c.required && !c.installed)
      .map((c) => c.name);

    return {
      checks,
      valid: missing.length === 0,
      missing,
    };
  }

  private async checkNode(): Promise<EnvironmentCheck> {
    try {
      const result = await execCommand("node --version", ".");
      return {
        name: "Node.js",
        installed: true,
        version: result.stdout.trim(),
        required: true,
      };
    } catch {
      return {
        name: "Node.js",
        installed: false,
        required: true,
      };
    }
  }

  private async checkGit(): Promise<EnvironmentCheck> {
    try {
      const result = await execCommand("git --version", ".");
      return {
        name: "Git",
        installed: true,
        version: result.stdout.trim(),
        required: true,
      };
    } catch {
      return {
        name: "Git",
        installed: false,
        required: true,
      };
    }
  }

  private async checkPackageManager(): Promise<EnvironmentCheck> {
    try {
      const result = await execCommand("pnpm --version", ".");
      return {
        name: "pnpm",
        installed: true,
        version: result.stdout.trim(),
        required: true,
      };
    } catch {
      try {
        const result = await execCommand("npm --version", ".");
        return {
          name: "npm",
          installed: true,
          version: result.stdout.trim(),
          required: true,
        };
      } catch {
        return {
          name: "Package Manager",
          installed: false,
          required: true,
        };
      }
    }
  }
}
