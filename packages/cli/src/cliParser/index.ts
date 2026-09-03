/**
 * zudo-cli — CLI Parser
 *
 * Argument parsing, option resolution, and token classification.
 */

export { CLIParser, type CLIParserOptions } from "./cliParser.core.js";
export {
  parseLongOption,
  findOption,
  assignOptionValue,
} from "./cliParser.longOption.js";
export { parseShortOption } from "./cliParser.shortOption.js";
export {
  parseCLIArguments,
  parseOptionValue,
  parseBoolean,
  isOption,
  isLongOption,
  isShortOption,
  resolveCommand,
  normalizeCLIValue,
} from "./cliParser.helper.js";
