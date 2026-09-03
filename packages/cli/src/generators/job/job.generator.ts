/**
 * zudo-cli — Job Generator
 *
 * Generates job files.
 */

import { writeFileTree } from "../../utils/utils.fileSystem.js";

export interface GenerateJobOptions {
  readonly name: string;
  readonly basePath: string;
}

export async function generateJob(
  options: GenerateJobOptions,
  cwd: string,
): Promise<string[]> {
  const files: Record<string, string> = {
    [`${options.basePath}/jobs/${options.name}.job.ts`]: `/**
 * ${options.name} job.
 */

export async function ${options.name}Job() {
  // Job implementation
}
`,
  };

  await writeFileTree(cwd, files);
  return Object.keys(files);
}
