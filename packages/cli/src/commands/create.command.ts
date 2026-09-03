/**
 * zudo-cli — Create Command
 *
 * The `zudo create` command.
 */

import { join } from "node:path";
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import * as p from "@clack/prompts";
import type { CLIContext } from "../cliType/cliType.type.js";
import type { ScaffoldOptions } from "../types/index.js";
import type {
  FrontendFramework,
  ProjectConfiguration,
} from "../types/projectConfiguration.type.js";
import { generateProject } from "../generators/project/project.generator.js";
import { FrontendGenerator } from "../generators/frontend/frontendGenerator.core.js";
import { FullstackComposer } from "../generators/fullstack/fullstackComposer.core.js";
import { IntegrationGenerator } from "../generators/integration/integrationGenerator.core.js";
import { InfrastructureGenerator } from "../generators/infrastructure/infrastructure.generator.js";
import { BackendGenerator } from "../generators/backend/backend.generator.js";
import { ManifestManager } from "../manifest/manifestManager.core.js";
import { RollbackManager } from "../rollback/rollbackManager.core.js";
import {
  promptProjectName,
  promptProjectType,
  promptConfirmation,
} from "../prompts/project/index.js";
import {
  promptBackendArchitecture,
  promptDatabase,
  promptApiStyle,
} from "../prompts/backend/index.js";
import {
  promptFramework,
  promptFrontendArchitecture,
} from "../prompts/frontend/index.js";
import { promptPackageManager } from "../prompts/workspace/index.js";
import { promptCapabilities } from "../prompts/capabilities/index.js";
import { CLIValidationError, CLIGenerationError } from "../errors/index.js";
import { execCommand } from "../utils/utils.exec.js";
import { writeFileTree } from "../utils/utils.fileSystem.js";
import { generateMonolithFiles } from "../templates/monolith/index.js";
import { generateModularMonolithFiles } from "../templates/modular-monolith/index.js";
import { generateMicroserviceFiles } from "../templates/microservice/index.js";

const VALID_PROJECT_TYPES = ["backend", "frontend", "fullstack"] as const;
const VALID_FRONTENDS = [
  "none",
  "react",
  "next",
  "vue",
  "nuxt",
  "angular",
  "svelte",
  "sveltekit",
  "astro",
  "vanilla",
  "flutter",
  "react-native",
] as const;
const VALID_FRONTEND_ARCHITECTURES = [
  "zudo-standard",
  "feature-based",
  "minimal",
  "framework-default",
] as const;
const VALID_LANGUAGES = ["typescript", "javascript"] as const;
const VALID_APIS = ["rest", "graphql", "rpc"] as const;

function validateProjectName(name: string): void {
  if (!name || name.trim().length === 0) {
    throw new CLIValidationError("Project name is required.");
  }

  if (name.includes("..") || name.includes("/") || name.includes("\\")) {
    throw new CLIValidationError(
      "Project name must not contain path separators or '..'.",
    );
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
    throw new CLIValidationError(
      "Project name must contain only alphanumeric characters, hyphens, and underscores.",
    );
  }
}

function hasExplicitFlag(
  args: readonly string[],
  long: string,
  short?: string,
): boolean {
  return args.some(
    (arg) => arg === long || (short !== undefined && arg === short),
  );
}

