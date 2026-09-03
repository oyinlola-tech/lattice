/**
 * zudolib-cli — Validator Generator
 *
 * Generates validator files.
 */

import { writeFileTree } from "../../utils/utils.fileSystem.js";

export interface GenerateValidatorOptions {
  readonly name: string;
  readonly basePath: string;
}

export async function generateValidator(
  options: GenerateValidatorOptions,
  cwd: string,
): Promise<string[]> {
  const files: Record<string, string> = {
    [`${options.basePath}/validators/${options.name}.validator.ts`]: `/**
 * ${options.name} validator.
 */

export function validate${options.name}(input: unknown): boolean {
  return true;
}
`,
  };

  await writeFileTree(cwd, files);
  return Object.keys(files);
}
