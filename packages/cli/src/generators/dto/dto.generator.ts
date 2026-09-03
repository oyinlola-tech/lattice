/**
 * zudo-cli — DTO Generator
 *
 * Generates DTO files.
 */

import { writeFileTree } from "../../utils/utils.fileSystem.js";

export interface GenerateDtoOptions {
  readonly name: string;
  readonly basePath: string;
}

export async function generateDto(
  options: GenerateDtoOptions,
  cwd: string,
): Promise<string[]> {
  const files: Record<string, string> = {
    [`${options.basePath}/dtos/${options.name}.dto.ts`]: `/**
 * ${options.name} DTO.
 */

export interface Create${options.name}Dto {
  readonly name: string;
}
`,
  };

  await writeFileTree(cwd, files);
  return Object.keys(files);
}
