/**
 * zudo-cli — Info Command
 *
 * The `zudo info` command.
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

    const zudoDeps = Object.entries(pkg.dependencies ?? {})
      .filter(([name]) => name.startsWith("@zudo/"))
      .sort(([a], [b]) => a.localeCompare(b));

    context.logger.info("Zudo Project Info");
    context.logger.info("");
    context.logger.info(`Project: ${projectName}`);
    context.logger.info(`Version: ${pkg.version ?? "0.0.0"}`);
    const hasPnpm = existsSync(join(context.cwd, "pnpm-lock.yaml"));
    const hasYarn = existsSync(join(context.cwd, "yarn.lock"));
    const packageManager = hasPnpm ? "pnpm" : hasYarn ? "yarn" : "npm";
    context.logger.info(`Package Manager: ${packageManager}`);
    context.logger.info("");
    context.logger.info("Zudo Dependencies:");

    if (zudoDeps.length === 0) {
      context.logger.info("  (none)");
    } else {
      for (const [name, version] of zudoDeps) {
        context.logger.info(`  ${name}: ${version}`);
      }
    }
  } catch {
    context.logger.info("Zudo CLI Info");
    context.logger.info("");
    context.logger.info("Not in a Zudo project directory.");
    context.logger.info("");
    context.logger.info(
      "Run `zudo create <project-name>` to create a new project.",
    );
  }
}
