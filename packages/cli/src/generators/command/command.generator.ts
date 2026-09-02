/**
 * @oyinlola141/lattice-cli — Command Generator
 *
 * Generates a CQRS command with handler.
 */

import { writeFileTree } from "../../utils/utils.fileSystem.js";
import { CLIGenerationError, CLIValidationError } from "../../errors/index.js";
import { normalizeName } from "../../utils/utils.name.js";

export interface GenerateCommandOptions {
  readonly name: string;
  readonly service?: string;
}

export async function generateCommand(
  options: GenerateCommandOptions,
  cwd: string,
): Promise<string[]> {
  const name = normalizeName(options.name);
  const nameCamel = name
    .replace(/-([a-z])/g, (_m: string, c: string) => c.toUpperCase())
    .replace(/^./, (c: string) => c.toUpperCase());
  const service = options.service ?? "default";
  const servicePath = `services/${service}`;

  const files: Record<string, string> = {
    [`${servicePath}/commands/${name}/${name}.command.ts`]: `import type { BaseCommand } from "@oyinlola141/lattice-cqrs";

export interface ${nameCamel}CommandPayload {
  readonly [key: string]: unknown;
}

export class ${nameCamel}Command implements BaseCommand<${nameCamel}CommandPayload> {
  readonly commandName = "${name}";

  constructor(public readonly payload: ${nameCamel}CommandPayload) {}
}
`,

    [`${servicePath}/commands/${name}/${name}.handler.ts`]: `import type { CommandHandler, CommandResult } from "@oyinlola141/lattice-cqrs";
import { ${nameCamel}Command } from "./${name}.command.js";

export class ${nameCamel}CommandHandler implements CommandHandler<${nameCamel}Command> {
  async handle(command: ${nameCamel}Command): Promise<CommandResult> {
    // TODO: Implement command logic
    return { success: true, data: command.payload };
  }
}
`,

    [`${servicePath}/commands/${name}/index.ts`]: `export { ${nameCamel}Command } from "./${name}.command.js";
export { ${nameCamel}CommandHandler } from "./${name}.handler.js";
`,
  };

  try {
    await writeFileTree(cwd, files);
    return Object.keys(files);
  } catch (error) {
    throw new CLIGenerationError(
      `Failed to generate command: ${name} for service: ${service}`,
      error,
    );
  }
}
