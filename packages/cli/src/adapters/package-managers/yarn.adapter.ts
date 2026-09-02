/**
 * yarn package manager adapter.
 *
 * @module adapters/package-managers/yarn
 */

import { execCommand } from "../../utils/utils.exec.js";
import type { PackageManager } from "./packageManager.type.js";

/**
 * yarn adapter implementation.
 */
export class YarnAdapter implements PackageManager {
  readonly name = "yarn";

  async isInstalled(): Promise<boolean> {
    try {
      await execCommand("yarn --version", ".");
      return true;
    } catch {
      return false;
    }
  }

  async install(projectPath: string): Promise<void> {
    await execCommand("yarn install", projectPath);
  }

  async add(projectPath: string, packages: readonly string[]): Promise<void> {
    if (packages.length === 0) return;
    await execCommand(`yarn add ${packages.join(" ")}`, projectPath);
  }

  async addDev(
    projectPath: string,
    packages: readonly string[],
  ): Promise<void> {
    if (packages.length === 0) return;
    await execCommand(`yarn add -D ${packages.join(" ")}`, projectPath);
  }

  async run(projectPath: string, script: string): Promise<void> {
    await execCommand(`yarn ${script}`, projectPath);
  }

  getInstallCommand(): string {
    return "yarn install";
  }
}
