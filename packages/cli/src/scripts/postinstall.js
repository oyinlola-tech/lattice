/**
 * @oyinlola141/lattice-cli — Postinstall Version Check
 *
 * Runs after `npm install -g` to warn users if a newer version is available.
 */

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageJsonPath = join(__dirname, "package.json");

function getInstalledVersion(): string {
  try {
    const content = readFileSync(packageJsonPath, "utf-8");
    const pkg = JSON.parse(content) as { version?: string };
    return pkg.version ?? "unknown";
  } catch {
    return "unknown";
  }
}

async function checkLatestVersion(packageName: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(
      `https://registry.npmjs.org/latest/${packageName}`,
      { signal: controller.signal },
    );
    clearTimeout(timeout);

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as { version?: string };
    return data.version ?? null;
  } catch {
    return null;
  }
}

async function main(): Promise<void> {
  const installed = getInstalledVersion();
  const latest = await checkLatestVersion("@oyinlola141/lattice-cli");

  if (latest && latest !== installed) {
    console.log(
      `\n  lattice ${installed} is installed, but version ${latest} is available.`,
    );
    console.log(
      `   Run: npm install -g @oyinlola141/lattice-cli@latest\n`,
    );
  }
}

main().catch(() => {});
