/**
 * @oyinlola141/lattice-cli — Service Generator
 *
 * Generates a new service with CQRS structure.
 */

import { writeFileTree } from "../../utils/utils.fileSystem.js";
import { CLIGenerationError } from "../../errors/index.js";

export interface GenerateServiceOptions {
  readonly name: string;
}

export async function generateService(
  options: GenerateServiceOptions,
  cwd: string,
): Promise<string[]> {
  const name = options.name.toLowerCase().replace(/[^a-z0-9-]/g, "-");
  const namePascal = name
    .replace(/-([a-z])/g, (_, c) => c.toUpperCase())
    .replace(/^./, (c) => c.toUpperCase());

  const files: Record<string, string> = {
    [`services/${name}/${name}.service.ts`]: `import { createLogger } from "@oyinlola141/lattice-logger";

export class ${namePascal}Service {
  private readonly logger = createLogger({ name: "${name}-service" });

  async initialize(): Promise<void> {
    this.logger.info("${name} service initialized");
  }
}
`,

    [`services/${name}/index.ts`]: `export { ${namePascal}Service } from "./${name}.service.js";
`,

    [`services/${name}/commands/index.ts`]: ``,

    [`services/${name}/queries/index.ts`]: ``,
  };

  try {
    await writeFileTree(cwd, files);
    return Object.keys(files);
  } catch (error) {
    throw new CLIGenerationError(`Failed to generate service: ${name}`, error);
  }
}
