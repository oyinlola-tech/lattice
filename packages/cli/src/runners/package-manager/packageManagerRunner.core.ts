/**
 * @oyinlola141/lattice-cli — Package Manager Runner
 *
 * Runner for package manager operations (install, add, remove, run).
 */

import { execCommand } from "../../utils/utils.exec.js";

export interface PackageManagerRunOptions {
  readonly cwd: string;
  readonly args: readonly string[];
}

export class PackageManagerRunner {
  constructor(private readonly manager: string) {}

  async install(cwd: string): Promise<void> {
    const args =
      this.manager === "pnpm"
        ? ["install"]
        : this.manager === "yarn"
          ? ["install"]
          : this.manager === "bun"
            ? ["install"]
            : ["install"];

    await execCommand(this.manager, args, cwd);
  }

  async add(
    packages: readonly string[],
    options: PackageManagerRunOptions,
  ): Promise<void> {
    const args =
      this.manager === "pnpm"
        ? ["add", ...packages]
        : this.manager === "yarn"
          ? ["add", ...packages]
          : this.manager === "bun"
            ? ["add", ...packages]
            : ["install", ...packages];

    await execCommand(this.manager, args, options.cwd);
  }

  async addDev(
    packages: readonly string[],
    options: PackageManagerRunOptions,
  ): Promise<void> {
    const args =
      this.manager === "pnpm"
        ? ["add", "-D", ...packages]
        : this.manager === "yarn"
          ? ["add", "-D", ...packages]
          : this.manager === "bun"
            ? ["add", "-D", ...packages]
            : ["install", "--save-dev", ...packages];

    await execCommand(this.manager, args, options.cwd);
  }

  async run(
    script: string,
    options: PackageManagerRunOptions,
  ): Promise<void> {
    const args =
      this.manager === "pnpm"
        ? ["run", script]
        : this.manager === "yarn"
          ? [script]
          : this.manager === "bun"
            ? ["run", script]
            : ["run", script];

    await execCommand(this.manager, args, options.cwd);
  }
}
