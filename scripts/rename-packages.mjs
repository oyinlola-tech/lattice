/**
 * One-off rename script:
 * @oyinlola141/lattice-*  ->  @zudo/*
 * @oyinlola141/lattice-cli ->  zudo-cli
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

const packages = [
  "adapters",
  "api",
  "auth",
  "cache",
  "cli",
  "config",
  "constants",
  "container",
  "core",
  "cqrs",
  "crypto",
  "database",
  "docs",
  "errors",
  "events",
  "feature-flags",
  "http",
  "lifecycle",
  "logger",
  "messaging",
  "middleware",
  "observability",
  "openapi",
  "permissions",
  "plugins",
  "queue",
  "rpc",
  "runtime",
  "scheduler",
  "schema",
  "security",
  "serialization",
  "storage",
  "tenancy",
  "testing",
  "transactions",
  "types",
  "validation",
];

const renameMap = new Map();
for (const name of packages) {
  if (name === "cli") {
    renameMap.set(`@oyinlola141/lattice-${name}`, "zudo-cli");
  } else {
    renameMap.set(`@oyinlola141/lattice-${name}`, `@zudo/${name}`);
  }
}

function replaceInText(text) {
  let result = text;
  for (const [oldName, newName] of renameMap) {
    result = result.replaceAll(oldName, newName);
  }
  return result;
}

function processJsonFile(filePath) {
  const content = readFileSync(filePath, "utf-8");
  const updated = replaceInText(content);
  if (updated !== content) {
    writeFileSync(filePath, updated, "utf-8");
    console.log(`Updated: ${filePath}`);
  }
}

function processTextFile(filePath) {
  const content = readFileSync(filePath, "utf-8");
  const updated = replaceInText(content);
  if (updated !== content) {
    writeFileSync(filePath, updated, "utf-8");
    console.log(`Updated: ${filePath}`);
  }
}

// Update package.json names
for (const name of packages) {
  const pkgPath = join(root, "packages", name, "package.json");
  processJsonFile(pkgPath);
}

// Update pnpm-workspace.yaml
processTextFile(join(root, "pnpm-workspace.yaml"));

// Update all TS/JS/MD/YAML files
const files = execSync(
  `grep -rl '@oyinlola141/lattice-' --include='*.ts' --include='*.js' --include='*.md' --include='*.yml' --include='*.json' .`,
  { encoding: "utf-8", cwd: root },
)
  .split("\n")
  .filter(Boolean);

for (const file of files) {
  const ext = file.split(".").pop();
  if (ext === "json") {
    processJsonFile(file);
  } else {
    processTextFile(file);
  }
}

console.log(`\nUpdated ${files.length} files`);
