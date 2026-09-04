/**
 * zudojs-cli — Configuration Resolver
 *
 * Resolves and validates project configuration from multiple sources.
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export interface ResolvedConfiguration {
  readonly projectName: string;
  readonly projectType: string;
  readonly architecture: string;
  readonly packageManager: string;
  readonly database: string;
  readonly api: string;
  readonly frontend?: string;
  readonly frontendArchitecture?: string;
  readonly language?: string;
  readonly features: readonly string[];
}

export class ConfigurationResolver {
  resolve(cwd: string): ResolvedConfiguration | null {
    const configPath = join(cwd, "zudojs.config.ts");

    if (!existsSync(configPath)) {
      return null;
    }

    try {
      const content = readFileSync(configPath, "utf-8");

      return {
        projectName: this.extractValue(content, "name") ?? "unknown",
        projectType: this.extractValue(content, "type") ?? "backend",
        architecture: this.extractValue(content, "architecture") ?? "monolith",
        packageManager: this.extractValue(content, "packageManager") ?? "pnpm",
        database: this.extractValue(content, "provider") ?? "postgresql",
        api: this.extractValue(content, "api") ?? "rest",
        frontend: this.extractValue(content, "framework"),
        frontendArchitecture: this.extractValue(
          content,
          "architecture",
          "frontend",
        ),
        language: this.extractValue(content, "language"),
        features: this.extractArray(content, "features") ?? [],
      };
    } catch {
      return null;
    }
  }

  private extractValue(
    content: string,
    key: string,
    section?: string,
  ): string | undefined {
    let pattern: RegExp;

    if (section) {
      pattern = new RegExp(`${section}[\\s\\S]*?${key}:\\s*["']([^"']+)["']`);
    } else {
      pattern = new RegExp(`${key}:\\s*["']([^"']+)["']`);
    }

    const match = content.match(pattern);
    return match?.[1];
  }

  private extractArray(content: string, key: string): string[] | undefined {
    const pattern = new RegExp(`${key}:\\s*\\[([^\\]]+)\\]`);
    const match = content.match(pattern);

    if (!match || !match[1]) return undefined;

    return match[1]
      .split(",")
      .map((s) => s.trim().replace(/["']/g, ""))
      .filter(Boolean);
  }
}
