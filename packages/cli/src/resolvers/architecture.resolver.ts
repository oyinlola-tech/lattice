import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

export async function detectArchitecture(
  cwd: string,
): Promise<"monolith" | "modular-monolith" | "microservice" | null> {
  const configPath = join(cwd, "lattice.config.ts");

  if (existsSync(configPath)) {
    try {
      const content = await readFile(configPath, "utf-8");
      const match = content.match(/architecture:\s*["'](monolith|modular-monolith|microservice)["']/);
      if (match) {
        return match[1] as "monolith" | "modular-monolith" | "microservice";
      }
    } catch {
      // fall through
    }
  }

  if (existsSync(join(cwd, "pnpm-workspace.yaml"))) {
    const gateway = existsSync(join(cwd, "apps/gateway"));
    if (gateway) return "microservice";
  }

  if (existsSync(join(cwd, "src/modules"))) {
    return "modular-monolith";
  }

  return "monolith";
}
