/**
 * @oyinlola141/lattice-cli — Option Errors
 *
 * Error classes for option validation failures.
 */

import { ConflictError } from "@oyinlola141/lattice-errors";
import { CLIError } from "./cliError.base.js";
import { CLI_ERROR_CODES, CLI_EXIT_CODES } from "../cliConstant/cliConstant.value.js";

/* -------------------------------------------------------------------------- */
/* Invalid Option                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Thrown when an unknown or invalid option is encountered.
 */
export class InvalidOptionError extends CLIError {
  constructor(option: string, command?: string) {
    super(`Unknown or invalid option "${option}".`, {
      code: CLI_ERROR_CODES.INVALID_OPTION,
      exitCode: CLI_EXIT_CODES.INVALID_ARGUMENTS,
      command,
      option,
      statusCode: 400,
    });
  }
}

/* -------------------------------------------------------------------------- */
/* Invalid Option Name                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Thrown when an option name fails validation.
 */
export class InvalidOptionNameError extends CLIError {
  constructor(option: string) {
    super(`Invalid option name "${option}".`, {
      code: CLI_ERROR_CODES.INVALID_OPTION_NAME,
      exitCode: CLI_EXIT_CODES.INVALID_ARGUMENTS,
      option,
      statusCode: 400,
    });
  }
}

/* -------------------------------------------------------------------------- */
/* Missing Option Value                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Thrown when a required option value is missing.
 */
export class MissingOptionValueError extends CLIError {
  constructor(option: string, command?: string) {
    super(`Option "${option}" requires a value.`, {
      code: CLI_ERROR_CODES.MISSING_OPTION_VALUE,
      exitCode: CLI_EXIT_CODES.INVALID_ARGUMENTS,
      command,
      option,
      statusCode: 400,
    });
  }
}

/* -------------------------------------------------------------------------- */
/* Duplicate Option                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Thrown when an option name is already registered.
 * Extends `ConflictError` from `@oyinlola141/lattice-errors`.
 */
export class DuplicateOptionError extends ConflictError {
  public readonly exitCode: number;

  constructor(option: string) {
    super(`Option "${option}" is already registered.`, {
      code: CLI_ERROR_CODES.DUPLICATE_OPTION,
      statusCode: 409,
      expose: true,
      metadata: { option },
    });

    this.exitCode = CLI_EXIT_CODES.INVALID_ARGUMENTS;
  }

  public override toJSON() {
    return {
      ...super.toJSON(),
      exitCode: this.exitCode,
    };
  }
}
