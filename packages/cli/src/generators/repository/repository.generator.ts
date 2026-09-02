/**
 * @oyinlola141/lattice-cli — Repository Generator
 */

import { writeFileTree } from "../../utils/utils.fileSystem.js";
import { CLIGenerationError, CLIValidationError } from "../../errors/index.js";
import { normalizeName } from "../../utils/utils.name.js";

export interface GenerateRepositoryOptions {
  readonly name: string;
}

export async function generateRepository(
  options: GenerateRepositoryOptions,
  cwd: string,
): Promise<string[]> {
  const name = normalizeName(options.name);
  const nameCamel = name
    .replace(/-([a-z])/g, (_m: string, c: string) => c.toUpperCase())
    .replace(/^./, (c: string) => c.toUpperCase());

  const files: Record<string, string> = {
    [`repositories/${name}.repository.ts`]: `import { createLogger } from "@oyinlola141/lattice-logger";

export class ${nameCamel}Repository {
  private readonly logger = createLogger({ name: "${name}-repository" });

  async findById(id: string): Promise<unknown | null> {
    // TODO: Implement repository logic
    return null;
  }

  async findAll(): Promise<unknown[]> {
    // TODO: Implement repository logic
    return [];
  }
}
`,

    [`repositories/index.ts`]: `export { ${nameCamel}Repository } from "./${name}.repository.js";
`,
  };

  try {
    await writeFileTree(cwd, files);
    return Object.keys(files);
  } catch (error) {
    throw new CLIGenerationError(`Failed to generate repository: ${name}`, error);
  }
}
