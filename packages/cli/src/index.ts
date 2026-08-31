/**
 * @lattice/cli
 *
 * Command-line interface framework for the Lattice platform.
 *
 * @example
 * ```ts
 * import { createCLI, command } from "@lattice/cli";
 *
 * const app = createCLI({ name: "my-app", version: "1.0.0" });
 *
 * app.register(
 *   command("greet", (ctx) => {
 *     console.log(`Hello, ${ctx.values.name ?? "World"}!`);
 *   }),
 * );
 *
 * app.run(process.argv.slice(2));
 * ```
 */

// Types
export type {
  CLIValue,
  CLIValues,
  CLIArguments,
  CLIEnvironment,
  CLIContext,
  CLICommand,
  CLICommandDefinition,
  CLIArgument,
  CLIOptionType,
  CLIOption,
  ParsedCLIInput,
  CLIApplicationOptions,
  CLIApplication,
  CLIOutput,
  CLIWriter,
  CLIPromptOptions,
  CLIPrompt,
  CLIChoice,
  CLIHooks,
} from "./cliType/index.js";

// Constants
export {
  CLI_NAME,
  CLI_DEFAULTS,
  CLI_COMMANDS,
  CLI_ALIASES,
  CLI_OPTION_PREFIXES,
  CLI_SYMBOLS,
  CLI_MESSAGES,
  CLI_HELP,
  CLI_ENVIRONMENT,
  CLI_FORMAT,
  CLI_LIMITS,
  CLI_ERROR_CODES,
  type CLIErrorCode,
  type CLICommandName,
} from "./cliConstant/index.js";

// Errors
export {
  CLIError,
  isCLIError,
  normalizeCLIError,
  getCLIExitCode,
  getCLIErrorCode,
  type CLIErrorOptions,
  CommandNotFoundError,
  DuplicateCommandError,
  InvalidCommandNameError,
  InvalidArgumentsError,
  MissingArgumentError,
  InvalidOptionError,
  InvalidOptionNameError,
  MissingOptionValueError,
  DuplicateOptionError,
  CLIExecutionError,
  CLIPermissionError,
  CLIInterruptedError,
  CLIConfigurationError,
} from "./cliError/index.js";

// Commands
export {
  CLICommandRegistry,
  CLICommandBuilder,
  createCommand,
  command,
  executeCommand,
  validateCommand,
  isCLICommand,
  sortCommands,
} from "./cliCommand/index.js";

// Parser
export {
  CLIParser,
  type CLIParserOptions,
  parseCLIArguments,
  parseOptionValue,
  parseBoolean,
  isOption,
  isLongOption,
  isShortOption,
  resolveCommand,
  normalizeCLIValue,
} from "./cliParser/index.js";

// Application
export {
  LatticeCLI,
  createCLI,
  createCLIWriter,
  registerCLIInterruptHandler,
} from "./cliApplication/index.js";

// Runner
export {
  CLIRunner,
  createCLIRunner,
  runCLICommand,
  type CLIRunnerOptions,
} from "./cliRunner/index.js";

// Help
export {
  CLIHelpGenerator,
  createHelpGenerator,
  generateCLIHelp,
  generateCommandHelp,
  type CLIHelpOptions,
} from "./cliHelp/index.js";

// Version
export {
  getCLIVersion,
  formatCLIVersion,
  getVersionString,
  isValidVersion,
  compareVersions,
  parseVersion,
  isCompatibleVersion,
  type CLIVersionInfo,
} from "./cliVersion/index.js";
