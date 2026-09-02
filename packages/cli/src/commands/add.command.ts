/**
 * @oyinlola141/lattice-cli — Add Command
 *
 * The `lattice add` command for adding feature packages.
 */

import { join, dirname } from "node:path";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import type { CLIContext } from "../cliType/cliType.type.js";
import { execCommand } from "../utils/utils.exec.js";
import { CLIValidationError, CLIGenerationError } from "../errors/index.js";

const FEATURE_PACKAGES: Readonly<Record<string, readonly string[]>> = {
  database: ["@oyinlola141/lattice-database"],
  queue: ["@oyinlola141/lattice-queue"],
  messaging: ["@oyinlola141/lattice-messaging"],
  openapi: ["@oyinlola141/lattice-openapi"],
  observability: ["@oyinlola141/lattice-observability"],
  security: ["@oyinlola141/lattice-security"],
};

export async function runAddCommand(context: CLIContext): Promise<void> {
  const feature = context.values.feature as string | undefined;

  if (!feature) {
    throw new CLIValidationError(
      "Feature name is required. Available: database, queue, messaging, openapi, observability, security",
    );
  }

  const packages = FEATURE_PACKAGES[feature];

  if (!packages) {
    throw new CLIValidationError(
      `Unknown feature: "${feature}". Available: ${Object.keys(FEATURE_PACKAGES).join(", ")}`,
    );
  }

  context.logger.info(`Adding feature: ${feature}`);
  context.logger.info(`Packages: ${packages.join(", ")}`);

  try {
    const { manager, rootPkg, isWorkspace } = detectPackageManager();
    const pkgPath = join(context.cwd, rootPkg);
    const version = isWorkspace ? "workspace:*" : readLatticeVersion();

    if (!existsSync(pkgPath)) {
      throw new CLIGenerationError(`Could not find package.json at ${pkgPath}`);
    }

    const pkgContent = JSON.parse(readFileSync(pkgPath, "utf-8")) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
      lattice?: Record<string, unknown>;
    };

    pkgContent.dependencies ??= {};
    pkgContent.lattice ??= {
      features: [],
    };

    const latticeConfig = pkgContent.lattice as {
      features: string[];
    };

    const features = new Set(latticeConfig.features);
    if (!features.has(feature)) {
      features.add(feature);
      latticeConfig.features = [...features];
    }

    for (const pkg of packages) {
      if (!(pkg in pkgContent.dependencies)) {
        pkgContent.dependencies[pkg] = version;
      }
    }

    writeFileSync(pkgPath, JSON.stringify(pkgContent, null, 2) + "\n");

    context.logger.info(`Updated ${rootPkg} with new dependencies.`);

    updateLatticeConfig(context.cwd, feature);

    if (context.values["skip-install"] !== true) {
      context.logger.info(`Installing dependencies with ${manager}...`);
      await execCommand(`${manager} install`, context.cwd);
    }

    context.logger.info(`Feature "${feature}" added successfully.`);
    context.logger.info(`Next steps:`);
    context.logger.info(`  Configure in src/config/${feature}.config.ts`);
  } catch (error) {
    if (error instanceof CLIValidationError) {
      throw error;
    }
    const message = error instanceof Error ? error.message : String(error);
    context.logger.error(`Failed to add feature: ${feature} - ${message}`);
    throw new CLIGenerationError(`Failed to add feature: ${feature}: ${message}`, error);
  }
}

function detectPackageManager(): {
  manager: string;
  rootPkg: string;
  isWorkspace: boolean;
} {
  if (existsSync("pnpm-workspace.yaml")) {
    return { manager: "pnpm", rootPkg: "package.json", isWorkspace: true };
  }

  if (existsSync("yarn.lock")) {
    return { manager: "yarn", rootPkg: "package.json", isWorkspace: true };
  }

  if (existsSync("lerna.json")) {
    return { manager: "npm", rootPkg: "package.json", isWorkspace: true };
  }

  return { manager: "npm", rootPkg: "package.json", isWorkspace: false };
}

function readLatticeVersion(): string {
  try {
    const rootPkg = join(process.cwd(), "package.json");
    if (existsSync(rootPkg)) {
      const pkg = JSON.parse(readFileSync(rootPkg, "utf-8")) as {
        version?: string;
      };
      return pkg.version ?? "latest";
    }
  } catch {
    // ignore
  }
  return "latest";
}

function updateLatticeConfig(cwd: string, feature: string): void {
  const configPath = join(cwd, "lattice.config.ts");
  if (!existsSync(configPath)) return;

  let content = readFileSync(configPath, "utf-8");

  const featureMap: Record<string, string> = {
    database: "database",
    queue: "queue",
    messaging: "events",
    openapi: "openapi",
    observability: "observability",
    security: "security",
  };

  const configKey = featureMap[feature];
  if (!configKey) return;

  const pattern = /(export\s+default\s+defineConfig\(\{[\s\S]*?)\n\}\);/;
  const match = content.match(pattern);
  if (!match) return;

  const featureBlock = `\n  ${configKey}: {\n    enabled: true,\n  },`;

  if (content.includes(`${configKey}:`)) {
    content = content.replace(
      new RegExp(`${configKey}:\\s*\\{[^}]*\\}`),
      `${configKey}: {\n    enabled: true,\n  }`,
    );
  } else {
    content = content.replace(
      pattern,
      `$1${featureBlock}\n});`,
    );
  }
  writeFileSync(configPath, content);
}
