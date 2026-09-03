/**
 * Architecture boundary checker for Zudolib.
 *
 * Validates:
 * 1. No package depends on a package from a higher tier.
 * 2. No circular dependencies exist.
 * 3. All @zudolib/* dependencies use exact versions (not wildcards).
 *
 * Run with: node architect:check.js
 */

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const packagesDir = join(__dirname, "..", "packages");

// Tier definitions: each package maps to its allowed dependency tiers.
// Tier 0 = leaf, Tier 1 = foundation, Tier 2 = application, Tier 3 = transport, Tier 4 = dev experience
const TIERS = {
  errors: 0,
  types: 0,
  constants: 1,
  container: 1,
  logger: 1,
  crypto: 1,
  validation: 1,
  schema: 1,
  config: 1,
  middleware: 1,
  serialization: 1,
  events: 1,
  messaging: 1,
  lifecycle: 1,
  transactions: 1,
  permissions: 1,
  featureFlags: 1,
  plugins: 1,
  security: 1,
  tenancy: 1,
  docs: 1,
  cache: 1,
  storage: 1,
  adapters: 1,
  queue: 1,
  scheduler: 1,
  database: 1,
  observability: 1,
  core: 2,
  cqrs: 2,
  auth: 2,
  runtime: 2,
  openapi: 2,
  rpc: 2,
  api: 2,
  http: 3,
  cli: 3,
  testing: 4,
};

// Convert package name to key used in TIERS
function packageNameToKey(name) {
  return name
    .replace(/^@oyinlola141\/zudolib-/, "")
    .replace(/^@zudolib\//, "")
    .replace(/^zudolib-/, "")
    .replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

// Read all package directories
function getPackages() {
  const entries = readdirSync(packagesDir, { withFileTypes: true });
  const packages = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const packageJsonPath = join(packagesDir, entry.name, "package.json");
      if (existsSync(packageJsonPath)) {
        const content = readFileSync(packageJsonPath, "utf-8");
        const pkg = JSON.parse(content);
        packages.push({
          dir: entry.name,
          name: pkg.name,
          dependencies: pkg.dependencies || {},
          peerDependencies: pkg.peerDependencies || {},
        });
      }
    }
  }

  return packages;
}

// Check for wildcard versions
function checkWildcardVersions(packages) {
  const errors = [];

  for (const pkg of packages) {
    const allDeps = { ...pkg.dependencies, ...pkg.peerDependencies };

    for (const [depName, version] of Object.entries(allDeps)) {
      if (depName.startsWith("@zudolib/") && version === "*") {
        errors.push(
          `Wildcard version in ${pkg.name}: ${depName}: "${version}". Use exact version "0.1.0".`,
        );
      }
    }
  }

  return errors;
}

// Check tier violations
function checkTierViolations(packages) {
  const errors = [];

  for (const pkg of packages) {
    const pkgKey = packageNameToKey(pkg.name);
    const pkgTier = TIERS[pkgKey];

    if (pkgTier === undefined) {
      errors.push(`Unknown package tier for ${pkg.name} (key: ${pkgKey})`);
      continue;
    }

    const deps = Object.keys(pkg.dependencies);

    for (const depName of deps) {
      if (!depName.startsWith("@zudolib/")) continue;

      const depKey = packageNameToKey(depName);
      const depTier = TIERS[depKey];

      if (depTier === undefined) {
        errors.push(`Unknown dependency tier: ${pkg.name} → ${depName}`);
        continue;
      }

      if (depTier > pkgTier) {
        errors.push(
          `Tier violation: ${pkg.name} (tier ${pkgTier}) depends on ${depName} (tier ${depTier})`,
        );
      }
    }
  }

  return errors;
}

// Check for circular dependencies
function checkCircularDependencies(packages) {
  const graph = new Map();
  const visited = new Set();
  const recursionStack = new Set();
  const cycles = [];

  // Build adjacency list
  for (const pkg of packages) {
    const deps = Object.keys(pkg.dependencies).filter((d) =>
      d.startsWith("@zudolib/"),
    );
    graph.set(pkg.name, deps);
  }

  function dfs(node, path) {
    visited.add(node);
    recursionStack.add(node);

    const neighbors = graph.get(node) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        dfs(neighbor, [...path, neighbor]);
      } else if (recursionStack.has(neighbor)) {
        const cycleStart = path.indexOf(neighbor);
        const cycle = [...path.slice(cycleStart), neighbor];
        cycles.push(cycle.join(" → "));
      }
    }

    recursionStack.delete(node);
  }

  for (const pkg of packages) {
    if (!visited.has(pkg.name)) {
      dfs(pkg.name, [pkg.name]);
    }
  }

  return cycles;
}

// Main
function main() {
  console.log("Running Zudolib architecture boundary check...\n");

  const packages = getPackages();
  console.log(`Found ${packages.length} packages.\n`);

  const wildcardErrors = checkWildcardVersions(packages);
  const tierViolations = checkTierViolations(packages);
  const cycles = checkCircularDependencies(packages);

  let hasErrors = false;

  if (wildcardErrors.length > 0) {
    console.log("❌ Wildcard Version Errors:");
    for (const error of wildcardErrors) {
      console.log(`  - ${error}`);
    }
    console.log();
    hasErrors = true;
  }

  if (tierViolations.length > 0) {
    console.log("❌ Tier Violations:");
    for (const error of tierViolations) {
      console.log(`  - ${error}`);
    }
    console.log();
    hasErrors = true;
  }

  if (cycles.length > 0) {
    console.log("❌ Circular Dependencies:");
    for (const cycle of cycles) {
      console.log(`  - ${cycle}`);
    }
    console.log();
    hasErrors = true;
  }

  if (!hasErrors) {
    console.log("✅ All architecture checks passed.");
    console.log("   - No wildcard versions");
    console.log("   - No tier violations");
    console.log("   - No circular dependencies");
    process.exit(0);
  } else {
    console.log("❌ Architecture check failed.");
    process.exit(1);
  }
}

main();
