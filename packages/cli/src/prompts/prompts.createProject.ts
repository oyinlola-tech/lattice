/**
 * @oyinlola141/lattice-cli — Prompts
 *
 * Interactive prompt utilities for the CLI.
 */

import type {
  ArchitectureType,
  DatabaseEngine,
  PackageManager,
} from "../types/index.js";

export interface CreateProjectPrompts {
  projectName: string;
  architecture: ArchitectureType;
  packageManager: PackageManager;
  database: DatabaseEngine;
  enableCQRS: boolean;
  enableMessaging: boolean;
  enableObservability: boolean;
  enableOpenAPI: boolean;
  enableDatabase: boolean;
  enableQueue: boolean;
  enableDocker: boolean;
  installDeps: boolean;
  initGit: boolean;
  services: readonly string[];
}

export interface PromptChoice {
  readonly value: string;
  readonly label: string;
}

export async function promptCreateProject(
  overrides?: Partial<CreateProjectPrompts>,
): Promise<CreateProjectPrompts> {
  const { stdin, stdout } = process;
  const ask = (query: string): Promise<string> =>
    new Promise((resolve) => {
      stdout.write(query);
      stdin.resume();
      stdin.once("data", (data) => {
        stdin.pause();
        resolve(data.toString().trim());
      });
    });

  const askChoice = async (
    query: string,
    choices: readonly PromptChoice[],
    defaultValue: string,
  ): Promise<string> => {
    stdout.write(`\n${query}\n`);
    choices.forEach((c, i) => {
      stdout.write(`  ${i + 1}) ${c.label}\n`);
    });
    const answer = await ask(
      `\nSelect (1-${choices.length}, default ${defaultValue}): `,
    );
    const idx = Number.parseInt(answer, 10) - 1;
    if (idx >= 0 && idx < choices.length) {
      return choices[idx]!.value;
    }
    return defaultValue;
  };

  const askConfirm = async (
    query: string,
    defaultValue: boolean,
  ): Promise<boolean> => {
    const answer = await ask(`\n${query} (y/N): `);
    if (answer === "") return defaultValue;
    return answer.toLowerCase().startsWith("y");
  };

  const projectName = overrides?.projectName ?? (await ask(`\nProject name: `));

  const architecture = (overrides?.architecture ??
    (await askChoice(
      "Select architecture",
      [
        { value: "monolith", label: "Monolith" },
        { value: "modular-monolith", label: "Modular Monolith" },
        { value: "microservice", label: "Microservice" },
      ],
      "monolith",
    ))) as ArchitectureType;

  const packageManager = (overrides?.packageManager ??
    (await askChoice(
      "Select package manager",
      [
        { value: "pnpm", label: "pnpm" },
        { value: "npm", label: "npm" },
        { value: "yarn", label: "yarn" },
      ],
      "pnpm",
    ))) as PackageManager;

  const database = (overrides?.database ??
    (await askChoice(
      "Select database",
      [
        { value: "postgresql", label: "PostgreSQL" },
        { value: "mysql", label: "MySQL" },
        { value: "sqlite", label: "SQLite" },
      ],
      "postgresql",
    ))) as DatabaseEngine;

  let services: string[] = [];

  if (architecture === "microservice") {
    const serviceAnswer = await ask(
      `\nEnter service names (comma-separated): `,
    );

    if (serviceAnswer) {
      services = serviceAnswer
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }

    if (services.length === 0) {
      services = ["identity", "enrollment", "assessment", "notification"];
    }
  }

  const enableCQRS =
    overrides?.enableCQRS ?? (await askConfirm("\nEnable CQRS?", true));
  const enableMessaging =
    overrides?.enableMessaging ??
    (await askConfirm("\nEnable messaging?", true));
  const enableObservability =
    overrides?.enableObservability ??
    (await askConfirm("\nEnable observability?", true));
  const enableOpenAPI =
    overrides?.enableOpenAPI ?? (await askConfirm("\nEnable OpenAPI?", true));
  const enableDatabase =
    overrides?.enableDatabase ?? (await askConfirm("\nEnable database?", true));
  const enableQueue =
    overrides?.enableQueue ?? (await askConfirm("\nEnable job queue?", false));
  const enableDocker =
    overrides?.enableDocker ??
    (await askConfirm("\nEnable Docker?", architecture === "microservice"));

  const installDeps =
    overrides?.installDeps ??
    (await askConfirm("\nInstall dependencies?", true));
  const initGit =
    overrides?.initGit ?? (await askConfirm("\nInitialize git?", true));

  return {
    projectName,
    architecture,
    packageManager,
    database,
    enableCQRS,
    enableMessaging,
    enableObservability,
    enableOpenAPI,
    enableDatabase,
    enableQueue,
    enableDocker,
    installDeps,
    initGit,
    services,
  };
}
