/**
 * @zudo/cli — Postinstall Version Check
 *
 * Runs after `npm install -g` to warn users if a newer version is available.
 */

const fs = require("node:fs");
const path = require("node:path");

const packageJsonPath = path.join(__dirname, "..", "..", "package.json");

function getInstalledVersion() {
  try {
    const content = fs.readFileSync(packageJsonPath, "utf-8");
    const pkg = JSON.parse(content);
    return pkg.version || "unknown";
  } catch {
    return "unknown";
  }
}

async function checkLatestVersion(packageName) {
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

    const data = await response.json();
    return data.version || null;
  } catch {
    return null;
  }
}

async function main() {
  const installed = getInstalledVersion();
  const latest = await checkLatestVersion("@zudo/cli");

  if (latest && latest !== installed) {
    console.log(
      `\n  zudo ${installed} is installed, but version ${latest} is available.`,
    );
    console.log(
      `   Run: npm install -g @zudo/cli@latest\n`,
    );
  }
}

main().catch(() => {});
