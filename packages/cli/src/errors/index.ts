/**
 * zudo-cli — Errors
 *
 * Error classes for the CLI scaffolding system.
 */

import { ApplicationError } from "@zudolib/errors";

export class CLIValidationError extends ApplicationError {
  constructor(message: string) {
    super(message, { isOperational: true });
  }
}

export class CLIGenerationError extends ApplicationError {
  constructor(message: string, cause?: unknown) {
    super(message, { cause });
  }
}

export class CLINotInProjectError extends ApplicationError {
  constructor() {
    super("This command must be run inside a Zudo project directory.", {
      isOperational: true,
    });
  }
}

export class CLITemplateError extends ApplicationError {
  constructor(message: string) {
    super(message);
  }
}
