/**
 * @oyinlola141/lattice-cli — Help Formatter
 *
 * Formatting utilities for CLI help text output.
 */

import type { CLIArgument, CLICommand, CLIOption } from "../cliType/cliType.type.js";
import { CLI_OPTION_PREFIXES } from "../cliConstant/cliConstant.value.js";

/** Formats a title line with optional version. */
export function formatTitle(name: string, version?: string): string {
  return version ? `${name} v${version}` : name;
}

/** Formats a list of commands with alignment. */
export function formatCommands(commands: readonly CLICommand[]): string {
  if (commands.length === 0) return "  No commands available.";

  const sorted = [...commands].sort((a, b) => a.name.localeCompare(b.name));
  const width = Math.max(
    ...sorted.map((c) => c.name.length + aliasLength(c)),
  );

  return sorted
    .map((cmd) => {
      const aliases = cmd.aliases?.length ? ` (${cmd.aliases.join(", ")})` : "";
      const label = `${cmd.name}${aliases}`;
      const padding = " ".repeat(Math.max(2, width - label.length + 2));
      return `  ${label}${padding}${cmd.description ?? ""}`;
    })
    .join("\n");
}

/** Formats a list of options with alignment. */
export function formatOptions(options: readonly CLIOption[]): string {
  if (options.length === 0) return "  No options available.";

  const sorted = [...options].sort((a, b) => a.name.localeCompare(b.name));
  const labels = sorted.map((o) => formatOptionLabel(o));
  const width = Math.max(...labels.map((l) => l.length));

  return sorted
    .map((option, index) => {
      const label = labels[index]!;
      const padding = " ".repeat(Math.max(2, width - label.length + 2));
      const required = option.required ? " [required]" : "";
      const multiple = option.multiple ? " [multiple]" : "";
      const defaultValue =
        option.defaultValue !== undefined
          ? ` [default: ${String(option.defaultValue)}]`
          : "";
      return `  ${label}${padding}${option.description ?? ""}${required}${multiple}${defaultValue}`;
    })
    .join("\n");
}

/** Formats a list of arguments with alignment. */
export function formatArguments(argumentsList: readonly CLIArgument[]): string {
  if (argumentsList.length === 0) return "  No arguments available.";

  const labels = argumentsList.map((a) => formatArgumentLabel(a));
  const width = Math.max(...labels.map((l) => l.length));

  return argumentsList
    .map((argument, index) => {
      const label = labels[index]!;
      const padding = " ".repeat(Math.max(2, width - label.length + 2));
      const required = argument.required ? " [required]" : "";
      const variadic = argument.variadic ? " [variadic]" : "";
      const defaultValue =
        argument.defaultValue !== undefined
          ? ` [default: ${String(argument.defaultValue)}]`
          : "";
      return `  ${label}${padding}${argument.description ?? ""}${required}${variadic}${defaultValue}`;
    })
    .join("\n");
}

/** Formats a list of aliases. */
export function formatAliases(aliases: readonly string[]): string {
  return aliases.map((alias) => `  ${alias}`).join("\n");
}

/** Formats an option label with short/long form. */
export function formatOptionLabel(option: CLIOption): string {
  const short = option.short ? `${CLI_OPTION_PREFIXES.SHORT}${option.short}` : "";
  const long = `${CLI_OPTION_PREFIXES.LONG}${option.name}`;
  const prefix = short ? `${short}, ${long}` : long;

  if (option.type === "boolean" || !option.type) return prefix;
  return `${prefix} <${option.type}>`;
}

/** Formats an argument label. */
export function formatArgumentLabel(argument: CLIArgument): string {
  const suffix = argument.variadic ? "..." : "";
  return `<${argument.name}${suffix}>`;
}

/** Formats the usage suffix for a command. */
export function formatUsageSuffix(command: CLICommand): string {
  const argumentUsage = command.arguments?.length
    ? ` ${command.arguments
        .map((a) =>
          a.required
            ? `<${a.name}${a.variadic ? "..." : ""}>`
            : `[${a.name}${a.variadic ? "..." : ""}]`,
        )
        .join(" ")}`
    : "";

  const optionUsage = command.options?.length ? " [options]" : "";
  const nestedUsage = command.commands?.length ? " <subcommand>" : "";

  return `${argumentUsage}${optionUsage}${nestedUsage}`;
}

/** Formats global options. */
export function formatGlobalOptions(): string {
  return ["  -h, --help     Show help.", "  -v, --version  Show version."].join("\n");
}

/** Calculates alias length for alignment. */
export function aliasLength(command: CLICommand): number {
  if (!command.aliases?.length) return 0;
  return command.aliases.join(", ").length + 3;
}
