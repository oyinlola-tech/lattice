/**
 * @oyinlola141/lattice-cli — Middleware Generator
 *
 * Generates middleware files.
 */

import { writeFileTree } from "../../utils/utils.fileSystem.js";

export interface GenerateMiddlewareOptions {
  readonly name: string;
  readonly basePath: string;
}

export async function generateMiddleware(
  options: GenerateMiddlewareOptions,
  cwd: string,
): Promise<string[]> {
  const files: Record<string, string> = {
    [`${options.basePath}/middlewares/${options.name}.middleware.ts`]: `/**
 * ${options.name} middleware.
 */

export function ${options.name}Middleware() {
  return async (ctx: any, next: () => Promise<void>) => {
    await next();
  };
}
`,
  };

  await writeFileTree(cwd, files);
  return Object.keys(files);
}
