/**
 * @oyinlola141/lattice-cli — Generate Command
 *
 * The `lattice generate` (alias: `g`) command.
 * Reads lattice.config.ts to determine project architecture.
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { CLIContext } from "../cliType/cliType.type.js";
import { generateService } from "../generators/service/service.generator.js";
import { generateModule } from "../generators/module/module.generator.js";
import { generateCommand } from "../generators/command/command.generator.js";
import { generateQuery } from "../generators/query/query.generator.js";
import { generateController } from "../generators/controller/controller.generator.js";
import { generateRepository } from "../generators/repository/repository.generator.js";
import { CLIGenerationError, CLIValidationError } from "../errors/index.js";

interface GenerateOptions {
  readonly service?: string;
  readonly module?: string;
  readonly dryRun: boolean;
}

function readLatticeArchitecture(cwd: string): string | null {
  const configPath = join(cwd, "lattice.config.ts");
  if (!existsSync(configPath)) {
    const configPathJs = join(cwd, "lattice.config.js");
    if (!existsSync(configPathJs)) return null;
    const content = readFileSync(configPathJs, "utf-8");
    const match = content.match(/architecture:\s*["'](\w[\w-]*)["']/);
    return match?.[1] ?? null;
  }
  const content = readFileSync(configPath, "utf-8");
  const match = content.match(/architecture:\s*["'](\w[\w-]*)["']/);
  return match?.[1] ?? null;
}

export async function runGenerateCommand(context: CLIContext): Promise<void> {
  const schematic = context.values.schematic as string | undefined;
  const name = context.values.name as string | undefined;
  const service = context.values.service as string | undefined;
  const moduleName = context.values.module as string | undefined;
  const dryRun = context.values["dry-run"] === true;

  if (!schematic) {
    throw new CLIValidationError(
      "Schematic name is required. Available: service, module, command, query, controller, repository",
    );
  }

  if (!name) {
    throw new CLIValidationError("Resource name is required.");
  }

  const cwd = context.cwd;
  const architecture = readLatticeArchitecture(cwd);

  if (architecture) {
    context.logger.info(`Detected architecture: ${architecture}`);
  }

  if (architecture === "microservice" && schematic === "service") {
    context.logger.info(
      'Note: In microservice architecture, use "lattice generate module" instead of "lattice generate service".',
    );
  }

  const result = await runSchematic(
    schematic,
    name,
    { service, module: moduleName, dryRun },
    cwd,
  );

  context.logger.info(`Generated ${result.length} files:`);
  for (const file of result) {
    context.logger.info(`  - ${file}`);
  }
}

async function runSchematic(
  schematic: string,
  name: string,
  options: GenerateOptions,
  cwd: string,
): Promise<string[]> {
  try {
    switch (schematic) {
      case "service":
        return await generateService({ name }, cwd);

      case "module":
        return await generateModule({ name, feature: true }, cwd);

      case "command":
        return await generateCommand(
          { name, service: options.service ?? "default" },
          cwd,
        );

      case "query":
        return await generateQuery(
          { name, service: options.service ?? "default" },
          cwd,
        );

      case "controller":
        return await generateController(
          { name, service: options.service },
          cwd,
        );

      case "repository":
        return await generateRepository({ name }, cwd);

      default:
        throw new CLIValidationError(
          `Unknown schematic: "${schematic}". Available: service, module, command, query, controller, repository.`,
        );
    }
  } catch (error) {
    throw new CLIGenerationError(
      `Failed to generate ${schematic}: ${name}`,
      error,
    );
  }
}
