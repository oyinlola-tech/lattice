/**
 * @oyinlola141/lattice-cli — Help Generator
 *
 * Generates formatted help text for CLI applications and commands.
 */

import type { CLICommand } from "../cliType/cliType.type.js";
import { CLI_DEFAULTS, CLI_HELP } from "../cliConstant/cliConstant.value.js";
import {
  formatTitle,
  formatCommands,
  formatOptions,
  formatArguments,
  formatAliases,
  formatUsageSuffix,
  formatGlobalOptions,
} from "./cliHelp.formatter.js";

/* -------------------------------------------------------------------------- */
/* Help Options                                                               */
/* -------------------------------------------------------------------------- */

/** Options for help generation. */
export interface CLIHelpOptions {
  readonly name?: string;
  readonly version?: string;
  readonly description?: string;
  readonly command?: CLICommand;
  readonly includeGlobalOptions?: boolean;
}

/* -------------------------------------------------------------------------- */
/* Help Generator                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Generates formatted help text for CLI applications and commands.
 */
export class CLIHelpGenerator {
  private readonly name: string;
  private readonly version?: string;
  private readonly description?: string;

  constructor(options: CLIHelpOptions = {}) {
    this.name = options.name ?? CLI_DEFAULTS.NAME;
    this.version = options.version;
    this.description = options.description;
  }

  /** Generates application-level help text. */
  public generate(
    commands: readonly CLICommand[] = [],
    options: CLIHelpOptions = {},
  ): string {
    const lines: string[] = [];
    const name = options.name ?? this.name;
    const version = options.version ?? this.version;
    const description = options.description ?? this.description;

    lines.push(formatTitle(name, version));
    if (description) lines.push(description);

    lines.push("", CLI_HELP.USAGE, `  ${name} <command> [options]`);

    if (commands.length > 0) {
      lines.push("", CLI_HELP.COMMANDS, formatCommands(commands));
    }

    if (options.includeGlobalOptions !== false) {
      lines.push("", CLI_HELP.OPTIONS, formatGlobalOptions());
    }

    return lines.join("\n");
  }

  /** Generates command-level help text. */
  public generateCommand(command: CLICommand, options: CLIHelpOptions = {}): string {
    const lines: string[] = [];
    const name = options.name ?? this.name;

    lines.push(formatTitle(`${name} ${command.name}`));
    if (command.description) lines.push(command.description);

    lines.push("", CLI_HELP.USAGE, `  ${name} ${command.name}${formatUsageSuffix(command)}`);

    if (command.aliases?.length) {
      lines.push("", CLI_HELP.ALIASES, formatAliases(command.aliases));
    }

    if (command.arguments?.length) {
      lines.push("", CLI_HELP.ARGUMENTS, formatArguments(command.arguments));
    }

    if (command.options?.length) {
      lines.push("", CLI_HELP.OPTIONS, formatOptions(command.options));
    }

    if (command.commands?.length) {
      lines.push("", CLI_HELP.COMMANDS, formatCommands(command.commands));
    }

    return lines.join("\n");
  }
}

/* -------------------------------------------------------------------------- */
/* Factory                                                                    */
/* -------------------------------------------------------------------------- */

/** Creates a help generator. */
export function createHelpGenerator(options: CLIHelpOptions = {}): CLIHelpGenerator {
  return new CLIHelpGenerator(options);
}

/** Generates application help text. */
export function generateCLIHelp(
  commands: readonly CLICommand[],
  options: CLIHelpOptions = {},
): string {
  return createHelpGenerator(options).generate(commands, options);
}

/** Generates command help text. */
export function generateCommandHelp(
  command: CLICommand,
  options: CLIHelpOptions = {},
): string {
  return createHelpGenerator(options).generateCommand(command, options);
}
