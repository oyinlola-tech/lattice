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
  readonly architecture?: string;
}

function getBasePath(architecture: string | undefined, schematic: string): string {
  switch (architecture) {
    case "modular-monolith":
      if (schematic === "module") {
        return "src/modules";
      }
      return "src";

    case "microservice":
      if (schematic === "service") {
        return "apps";
      }
      return "apps/default";

    case "monolith":
    default:
      if (schematic === "module") {
        return "src/modules";
      }
      return "src";
  }
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
  } else {
    context.logger.warn(
      "No lattice.config.ts found. Run `lattice create` first to scaffold a Lattice project.",
    );
  }

  if (architecture === "microservice" && schematic === "service") {
    context.logger.warn(
      'In microservice architecture, prefer "lattice generate module" — services are top-level apps.',
    );
  }

  if (architecture === "modular-monolith" && schematic === "service") {
    context.logger.info(
      'Mapping "service" → "module" for modular-monolith architecture.',
    );
  }

  const result = await runSchematic(
    schematic,
    name,
    { service, module: moduleName, dryRun, architecture: architecture ?? undefined },
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
    const basePath = getBasePath(options.architecture, schematic);
    const moduleName = options.module ?? name;

    switch (schematic) {
      case "service":
        return await generateService({ name, basePath }, cwd);

      case "module":
        return await generateModule({ name, feature: true, basePath }, cwd);

      case "command":
        return await generateCommand(
          { name, service: options.service ?? "default", basePath },
          cwd,
        );

      case "query":
        return await generateQuery(
          { name, service: options.service ?? "default", basePath },
          cwd,
        );

      case "controller":
        return await generateController(
          { name, basePath },
          cwd,
        );

      case "repository":
        return await generateRepository({ name, basePath }, cwd);

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