export async function runCreateCommand(context: CLIContext): Promise<void> {
  const projectName = context.values["project-name"] as string | undefined;
  const projectType = (context.values.type as string | undefined) ?? "backend";
  const architecture =
    (context.values.architecture as string | undefined) ?? "monolith";
  const packageManager =
    (context.values["package-manager"] as string | undefined) ?? "pnpm";
  const database =
    (context.values.database as string | undefined) ?? "postgresql";
  const api = (context.values.api as string | undefined) ?? "rest";
  const frontend = (context.values.frontend as string | undefined) ?? "none";
  const frontendArchitecture =
    (context.values["frontend-architecture"] as string | undefined) ??
    "zudo-standard";
  const language =
    (context.values.language as string | undefined) ?? "typescript";
  const noInstall = context.values["no-install"] === true;
  const noGit = context.values["no-git"] === true;
  const servicesRaw = context.values.services as string | undefined;
  const services = servicesRaw
    ? servicesRaw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  if (projectName) {
    validateProjectName(projectName);
  }

  if (
    !VALID_PROJECT_TYPES.includes(
      projectType as (typeof VALID_PROJECT_TYPES)[number],
    )
  ) {
    throw new CLIValidationError(
      `Invalid project type: ${projectType}. Valid: ${VALID_PROJECT_TYPES.join(", ")}`,
    );
  }

  if (!VALID_FRONTENDS.includes(frontend as (typeof VALID_FRONTENDS)[number])) {
    throw new CLIValidationError(
      `Invalid frontend: ${frontend}. Valid: ${VALID_FRONTENDS.join(", ")}`,
    );
  }

  if (
    !VALID_FRONTEND_ARCHITECTURES.includes(
      frontendArchitecture as (typeof VALID_FRONTEND_ARCHITECTURES)[number],
    )
  ) {
    throw new CLIValidationError(
      `Invalid frontend architecture: ${frontendArchitecture}. Valid: ${VALID_FRONTEND_ARCHITECTURES.join(", ")}`,
    );
  }

  if (!VALID_LANGUAGES.includes(language as (typeof VALID_LANGUAGES)[number])) {
    throw new CLIValidationError(
      `Invalid language: ${language}. Valid: ${VALID_LANGUAGES.join(", ")}`,
    );
  }

  if (!VALID_APIS.includes(api as (typeof VALID_APIS)[number])) {
    throw new CLIValidationError(
      `Invalid API style: ${api}. Valid: ${VALID_APIS.join(", ")}`,
    );
  }

  const resolvedFrontend =
    projectType === "frontend" || projectType === "fullstack"
      ? frontend === "none"
        ? "react"
        : frontend
      : undefined;

  const explicitOverrides: Record<string, unknown> = {
    projectName,
  };

  if (hasExplicitFlag(context.args, "--type", "-t")) {
    explicitOverrides.projectType = projectType;
  }

  if (hasExplicitFlag(context.args, "--architecture", "-a")) {
    explicitOverrides.architecture = architecture;
  }

  if (hasExplicitFlag(context.args, "--package-manager", "-p")) {
    explicitOverrides.packageManager = packageManager;
  }

  if (hasExplicitFlag(context.args, "--database", "-d")) {
    explicitOverrides.database = database;
  }

  if (hasExplicitFlag(context.args, "--api")) {
    explicitOverrides.api = api;
  }

  if (hasExplicitFlag(context.args, "--frontend", "-f")) {
    explicitOverrides.frontend = resolvedFrontend;
  }

  if (hasExplicitFlag(context.args, "--frontend-architecture", "-fa")) {
    explicitOverrides.frontendArchitecture = frontendArchitecture;
  }

  if (hasExplicitFlag(context.args, "--language", "-l")) {
    explicitOverrides.language = language;
  }

  const isInteractive = process.stdin.isTTY;

  let answers: ScaffoldOptions;

  if (isInteractive) {
    p.intro("Zudo");

    const name = (await promptProjectName(projectName ?? undefined)) as string;
    const type = await promptProjectType(
      explicitOverrides.projectType as ScaffoldOptions["projectType"],
    );

    const arch =
      type === "backend"
        ? await promptBackendArchitecture(
            explicitOverrides.architecture as ScaffoldOptions["architecture"],
          )
        : (explicitOverrides.architecture as ScaffoldOptions["architecture"]);

    const db =
      type === "backend" || type === "fullstack"
        ? await promptDatabase(
            explicitOverrides.database as ScaffoldOptions["database"],
          )
        : (explicitOverrides.database as ScaffoldOptions["database"]);

    const apiStyle =
      type === "backend" || type === "fullstack"
        ? await promptApiStyle(explicitOverrides.api as ScaffoldOptions["api"])
        : (explicitOverrides.api as ScaffoldOptions["api"]);

    const frontend =
      type === "frontend" || type === "fullstack"
        ? await promptFramework(
            type,
            explicitOverrides.frontend as
              FrontendFramework | "none" | undefined,
          )
        : (resolvedFrontend ?? "none");

    const frontendArch =
      type === "frontend" || type === "fullstack"
        ? await promptFrontendArchitecture(
            explicitOverrides.frontendArchitecture as ScaffoldOptions["frontendArchitecture"],
          )
        : (explicitOverrides.frontendArchitecture as ScaffoldOptions["frontendArchitecture"]);

    const pkgManager = await promptPackageManager(
      explicitOverrides.packageManager as ScaffoldOptions["packageManager"],
    );

    const capabilities = await promptCapabilities([]);
    const enableCQRS = capabilities.includes("cqrs");
    const enableMessaging = capabilities.includes("messaging");
    const enableObservability = capabilities.includes("observability");
    const enableOpenAPI = capabilities.includes("openapi");
    const enableDatabase = capabilities.includes("database");
    const enableQueue = capabilities.includes("queue");
    const enableDocker = arch === "microservice";

    const confirmed = await promptConfirmation(
      `Create project "${name}"?`,
      true,
    );

    if (!confirmed) {
      p.cancel("Project creation cancelled.");
      return;
    }

    answers = {
      projectName: name,
      projectType: type,
      architecture: arch,
      packageManager: pkgManager,
      database: db,
      api: apiStyle,
      frontend: frontend as ScaffoldOptions["frontend"],
      frontendArchitecture: frontendArch,
      frontendPath: "apps/web",
      language: (explicitOverrides.language ??
        "typescript") as ScaffoldOptions["language"],
      services: [],
      enableCQRS,
      enableMessaging,
      enableObservability,
      enableOpenAPI,
      enableDatabase,
      enableQueue,
      enableDocker,
      installDeps: !noInstall,
      initGit: !noGit,
    };
  } else {
    answers = {
      projectName: projectName ?? "",
      projectType: projectType as any,
      architecture: architecture as any,
      packageManager: packageManager as any,
      database: database as any,
      api: api as any,
      frontend: resolvedFrontend as any,
      frontendArchitecture: frontendArchitecture as any,
      frontendPath: "apps/web",
      language: language as any,
      services,
      enableCQRS: true,
      enableMessaging: true,
      enableObservability: true,
      enableOpenAPI: true,
      enableDatabase: true,
      enableQueue: false,
      enableDocker: false,
      installDeps: !noInstall,
      initGit: !noGit,
    };
  }

  if (!answers.projectName) {
    throw new CLIValidationError("Project name is required.");
  }

  await createProject(answers, context);
}

