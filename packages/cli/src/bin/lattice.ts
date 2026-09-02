#!/usr/bin/env node

/**
 * Lattice CLI entry point.
 *
 * @module bin/lattice
 */

import { createCLI } from "../cliApplication/index.js";
import { CLI_DEFAULTS } from "../cliConstant/cliConstant.value.js";
import { createCommand } from "../cliCommand/index.js";
import type { CLIContext } from "../cliType/cliType.type.js";
import { runCreateCommand } from "../commands/create.command.js";
import { runGenerateCommand } from "../commands/generate.command.js";
import { runAddCommand } from "../commands/add.command.js";
import { runDoctorCommand } from "../commands/doctor.command.js";
import { runInfoCommand } from "../commands/info.command.js";

const app = createCLI({
  name: "Lattice",
  version: "0.1.0",
  description: "Command-line interface for the Lattice framework.",
});

app.register(
  createCommand({
    name: "create",
    description: "Create a new Lattice project",
    arguments: [
      {
        name: "project-name",
        description: "The name of the project to create",
        required: false,
      },
    ],
    options: [
      {
        name: "architecture",
        short: "a",
        description:
          "Architecture type (monolith, modular-monolith, microservice)",
        type: "string",
        defaultValue: "monolith",
      },
      {
        name: "package-manager",
        short: "p",
        description: "Package manager (npm, pnpm, yarn)",
        type: "string",
        defaultValue: "pnpm",
      },
      {
        name: "database",
        short: "d",
        description: "Database engine (postgresql, mysql, sqlite)",
        type: "string",
        defaultValue: "postgresql",
      },
      {
        name: "no-install",
        description: "Skip dependency installation",
        type: "boolean",
        defaultValue: false,
      },
      {
        name: "no-git",
        description: "Skip git initialization",
        type: "boolean",
        defaultValue: false,
      },
      {
        name: "services",
        description:
          "Comma-separated service names (microservice architecture only)",
        type: "string",
        defaultValue: "gateway,api",
      },
    ],
    execute: async (context: CLIContext): Promise<void> => {
      await runCreateCommand(context);
    },
  }),
);

app.register(
  createCommand({
    name: "generate",
    description: "Generate files within a Lattice project",
    aliases: ["g"],
    arguments: [
      {
        name: "schematic",
        description:
          "The schematic to generate (service, module, command, query, controller, repository)",
        required: true,
      },
      {
        name: "name",
        description: "The name of the file/resource to generate",
        required: true,
      },
    ],
    options: [
      {
        name: "service",
        short: "s",
        description: "The service name (for CQRS commands/queries)",
        type: "string",
      },
      {
        name: "module",
        short: "m",
        description: "The module name",
        type: "string",
      },
      {
        name: "dry-run",
        description: "Show what would be generated without writing files",
        type: "boolean",
        defaultValue: false,
      },
    ],
    execute: async (context: CLIContext): Promise<void> => {
      await runGenerateCommand(context);
    },
  }),
);

app.register(
  createCommand({
    name: "add",
    description: "Add a feature package to a Lattice project",
    arguments: [
      {
        name: "feature",
        description:
          "The feature to add (database, queue, messaging, openapi, observability, security)",
        required: true,
      },
    ],
    options: [
      {
        name: "adapter",
        short: "a",
        description: "Specific adapter to use",
        type: "string",
      },
      {
        name: "skip-install",
        description: "Skip dependency installation",
        type: "boolean",
        defaultValue: false,
      },
    ],
    execute: async (context: CLIContext): Promise<void> => {
      await runAddCommand(context);
    },
  }),
);

app.register(
  createCommand({
    name: "doctor",
    description: "Run diagnostics on a Lattice project",
    execute: async (context: CLIContext): Promise<void> => {
      await runDoctorCommand(context);
    },
  }),
);

app.register(
  createCommand({
    name: "info",
    description: "Show information about the Lattice CLI and project",
    execute: async (context: CLIContext): Promise<void> => {
      await runInfoCommand(context);
    },
  }),
);

const exitCode = await app.run(process.argv.slice(2));

if (exitCode !== 0) {
  process.exit(exitCode);
}
