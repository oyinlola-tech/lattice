/**
 * @oyinlola141/lattice-cli — Info Command
 *
 * The `lattice info` command.
 */

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import type { CLIContext } from "../cliType/cliType.type.js";

export async function runInfoCommand(context: CLIContext): Promise<void> {
  const pkgPath = join(context.cwd, "package.json");

  let projectName = "unknown";

  try {
    const pkg = JSON.parse(readFileSync(pkgPath, "utf-8")) as {
      name?: string;
      version?: string;
      dependencies?: Record<string, string>;
    };

    projectName = pkg.name ?? "unknown";

    const latticeDeps = Object.entries(pkg.dependencies ?? {})
      .filter(([name]) => name.startsWith("@oyinlola141/lattice-"))
      .sort(([a], [b]) => a.localeCompare(b));

    context.logger.info("Lattice Project Info");
    context.logger.info("");
    context.logger.info(`Project: ${projectName}`);
    context.logger.info(`Version: ${pkg.version ?? "0.0.0"}`);
    const hasPnpm = existsSync(join(context.cwd, "pnpm-lock.yaml"));
    const hasYarn = existsSync(join(context.cwd, "yarn.lock"));
    const packageManager = hasPnpm ? "pnpm" : hasYarn ? "yarn" : "npm";
    context.logger.info(`Package Manager: ${packageManager}`);
    context.logger.info("");
    context.logger.info("Lattice Dependencies:");

    if (latticeDeps.length === 0) {
      context.logger.info("  (none)");
    } else {
      for (const [name, version] of latticeDeps) {
        context.logger.info(`  ${name}: ${version}`);
      }
    }
  } catch {
    context.logger.info("Lattice CLI Info");
    context.logger.info("");
    context.logger.info("Not in a Lattice project directory.");
    context.logger.info("");
    context.logger.info(
      "Run `lattice create <project-name>` to create a new project.",
    );
  }
}
