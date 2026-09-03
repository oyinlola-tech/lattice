/**
 * zudolib-cli — Command Validator
 *
 * Validation logic and utility functions for CLI commands.
 */

import type { CLICommand } from "../cliType/cliType.type.js";
import {
  InvalidCommandNameError,
  DuplicateCommandError,
} from "../cliError/cliError.command.js";

/* -------------------------------------------------------------------------- */
/* Validation                                                                 */
/* -------------------------------------------------------------------------- */

/** Validates a CLI command definition. */
export function validateCommand(command: CLICommand): void {
  if (!command || typeof command !== "object") {
    throw new TypeError("CLI command must be an object.");
  }

  if (typeof command.name !== "string" || !command.name.trim()) {
    throw new InvalidCommandNameError(String(command.name ?? ""));
  }

  if (!/^[a-zA-Z0-9][a-zA-Z0-9:_-]*$/.test(command.name.trim())) {
    throw new InvalidCommandNameError(command.name);
  }

  if (
    command.description !== undefined &&
    typeof command.description !== "string"
  ) {
    throw new TypeError(
      `Description for command "${command.name}" must be a string.`,
    );
  }

  if (command.aliases) {
    const seen = new Set<string>();

    for (const alias of command.aliases) {
      if (typeof alias !== "string" || !alias.trim()) {
        throw new InvalidCommandNameError(String(alias));
      }

      const normalized = alias.trim();

      if (normalized === command.name.trim()) {
        throw new DuplicateCommandError(normalized);
      }

      if (seen.has(normalized)) {
        throw new DuplicateCommandError(normalized);
      }

      seen.add(normalized);
    }
  }

  if (typeof command.execute !== "function") {
    throw new TypeError(
      `Command "${command.name}" must define an execute function.`,
    );
  }
}

/* -------------------------------------------------------------------------- */
/* Utilities                                                                  */
/* -------------------------------------------------------------------------- */

/** Type guard for CLICommand. */
export function isCLICommand(value: unknown): value is CLICommand {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<CLICommand>;
  return (
    typeof candidate.name === "string" &&
    typeof candidate.execute === "function"
  );
}

/** Returns a sorted copy of the commands array. */
export function sortCommands(commands: readonly CLICommand[]): CLICommand[] {
  return [...commands].sort((a, b) => a.name.localeCompare(b.name));
}
