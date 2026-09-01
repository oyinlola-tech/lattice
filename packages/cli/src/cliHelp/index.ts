/**
 * @oyinlola141/lattice-cli — CLI Help
 *
 * Help text generation and formatting for CLI applications and commands.
 */

export {
  CLIHelpGenerator,
  createHelpGenerator,
  generateCLIHelp,
  generateCommandHelp,
  type CLIHelpOptions,
} from "./cliHelp.generator.js";

export {
  formatTitle,
  formatCommands,
  formatOptions,
  formatArguments,
  formatAliases,
  formatOptionLabel,
  formatArgumentLabel,
  formatUsageSuffix,
  formatGlobalOptions,
  aliasLength,
} from "./cliHelp.formatter.js";
