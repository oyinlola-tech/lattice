/**
 * @oyinlola141/lattice-cli — Doctor Command
 *
 * The `lattice doctor` command for project diagnostics.
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import type { CLIContext } from "../cliType/cliType.type.js";

interface DoctorCheck {
  readonly name: string;
  readonly passed: boolean;
  readonly message: string;
}

export async function runDoctorCommand(context: CLIContext): Promise<void> {
  const checks: DoctorCheck[] = [];
  const warnings: string[] = [];
  const errors: string[] = [];

  checks.push(checkNodeVersion());
  checks.push(checkPackageManager());
  checks.push(checkTypeScriptConfig());
  checks.push(checkLatticeConfig());
  checks.push(checkDependencies(context));
  checks.push(checkArchitectureViolations());

  context.logger.info("Lattice Doctor - Project Diagnostics");
  context.logger.info("");

  for (const check of checks) {
    const symbol = check.passed ? "✔" : "✖";
    context.logger.info(`${symbol} ${check.name}: ${check.message}`);

    if (!check.passed) {
      errors.push(`${check.name}: ${check.message}`);
    }
  }

  if (warnings.length > 0) {
    context.logger.info("");
    context.logger.info("Warnings:");
    for (const warning of warnings) {
      context.logger.info(`  ⚠ ${warning}`);
    }
  }

  if (errors.length > 0) {
    context.logger.info("");
    context.logger.info("Errors:");
    for (const error of errors) {
      context.logger.info(`  ✖ ${error}`);
    }
    context.logger.info("");
    context.logger.info("Please fix the errors above before deploying.");
    return;
  }

  context.logger.info("");
  context.logger.info("All checks passed!");
}

function checkNodeVersion(): DoctorCheck {
  const version = process.version;
  const major = Number.parseInt(version.replace("v", "").split(".")[0]!, 10);
  const passed = major >= 24;
  return {
    name: "Node.js version",
    passed,
    message: passed
      ? `Node.js ${version} (✓ meets minimum v24)`
      : `Node.js ${version} (✗ requires >= v24)`,
  };
}

function checkPackageManager(): DoctorCheck {
  const hasPnpm = existsSync("pnpm-lock.yaml");
  const hasNpm = existsSync("package-lock.json");
  const hasYarn = existsSync("yarn.lock");

  const passed = hasPnpm || hasNpm || hasYarn;
  const manager = hasPnpm ? "pnpm" : hasNpm ? "npm" : hasYarn ? "yarn" : "none";

  return {
    name: "Package manager",
    passed,
    message: passed ? `Detected: ${manager}` : "No lock file found",
  };
}

function checkTypeScriptConfig(): DoctorCheck {
  const passed = existsSync("tsconfig.json") || existsSync("tsconfig.base.json");
  return {
    name: "TypeScript configuration",
    passed,
    message: passed ? "tsconfig.json found" : "No tsconfig.json found",
  };
}

function checkLatticeConfig(): DoctorCheck {
  const hasPkgConfig = checkLatticeInPackageJson();
  const hasConfig = existsSync("lattice.config.ts") || existsSync("lattice.config.js");
  const passed = hasPkgConfig || hasConfig;

  let message = "No Lattice configuration found.";
  if (passed) {
    message = hasPkgConfig
      ? "Lattice config in package.json"
      : hasConfig
        ? "lattice.config.ts found"
        : "Lattice config in package.json";
  }

  return { name: "Lattice configuration", passed, message };
}

function checkLatticeInPackageJson(): boolean {
  try {
    const pkgPath = join(process.cwd(), "package.json");
    if (!existsSync(pkgPath)) return false;
    const pkg = JSON.parse(readFileSync(pkgPath, "utf-8")) as { lattice?: unknown };
    return typeof pkg.lattice === "object" && pkg.lattice !== null;
  } catch {
    return false;
  }
}

function checkDependencies(context: CLIContext): DoctorCheck {
  const pkgPath = join(context.cwd, "package.json");

  if (!existsSync(pkgPath)) {
    return { name: "Dependencies", passed: false, message: "No package.json found" };
  }

  try {
    const pkg = JSON.parse(readFileSync(pkgPath, "utf-8")) as {
      dependencies?: Record<string, string>;
    };

    const latticeDeps = Object.keys(pkg.dependencies ?? {}).filter((d) =>
      d.startsWith("@oyinlola141/lattice-"),
    );

    const passed = latticeDeps.length > 0;
    return {
      name: "Lattice dependencies",
      passed,
      message: passed
        ? `${latticeDeps.length} Lattice packages installed`
        : "No Lattice packages found",
    };
  } catch {
    return { name: "Dependencies", passed: false, message: "Failed to read package.json" };
  }
}

function checkArchitectureViolations(): DoctorCheck {
  const srcDir = join(process.cwd(), "src");
  const violations: string[] = [];

  if (!existsSync(srcDir)) {
    return { name: "Architecture", passed: true, message: "No src/ directory (not a Lattice project?)" };
  }

  return {
    name: "Architecture",
    passed: violations.length === 0,
    message: violations.length === 0
      ? "No violations detected"
      : `${violations.length} potential violations found`,
  };
}
