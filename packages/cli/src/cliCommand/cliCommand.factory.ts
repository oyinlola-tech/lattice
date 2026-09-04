/**
 * zudojs-cli — Command Factory
 *
 * Factory functions for creating and executing CLI commands.
 */

import type {
  CLICommand,
  CLICommandDefinition,
  CLIContext,
} from "../cliType/cliType.type.js";
import { validateCommand } from "./cliCommand.validator.js";

/* -------------------------------------------------------------------------- */
/* Factory                                                                    */
/* -------------------------------------------------------------------------- */

/** Creates a validated CLICommand from a definition. */
export function createCommand(definition: CLICommandDefinition): CLICommand {
  validateCommand(definition);

  return {
    ...definition,
    name: definition.name.trim(),
    aliases: definition.aliases?.map((alias) => alias.trim()).filter(Boolean),
  };
}

/** Shorthand factory for simple commands. */
export function command(
  name: string,
  execute: CLICommand["execute"],
): CLICommand {
  return createCommand({ name, execute });
}

/* -------------------------------------------------------------------------- */
/* Execution                                                                  */
/* -------------------------------------------------------------------------- */

/** Executes a CLI command with the given context. */
export async function executeCommand(
  command: CLICommand,
  context: CLIContext,
): Promise<void> {
  await command.execute(context);
}
