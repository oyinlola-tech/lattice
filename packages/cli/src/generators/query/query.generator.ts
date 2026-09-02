/**
 * @oyinlola141/lattice-cli — Query Generator
 *
 * Generates a CQRS query with handler.
 */

import { writeFileTree } from "../../utils/utils.fileSystem.js";
import { CLIGenerationError, CLIValidationError } from "../../errors/index.js";
import { normalizeName } from "../../utils/utils.name.js";

export interface GenerateQueryOptions {
  readonly name: string;
  readonly service?: string;
}

export async function generateQuery(
  options: GenerateQueryOptions,
  cwd: string,
): Promise<string[]> {
  const name = normalizeName(options.name);
  const nameCamel = name
    .replace(/-([a-z])/g, (_m: string, c: string) => c.toUpperCase())
    .replace(/^./, (c: string) => c.toUpperCase());
  const service = options.service ?? "default";
  const servicePath = `services/${service}`;

  const files: Record<string, string> = {
    [`${servicePath}/queries/${name}/${name}.query.ts`]: `import type { BaseQuery } from "@oyinlola141/lattice-cqrs";

export interface ${nameCamel}QueryPayload {
  readonly [key: string]: unknown;
}

export class ${nameCamel}Query implements BaseQuery<${nameCamel}QueryPayload> {
  readonly queryName = "${name}";

  constructor(public readonly payload: ${nameCamel}QueryPayload) {}
}
`,

    [`${servicePath}/queries/${name}/${name}.handler.ts`]: `import type { QueryHandler, QueryResult } from "@oyinlola141/lattice-cqrs";
import { ${nameCamel}Query } from "./${name}.query.js";

export class ${nameCamel}QueryHandler implements QueryHandler<${nameCamel}Query> {
  async handle(query: ${nameCamel}Query): Promise<QueryResult> {
    // TODO: Implement query logic
    return { success: true, data: null };
  }
}
`,

    [`${servicePath}/queries/${name}/index.ts`]: `export { ${nameCamel}Query } from "./${name}.query.js";
export { ${nameCamel}QueryHandler } from "./${name}.handler.js";
`,
  };

  try {
    await writeFileTree(cwd, files);
    return Object.keys(files);
  } catch (error) {
    throw new CLIGenerationError(
      `Failed to generate query: ${name} for service: ${service}`,
      error,
    );
  }
}
