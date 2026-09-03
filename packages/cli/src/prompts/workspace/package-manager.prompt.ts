/**
 * zudolib-cli — Package Manager Prompt
 *
 * Prompts for package manager selection.
 */

import * as p from "@clack/prompts";
import type { PackageManagerType } from "../../types/projectConfiguration.type.js";

export async function promptPackageManager(
  overrides?: PackageManagerType,
): Promise<PackageManagerType> {
  const value =
    overrides ??
    (await p.select({
      message: "Select package manager",
      options: [
        { value: "pnpm", label: "pnpm" },
        { value: "npm", label: "npm" },
        { value: "yarn", label: "Yarn" },
        { value: "bun", label: "Bun" },
      ],
      initialValue: "pnpm",
    }));

  if (p.isCancel(value)) {
    p.cancel("Operation cancelled.");
    process.exit(0);
  }

  return value;
}
