/**
 * zudolib-cli — Info Command
 *
 * The `zudolib info` command.
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

    const zudolibDeps = Object.entries(pkg.dependencies ?? {})
      .filter(([name]) => name.startsWith("@zudoliblib/"))
      .sort(([a], [b]) => a.localeCompare(b));

    context.logger.info("Zudolib Project Info");
    context.logger.info("");
    context.logger.info(`Project: ${projectName}`);
    context.logger.info(`Version: ${pkg.version ?? "0.0.0"}`);
    const hasPnpm = existsSync(join(context.cwd, "pnpm-lock.yaml"));
    const hasYarn = existsSync(join(context.cwd, "yarn.lock"));
    const packageManager = hasPnpm ? "pnpm" : hasYarn ? "yarn" : "npm";
    context.logger.info(`Package Manager: ${packageManager}`);
    context.logger.info("");
    context.logger.info("Zudolib Dependencies:");

    if (zudolibDeps.length === 0) {
      context.logger.info("  (none)");
    } else {
      for (const [name, version] of zudolibDeps) {
        context.logger.info(`  ${name}: ${version}`);
      }
    }
  } catch {
    context.logger.info("Zudolib CLI Info");
    context.logger.info("");
    context.logger.info("Not in a Zudolib project directory.");
    context.logger.info("");
    context.logger.info(
      "Run `zudolib create <project-name>` to create a new project.",
    );
  }
}
