/**
 * @oyinlola141/lattice-cli — Model Generator
 *
 * Generates model files.
 */

import { writeFileTree } from "../../utils/utils.fileSystem.js";

export interface GenerateModelOptions {
  readonly name: string;
  readonly basePath: string;
}

export async function generateModel(
  options: GenerateModelOptions,
  cwd: string,
): Promise<string[]> {
  const files: Record<string, string> = {
    [`${options.basePath}/models/${options.name}.model.ts`]: `/**
 * ${options.name} model.
 */

export interface ${options.name}Model {
  readonly id: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
`,
  };

  await writeFileTree(cwd, files);
  return Object.keys(files);
}
