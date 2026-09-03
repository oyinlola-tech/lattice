import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const packagesDir = join(__dirname, "../../packages");

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

function packageNameToKey(name) {
  return name
    .replace(/^@oyinlola141\/zudolib-/, "")
    .replace(/^@zudolib\//, "")
    .replace(/^zudolib-/, "")
    .replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

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

describe("Architecture Boundaries", () => {
  const packages = getPackages();

  it("has no wildcard @zudolib/* dependency versions", () => {
    const errors = [];

    for (const pkg of packages) {
      const allDeps = { ...pkg.dependencies, ...pkg.peerDependencies };

      for (const [depName, version] of Object.entries(allDeps)) {
        if (depName.startsWith("@zudolib/") && version === "*") {
          errors.push(`${pkg.name}: ${depName}@${version}`);
        }
      }
    }

    expect(errors, `Wildcard versions found:\n${errors.join("\n")}`).toEqual(
      [],
    );
  });

  it("has no tier violations in regular dependencies", () => {
    const errors = [];

    for (const pkg of packages) {
      const pkgKey = packageNameToKey(pkg.name);
      const pkgTier = TIERS[pkgKey];

      if (pkgTier === undefined) {
        errors.push(`Unknown tier for ${pkg.name}`);
        continue;
      }

      for (const depName of Object.keys(pkg.dependencies)) {
        if (!depName.startsWith("@zudolib/")) continue;

        const depKey = packageNameToKey(depName);
        const depTier = TIERS[depKey];

        if (depTier === undefined) {
          errors.push(`Unknown dependency tier: ${pkg.name} → ${depName}`);
          continue;
        }

        if (depTier > pkgTier) {
          errors.push(
            `${pkg.name} (tier ${pkgTier}) → ${depName} (tier ${depTier})`,
          );
        }
      }
    }

    expect(errors, `Tier violations found:\n${errors.join("\n")}`).toEqual([]);
  });

  it("has no circular dependencies", () => {
    const graph = new Map();
    const visited = new Set();
    const recursionStack = new Set();
    const cycles = [];

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

    expect(
      cycles,
      `Circular dependencies found:\n${cycles.join("\n")}`,
    ).toEqual([]);
  });

  it("all packages have known tiers", () => {
    const unknown = [];

    for (const pkg of packages) {
      const key = packageNameToKey(pkg.name);
      if (TIERS[key] === undefined) {
        unknown.push(`${pkg.name} (key: ${key})`);
      }
    }

    expect(unknown, `Unknown tiers:\n${unknown.join("\n")}`).toEqual([]);
  });
});
