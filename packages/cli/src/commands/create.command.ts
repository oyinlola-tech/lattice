/**
 * @oyinlola141/lattice-cli — Create Command
 *
 * The `lattice create` command.
 */

import { join } from "node:path";
import { existsSync } from "node:fs";
import type { CLIContext } from "../cliType/cliType.type.js";
import type {
  ScaffoldOptions,
  ArchitectureType,
  PackageManager,
  DatabaseEngine,
} from "../types/index.js";
import { generateProject } from "../generators/project/project.generator.js";
import { promptCreateProject } from "../prompts/index.js";
import { CLIValidationError, CLIGenerationError } from "../errors/index.js";

export async function runCreateCommand(context: CLIContext): Promise<void> {
  const projectName = context.values["project-name"] as string | undefined;
  const architecture =
    (context.values.architecture as string | undefined) ?? "monolith";
  const packageManager =
    (context.values["package-manager"] as string | undefined) ?? "pnpm";
  const database =
    (context.values.database as string | undefined) ?? "postgresql";
  const noInstall = context.values["no-install"] === true;
  const noGit = context.values["no-git"] === true;
  const servicesRaw = context.values.services as string | undefined;
  const services = servicesRaw ? servicesRaw.split(",") : [];

  const validArchitectures: readonly ArchitectureType[] = [
    "monolith",
    "modular-monolith",
    "microservice",
  ];
  if (!validArchitectures.includes(architecture as ArchitectureType)) {
    throw new CLIValidationError(
      `Invalid architecture: ${architecture}. Valid: ${validArchitectures.join(", ")}`,
    );
  }

  const validPackageManagers: readonly PackageManager[] = [
    "npm",
    "pnpm",
    "yarn",
  ];
  if (!validPackageManagers.includes(packageManager as PackageManager)) {
    throw new CLIValidationError(
      `Invalid package manager: ${packageManager}. Valid: ${validPackageManagers.join(", ")}`,
    );
  }

  const validDatabases: readonly DatabaseEngine[] = [
    "postgresql",
    "mysql",
    "sqlite",
  ];
  if (!validDatabases.includes(database as DatabaseEngine)) {
    throw new CLIValidationError(
      `Invalid database: ${database}. Valid: ${validDatabases.join(", ")}`,
    );
  }

  let answers;

  if (!projectName && process.stdin.isTTY) {
    answers = await promptCreateProject({
      architecture: architecture as ArchitectureType,
      packageManager: packageManager as PackageManager,
      database: database as DatabaseEngine,
    });
  } else {
    if (!projectName) {
      throw new CLIValidationError("Project name is required.");
    }

    answers = {
      projectName: projectName,
      architecture: architecture as ArchitectureType,
      packageManager: packageManager as PackageManager,
      database: database as DatabaseEngine,
      enableCQRS: true,
      enableMessaging: true,
      enableObservability: true,
      enableOpenAPI: true,
      enableDatabase: true,
      enableQueue: false,
      enableDocker: false,
      installDeps: !noInstall,
      initGit: !noGit,
      services: services,
    };
  }

  const opts: ScaffoldOptions = {
    projectName: answers.projectName,
    architecture: answers.architecture,
    packageManager: answers.packageManager,
    database: answers.database,
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
  context.logger.info(`Architecture: ${options.architecture}`);
  context.logger.info(`Package manager: ${packageManager}`);

  try {
    const result = await generateProject(options, context.cwd);

    context.logger.info(`Project created at: ${result.projectPath}`);
    context.logger.info(`Files created: ${result.filesCreated.length}`);

    for (const file of result.filesCreated) {
      context.logger.info(`  - ${file}`);
    }

    context.logger.info("");

    if (options.installDeps) {
      context.logger.info("Dependencies installed successfully.");
    }

    if (options.initGit) {
      context.logger.info("Git repository initialized.");
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
            : "npm install";
      context.logger.info(`  ${installCmd}`);
    }

    context.logger.info(
      `  ${packageManager === "pnpm" ? "pnpm" : packageManager === "yarn" ? "yarn" : "npm"} dev`,
    );
  } catch (error) {
    throw new CLIGenerationError(
      `Failed to create project "${projectName}"`,
      error,
    );
  }
}
