/**
 * zudolib-cli — Event Generator
 *
 * Generates event files.
 */

import { writeFileTree } from "../../utils/utils.fileSystem.js";

export interface GenerateEventOptions {
  readonly name: string;
  readonly basePath: string;
}

export async function generateEvent(
  options: GenerateEventOptions,
  cwd: string,
): Promise<string[]> {
  const files: Record<string, string> = {
    [`${options.basePath}/events/${options.name}.event.ts`]: `/**
 * ${options.name} event.
 */

export interface ${options.name}Event {
  readonly type: "${options.name}";
  readonly timestamp: Date;
}
`,
  };

  await writeFileTree(cwd, files);
  return Object.keys(files);
}
