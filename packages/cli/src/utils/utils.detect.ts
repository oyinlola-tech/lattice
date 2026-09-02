import { readFile } from "node:fs/promises";
import { join } from "node:path";

export async function detectArchitecture(cwd: string): Promise<string | null> {
  try {
    const configPath = join(cwd, "lattice.config.json");
    const content = await readFile(configPath, "utf-8");
    const config = JSON.parse(content) as { architecture?: string };
    return config.architecture ?? null;
  } catch {
    return null;
  }
}
