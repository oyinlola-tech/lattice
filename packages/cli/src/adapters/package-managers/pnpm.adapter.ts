/**
 * pnpm package manager adapter.
 *
 * @module adapters/package-managers/pnpm
 */

import { execCommand } from "../../utils/utils.exec.js";
import type { PackageManager } from "./packageManager.type.js";

/**
 * pnpm adapter implementation.
 */
export class PnpmAdapter implements PackageManager {
  readonly name = "pnpm";

  async isInstalled(): Promise<boolean> {
    try {
      await execCommand("pnpm --version", ".");
      return true;
    } catch {
      return false;
    }
  }

  async install(projectPath: string): Promise<void> {
    await execCommand("pnpm install", projectPath);
  }

  async add(projectPath: string, packages: readonly string[]): Promise<void> {
    if (packages.length === 0) return;
    await execCommand(`pnpm add ${packages.join(" ")}`, projectPath);
  }

  async addDev(
    projectPath: string,
    packages: readonly string[],
  ): Promise<void> {
    if (packages.length === 0) return;
    await execCommand(`pnpm add -D ${packages.join(" ")}`, projectPath);
  }

  async run(projectPath: string, script: string): Promise<void> {
    await execCommand(`pnpm run ${script}`, projectPath);
  }

  getInstallCommand(): string {
    return "pnpm install";
  }
}
