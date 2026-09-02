/**
 * bun package manager adapter.
 *
 * @module adapters/package-managers/bun
 */

import { execCommand } from "../../utils/utils.exec.js";
import type { PackageManager } from "./packageManager.type.js";

/**
 * bun adapter implementation.
 */
export class BunAdapter implements PackageManager {
  readonly name = "bun";

  async isInstalled(): Promise<boolean> {
    try {
      await execCommand("bun --version", ".");
      return true;
    } catch {
      return false;
    }
  }

  async install(projectPath: string): Promise<void> {
    await execCommand("bun install", projectPath);
  }

  async add(projectPath: string, packages: readonly string[]): Promise<void> {
    if (packages.length === 0) return;
    await execCommand(`bun add ${packages.join(" ")}`, projectPath);
  }

  async addDev(
    projectPath: string,
    packages: readonly string[],
  ): Promise<void> {
    if (packages.length === 0) return;
    await execCommand(`bun add -d ${packages.join(" ")}`, projectPath);
  }

  async run(projectPath: string, script: string): Promise<void> {
    await execCommand(`bun run ${script}`, projectPath);
  }

  getInstallCommand(): string {
    return "bun install";
  }
}
