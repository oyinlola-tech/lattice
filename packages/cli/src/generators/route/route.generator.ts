/**
 * zudojs-cli — Route Generator
 *
 * Generates route files.
 */

import { writeFileTree } from "../../utils/utils.fileSystem.js";

export interface GenerateRouteOptions {
  readonly name: string;
  readonly basePath: string;
}

export async function generateRoute(
  options: GenerateRouteOptions,
  cwd: string,
): Promise<string[]> {
  const files: Record<string, string> = {
    [`${options.basePath}/routes/${options.name}.route.ts`]: `/**
 * ${options.name} route.
 */

export const ${options.name}Route = {
  path: "/${options.name.toLowerCase()}",
  method: "GET",
  handler: async () => {
    return { message: "${options.name}" };
  },
};
`,
  };

  await writeFileTree(cwd, files);
  return Object.keys(files);
}
