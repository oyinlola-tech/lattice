/**
 * zudolib-cli — Framework Scaffolder Utilities
 *
 * Utilities for invoking official framework scaffolders.
 */

import { execCommand } from "../utils/utils.exec.js";
import { writeFileTree } from "../utils/utils.fileSystem.js";

export interface ScaffolderOptions {
  readonly command: string;
  readonly args: readonly string[];
  readonly targetPath: string;
  readonly fallbackFiles: Record<string, string>;
}

export async function scaffoldWithFallback(
  options: ScaffolderOptions,
): Promise<boolean> {
  try {
    await execCommand(
      options.command,
      Array.from(options.args),
      options.targetPath,
    );
    return true;
  } catch {
    await writeFileTree(options.targetPath, options.fallbackFiles);
    return false;
  }
}
