import { existsSync } from "node:fs";
import { join } from "node:path";

export function findProjectRoot(
  startDir: string = process.cwd(),
): string | null {
  let dir = startDir;

  while (true) {
    if (existsSync(join(dir, "zudojs.config.ts"))) {
      return dir;
    }
    if (existsSync(join(dir, "package.json"))) {
      return dir;
    }

    const parent = join(dir, "..");
    if (parent === dir) {
      return null;
    }
    dir = parent;
  }
}

export function resolveProjectPath(cwd: string, name: string): string {
  return join(cwd, name);
}
