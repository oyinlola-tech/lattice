/**
 * zudolib-cli — CLI Errors
 *
 * All CLI error types re-exported from their respective files.
 */

export {
  CLIError,
  isCLIError,
  normalizeCLIError,
  getCLIExitCode,
  getCLIErrorCode,
  type CLIErrorOptions,
} from "./cliError.base.js";

export {
  CommandNotFoundError,
  DuplicateCommandError,
  InvalidCommandNameError,
} from "./cliError.command.js";

export {
  InvalidArgumentsError,
  MissingArgumentError,
} from "./cliError.argument.js";

export {
  InvalidOptionError,
  InvalidOptionNameError,
  MissingOptionValueError,
  DuplicateOptionError,
} from "./cliError.option.js";

export {
  CLIExecutionError,
  CLIPermissionError,
  CLIInterruptedError,
  CLIConfigurationError,
} from "./cliError.execution.js";