async function createProject(
  options: ScaffoldOptions,
  context: CLIContext,
): Promise<void> {
  const { projectName, packageManager } = options;
  const targetPath = join(context.cwd, projectName);

  if (existsSync(targetPath)) {
    throw new CLIValidationError(
      `Directory "${projectName}" already exists in ${context.cwd}`,
    );
  }

  const rollback = new RollbackManager();
  rollback.trackDirectory(targetPath);

  const spinner = p.spinner();

  try {
    spinner.start("Creating project structure");
    await mkdir(targetPath, { recursive: true });
    rollback.trackDirectory(targetPath);
    spinner.stop("Project structure created");

    if (
      options.projectType === "fullstack" &&
      options.frontend &&
      options.frontend !== "none"
    ) {
      spinner.start("Generating fullstack project");
      await generateFullstackProject(options, targetPath, rollback);
      spinner.stop("Fullstack project generated");
    } else if (
      options.projectType === "frontend" &&
      options.frontend &&
      options.frontend !== "none"
    ) {
      spinner.start("Generating frontend project");
      await generateFrontendProject(options, targetPath);
      spinner.stop("Frontend project generated");
    } else {
      spinner.start("Generating backend project");
      const result = await generateProject(options, targetPath);
      context.logger.info(`Files created: ${result.filesCreated.length}`);
      spinner.stop("Backend project generated");
    }

    spinner.start("Creating manifest");
    const manifest = new ManifestManager(targetPath);
    await manifest.create({
      version: "1",
      architecture: options.architecture,
      backend: {
        architecture: options.architecture,
        api: options.api ?? "rest",
      },
      frontend:
        options.frontend && options.frontend !== "none"
          ? {
              framework: options.frontend,
              architecture: options.frontendArchitecture ?? "zudo-standard",
            }
          : undefined,
      database: {
        provider: options.database ?? "postgresql",
      },
      workspace: {
        packageManager: options.packageManager,
      },
      capabilities: [
        options.enableCQRS && "cqrs",
        options.enableMessaging && "messaging",
        options.enableObservability && "observability",
        options.enableOpenAPI && "openapi",
        options.enableDatabase && "database",
        options.enableQueue && "queue",
      ].filter(Boolean) as string[],
    });
    spinner.stop("Manifest created");

    if (options.installDeps) {
      spinner.start("Installing dependencies");
      const installFile =
        packageManager === "pnpm"
          ? "pnpm"
          : packageManager === "yarn"
            ? "yarn"
            : packageManager === "bun"
              ? "bun"
              : "npm";

      try {
        await execCommand(installFile, ["install"], targetPath);
        spinner.stop("Dependencies installed");
      } catch {
        spinner.stop("Dependencies installation skipped");
      }
    }

    if (options.initGit) {
      spinner.start("Initializing git repository");
      try {
        await execCommand("git", ["init"], targetPath);
        spinner.stop("Git repository initialized");
      } catch {
        spinner.stop("Git initialization skipped");
      }
    }

    p.note(
      `cd ${projectName}\n${packageManager === "pnpm" ? "pnpm" : packageManager === "yarn" ? "yarn" : packageManager === "bun" ? "bun" : "npm"} dev`,
      "Next steps",
    );

    p.outro("Project created successfully.");
  } catch (error) {
    await rollback.rollback();
    const message = error instanceof Error ? error.message : String(error);
    p.cancel(`Failed to create project: ${message}`);
    throw new CLIGenerationError(
      `Failed to create project "${projectName}"`,
      error,
    );
  }
}

