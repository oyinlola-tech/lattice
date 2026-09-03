/**
 * @oyinlola141/lattice-cli — Create Command
 *
 * The `lattice create` command.
 */

import { join } from "node:path";
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import type { CLIContext } from "../cliType/cliType.type.js";
import type { ScaffoldOptions } from "../types/index.js";
import { generateProject } from "../generators/project/project.generator.js";
import { FrontendGenerator } from "../generators/frontend/frontendGenerator.core.js";
import { FullstackComposer } from "../generators/fullstack/fullstackComposer.core.js";
import { promptCreateProject } from "../prompts/index.js";
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
  "lattice-standard",
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
    "lattice-standard";
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

  const answers = process.stdin.isTTY
    ? await promptCreateProject({
        projectName,
        projectType: projectType as any,
        architecture: architecture as any,
        packageManager: packageManager as any,
        database: database as any,
        api: api as any,
        frontend: resolvedFrontend as any,
        frontendArchitecture: frontendArchitecture as any,
        language: language as any,
      })
    : {
        projectName: projectName ?? "",
        projectType: projectType as any,
        architecture: architecture as any,
        packageManager: packageManager as any,
        database: database as any,
        api: api as any,
        frontend: resolvedFrontend as any,
        frontendArchitecture: frontendArchitecture as any,
        language: language as any,
        enableCQRS: true,
        enableMessaging: true,
        enableObservability: true,
        enableOpenAPI: true,
        enableDatabase: true,
        enableQueue: false,
        enableDocker: false,
        installDeps: !noInstall,
        initGit: !noGit,
        services,
      };

  if (!answers.projectName) {
    throw new CLIValidationError("Project name is required.");
  }

  const opts: ScaffoldOptions = {
    projectName: answers.projectName,
    projectType: answers.projectType,
    architecture: answers.architecture,
    packageManager: answers.packageManager,
    database: answers.database,
    api: answers.api,
    frontend: answers.frontend,
    frontendArchitecture: answers.frontendArchitecture,
    frontendPath: "apps/web",
    language: answers.language,
    services: answers.services ?? [],
    enableCQRS: answers.enableCQRS,
    enableMessaging: answers.enableMessaging,
    enableObservability: answers.enableObservability,
    enableOpenAPI: answers.enableOpenAPI,
    enableDatabase: answers.enableDatabase,
    enableQueue: answers.enableQueue,
    enableDocker: answers.enableDocker,
    installDeps: answers.installDeps,
    initGit: answers.initGit,
  };

  await createProject(opts, context);
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

  context.logger.info(`Creating Lattice project: ${projectName}`);
  context.logger.info(`Type: ${options.projectType ?? "backend"}`);
  context.logger.info(`Architecture: ${options.architecture}`);
  context.logger.info(`Package manager: ${packageManager}`);

  if (options.frontend && options.frontend !== "none") {
    context.logger.info(`Frontend: ${options.frontend}`);
  }

  try {
    await mkdir(targetPath, { recursive: true });

    if (
      options.projectType === "fullstack" &&
      options.frontend &&
      options.frontend !== "none"
    ) {
      await generateFullstackProject(options, targetPath);
    } else if (
      options.projectType === "frontend" &&
      options.frontend &&
      options.frontend !== "none"
    ) {
      await generateFrontendProject(options, targetPath);
    } else {
      const result = await generateProject(options, targetPath);
      context.logger.info(`Project created at: ${result.projectPath}`);
      context.logger.info(`Files created: ${result.filesCreated.length}`);
    }

    context.logger.info("");
    context.logger.info("Next steps:");
    context.logger.info(`  cd ${projectName}`);

    if (!options.installDeps) {
      const installCmd =
        packageManager === "pnpm"
          ? "pnpm install"
          : packageManager === "yarn"
            ? "yarn install"
            : packageManager === "bun"
              ? "bun install"
              : "npm install";
      context.logger.info(`  ${installCmd}`);
    }

    context.logger.info(
      `  ${packageManager === "pnpm" ? "pnpm" : packageManager === "yarn" ? "yarn" : packageManager === "bun" ? "bun" : "npm"} dev`,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    context.logger.error(`Failed to create project: ${message}`);
    throw new CLIGenerationError(
      `Failed to create project "${projectName}"`,
      error,
    );
  }
}

async function generateFullstackProject(
  options: ScaffoldOptions,
  projectPath: string,
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
              architecture: options.frontendArchitecture ?? "lattice-standard",
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

  if (options.installDeps) {
    const installFile =
      options.packageManager === "pnpm"
        ? "pnpm"
        : options.packageManager === "yarn"
          ? "yarn"
          : options.packageManager === "bun"
            ? "bun"
            : "npm";

    try {
      await execCommand(installFile, ["install"], projectPath);
    } catch {
      // Best-effort
    }
  }
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
              architecture: options.frontendArchitecture ?? "lattice-standard",
              language: options.language ?? "typescript",
            }
          : undefined,
      workspace: {
        packageManager: options.packageManager,
      },
    },
    projectPath,
    framework: options.frontend ?? "react",
    architecture: options.frontendArchitecture ?? "lattice-standard",
    language: options.language ?? "typescript",
    packageManager: options.packageManager,
  });

  if (!result.success) {
    throw new CLIGenerationError(
      `Frontend generation failed:\n${result.errors.join("\n")}`,
    );
  }

  if (options.installDeps) {
    const installFile =
      options.packageManager === "pnpm"
        ? "pnpm"
        : options.packageManager === "yarn"
          ? "yarn"
          : options.packageManager === "bun"
            ? "bun"
            : "npm";

    try {
      await execCommand(installFile, ["install"], projectPath);
    } catch {
      // Best-effort
    }
  }
}
