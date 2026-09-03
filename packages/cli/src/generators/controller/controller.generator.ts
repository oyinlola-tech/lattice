/**
 * zudo-cli — Controller Generator
 */

import { writeFileTree } from "../../utils/utils.fileSystem.js";
import { CLIGenerationError, CLIValidationError } from "../../errors/index.js";
import { normalizeName } from "../../utils/utils.name.js";

export interface GenerateControllerOptions {
  readonly name: string;
  readonly service?: string;
  readonly basePath?: string;
}

export async function generateController(
  options: GenerateControllerOptions,
  cwd: string,
): Promise<string[]> {
  const name = normalizeName(options.name);
  const nameCamel = name
    .replace(/-([a-z])/g, (_m: string, c: string) => c.toUpperCase())
    .replace(/^./, (c: string) => c.toUpperCase());
  const basePath = options.basePath ?? "";

  const files: Record<string, string> = {
    [`${basePath ? `${basePath}/` : ""}controllers/${name}.controller.ts`]: `import { createLogger } from "@zudolib/logger";

export class ${nameCamel}Controller {
  private readonly logger = createLogger({ name: "${name}-controller" });

  async handle(request: Request): Promise<Response> {
    this.logger.info("${name} request received", { method: request.method, url: request.url });

    try {
      const body = request.method !== "GET" ? await request.json() : null;

      return Response.json({ ok: true, data: body ?? {} }, { status: 200 });
    } catch (error) {
      this.logger.error("Failed to handle ${name} request", { error });
      return Response.json({ ok: false, error: "Internal server error" }, { status: 500 });
    }
  }
}
`,

    [`${basePath ? `${basePath}/` : ""}controllers/index.ts`]: `export { ${nameCamel}Controller } from "./${name}.controller.js";
`,
  };

  try {
    await writeFileTree(cwd, files);
    return Object.keys(files);
  } catch (error) {
    throw new CLIGenerationError(
      `Failed to generate controller: ${name}`,
      error,
    );
  }
}
