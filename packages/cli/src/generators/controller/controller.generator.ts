/**
 * @oyinlola141/lattice-cli — Controller Generator
 */

import { writeFileTree } from "../../utils/utils.fileSystem.js";
import { CLIGenerationError, CLIValidationError } from "../../errors/index.js";
import { normalizeName } from "../../utils/utils.name.js";

export interface GenerateControllerOptions {
  readonly name: string;
  readonly service?: string;
}

export async function generateController(
  options: GenerateControllerOptions,
  cwd: string,
): Promise<string[]> {
  const name = normalizeName(options.name);
  const nameCamel = name
    .replace(/-([a-z])/g, (_m: string, c: string) => c.toUpperCase())
    .replace(/^./, (c: string) => c.toUpperCase());

  const files: Record<string, string> = {
    [`controllers/${name}.controller.ts`]: `import { createLogger } from "@oyinlola141/lattice-logger";

export class ${nameCamel}Controller {
  private readonly logger = createLogger({ name: "${name}-controller" });

  async handle(request: Request): Promise<Response> {
    // TODO: Implement controller logic
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  }
}
`,

    [`controllers/index.ts`]: `export { ${nameCamel}Controller } from "./${name}.controller.js";
`,
  };

  try {
    await writeFileTree(cwd, files);
    return Object.keys(files);
  } catch (error) {
    throw new CLIGenerationError(`Failed to generate controller: ${name}`, error);
  }
}
