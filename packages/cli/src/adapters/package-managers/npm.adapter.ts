/**
 * npm package manager adapter.
 *
 * @module adapters/package-managers/npm
 */

import { execCommand } from "../../utils/utils.exec.js";
import type { PackageManager } from "./packageManager.type.js";

/**
 * npm adapter implementation.
 */
export class NpmAdapter implements PackageManager {
  readonly name = "npm";

  async isInstalled(): Promise<boolean> {
    try {
      await execCommand("npm", ["--version"], ".");
      return true;
    } catch {
      return false;
    }
  }

  async install(projectPath: string): Promise<void> {
    await execCommand("npm", ["install"], projectPath);
  }

  async add(projectPath: string, packages: readonly string[]): Promise<void> {
    if (packages.length === 0) return;
    await execCommand("npm", ["install", ...packages], projectPath);
  }

  async addDev(
    projectPath: string,
    packages: readonly string[],
  ): Promise<void> {
    if (packages.length === 0) return;
    await execCommand("npm", ["install", "-D", ...packages], projectPath);
  }

  async run(projectPath: string, script: string): Promise<void> {
    await execCommand("npm", ["run", script], projectPath);
  }

  getInstallCommand(): string {
    return "npm install";
  }
}