async function generateFullstackProject(
  options: ScaffoldOptions,
  projectPath: string,
  rollback: RollbackManager,
): Promise<void> {
  const composer = new FullstackComposer();

  const result = await composer.generate({
    project: {
      name: options.projectName,
      type: "fullstack",
      backend: {
        architecture: options.architecture,
        api: options.api ?? "rest",
        database: options.database,
      },
      frontend:
        options.frontend && options.frontend !== "none"
          ? {
              framework: options.frontend,
              architecture: options.frontendArchitecture ?? "zudo-standard",
              language: options.language ?? "typescript",
            }
          : undefined,
      workspace: {
        packageManager: options.packageManager,
      },
      features: options.services,
    },
    projectPath,
  });

  if (!result.success) {
    throw new CLIGenerationError(
      `Fullstack generation failed:\n${result.errors.join("\n")}`,
    );
  }

  let backendFiles: Record<string, string>;
  switch (options.architecture) {
    case "modular-monolith":
      backendFiles = generateModularMonolithFiles(options);
      break;
    case "microservice":
      backendFiles = generateMicroserviceFiles(options);
      break;
    default:
      backendFiles = generateMonolithFiles(options);
  }

  await writeFileTree(join(projectPath, "apps/api"), backendFiles);
  rollback.trackDirectory(join(projectPath, "apps/api"));

  const integrationGenerator = new IntegrationGenerator();
  await integrationGenerator.generate({
    project: {
      name: options.projectName,
      type: "fullstack",
      backend: {
        architecture: options.architecture,
        api: options.api ?? "rest",
        database: options.database,
      },
      frontend:
        options.frontend && options.frontend !== "none"
          ? {
              framework: options.frontend,
              architecture: options.frontendArchitecture ?? "zudo-standard",
              language: options.language ?? "typescript",
            }
          : undefined,
      workspace: {
        packageManager: options.packageManager,
      },
      features: options.services,
    } as ProjectConfiguration,
    projectPath,
    backendPort: 3000,
    frontendPort: options.frontend === "next" ? 3000 : 5173,
  });

  const infrastructureGenerator = new InfrastructureGenerator();
  await infrastructureGenerator.generate(
    {
      projectName: options.projectName,
      architecture: options.architecture,
      database: options.database ?? "postgresql",
      packageManager: options.packageManager,
      services: options.services,
    },
    projectPath,
  );
}

async function generateFrontendProject(
  options: ScaffoldOptions,
  projectPath: string,
): Promise<void> {
  const generator = new FrontendGenerator();

  const result = await generator.generate({
    project: {
      name: options.projectName,
      type: "frontend",
      frontend:
        options.frontend && options.frontend !== "none"
          ? {
              framework: options.frontend,
              architecture: options.frontendArchitecture ?? "zudo-standard",
              language: options.language ?? "typescript",
            }
          : undefined,
      workspace: {
        packageManager: options.packageManager,
      },
    },
    projectPath,
    framework: options.frontend ?? "react",
    architecture: options.frontendArchitecture ?? "zudo-standard",
    language: options.language ?? "typescript",
    packageManager: options.packageManager,
  });

  if (!result.success) {
    throw new CLIGenerationError(
      `Frontend generation failed:\n${result.errors.join("\n")}`,
    );
  }
}
