/**
 * zudo-cli — Generate Command
 *
 * The `zudo generate` (alias: `g`) command.
 * Reads zudo.config.ts to determine project architecture.
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
import { generateMiddleware } from "../generators/middleware/middleware.generator.js";
import { generateEvent } from "../generators/event/event.generator.js";
import { generateJob } from "../generators/job/job.generator.js";
import { generateRoute } from "../generators/route/route.generator.js";
import { generateModel } from "../generators/model/model.generator.js";
import { generateDto } from "../generators/dto/dto.generator.js";
import { generateValidator } from "../generators/validator/validator.generator.js";
import { ManifestManager } from "../manifest/manifestManager.core.js";
import { CLIGenerationError, CLIValidationError } from "../errors/index.js";

const VALID_SCHEMATICS = [
  "service",
  "module",
  "command",
  "query",
  "controller",
  "repository",
  "middleware",
  "event",
  "job",
  "route",
  "model",
  "dto",
  "validator",
] as const;

interface GenerateOptions {
  readonly service?: string;
  readonly module?: string;
  readonly dryRun: boolean;
  readonly architecture?: string;
}

function getBasePath(
  architecture: string | undefined,
  schematic: string,
): string {
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

function readZudoArchitecture(cwd: string): string | null {
  const configPath = join(cwd, "zudo.config.ts");
  if (!existsSync(configPath)) {
    const configPathJs = join(cwd, "zudo.config.js");
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

  if (
    !schematic ||
    !VALID_SCHEMATICS.includes(schematic as (typeof VALID_SCHEMATICS)[number])
  ) {
    throw new CLIValidationError(
      `Schematic name is required. Available: ${VALID_SCHEMATICS.join(", ")}`,
    );
  }

  if (!name) {
    throw new CLIValidationError("Resource name is required.");
  }

  const cwd = context.cwd;
  const architecture = readZudoArchitecture(cwd);
  const manifest = await new ManifestManager(cwd).read();

  if (architecture) {
    context.logger.info(`Detected architecture: ${architecture}`);
  } else {
    context.logger.warn(
      "No zudo.config.ts found. Run `zudo create` first to scaffold a Zudo project.",
    );
  }

  if (architecture === "microservice" && schematic === "service") {
    context.logger.warn(
      'In microservice architecture, prefer "zudo generate module" — services are top-level apps.',
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
    {
      service,
      module: moduleName,
      dryRun,
      architecture: architecture ?? undefined,
    },
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
        return await generateController({ name, basePath }, cwd);

      case "repository":
        return await generateRepository({ name, basePath }, cwd);

      case "middleware":
        return await generateMiddleware({ name, basePath }, cwd);

      case "event":
        return await generateEvent({ name, basePath }, cwd);

      case "job":
        return await generateJob({ name, basePath }, cwd);

      case "route":
        return await generateRoute({ name, basePath }, cwd);

      case "model":
        return await generateModel({ name, basePath }, cwd);

      case "dto":
        return await generateDto({ name, basePath }, cwd);

      case "validator":
        return await generateValidator({ name, basePath }, cwd);

      default:
        throw new CLIValidationError(
          `Unknown schematic: "${schematic}". Available: ${VALID_SCHEMATICS.join(", ")}.`,
        );
    }
  } catch (error) {
    throw new CLIGenerationError(
      `Failed to generate ${schematic}: ${name}`,
      error,
    );
  }
}
