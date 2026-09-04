/**
 * zudojs-cli — CLI Type Definitions
 *
 * Core types, interfaces, and type aliases for the CLI package.
 */

import type { Logger } from "@zudojs/logger";

/* -------------------------------------------------------------------------- */
/* Core CLI Types                                                             */
/* -------------------------------------------------------------------------- */

/** A single CLI value. */
export type CLIValue =
  string | number | boolean | undefined | readonly string[];

/** A map of option names to values. */
export type CLIValues = Record<string, CLIValue>;

/** Positional CLI arguments. */
export type CLIArguments = readonly string[];

/** Environment variables. */
export type CLIEnvironment = Record<string, string | undefined>;

/** Runtime context passed to command handlers. */
export interface CLIContext {
  readonly args: CLIArguments;
  readonly values: CLIValues;
  readonly command?: string;
  readonly cwd: string;
  readonly env: CLIEnvironment;
  readonly logger: Logger;
}

/* -------------------------------------------------------------------------- */
/* Command Types                                                              */
/* -------------------------------------------------------------------------- */

/** A registered CLI command. */
export interface CLICommand {
  readonly name: string;
  readonly description?: string;
  readonly aliases?: readonly string[];
  readonly options?: readonly CLIOption[];
  readonly arguments?: readonly CLIArgument[];
  readonly commands?: readonly CLICommand[];
  execute(context: CLIContext): void | Promise<void>;
}

/** Definition object used to create a CLICommand. */
export interface CLICommandDefinition extends Omit<CLICommand, "execute"> {
  readonly execute: CLICommand["execute"];
}

/* -------------------------------------------------------------------------- */
/* Arguments                                                                  */
/* -------------------------------------------------------------------------- */

/** A positional argument definition. */
export interface CLIArgument {
  readonly name: string;
  readonly description?: string;
  readonly required?: boolean;
  readonly variadic?: boolean;
  readonly defaultValue?: CLIValue;
}

/* -------------------------------------------------------------------------- */
/* Options                                                                    */
/* -------------------------------------------------------------------------- */

/** Option value type. */
export type CLIOptionType = "string" | "number" | "boolean";

/** A named option definition. */
export interface CLIOption {
  readonly name: string;
  readonly short?: string;
  readonly description?: string;
  readonly type?: CLIOptionType;
  readonly required?: boolean;
  readonly defaultValue?: CLIValue;
  readonly multiple?: boolean;
}

/* -------------------------------------------------------------------------- */
/* Parsed Input                                                               */
/* -------------------------------------------------------------------------- */

/** Result of parsing CLI arguments. */
export interface ParsedCLIInput {
  readonly command?: string;
  readonly commands: readonly string[];
  readonly args: CLIArguments;
  readonly options: CLIValues;
}

/* -------------------------------------------------------------------------- */
/* CLI Application                                                            */
/* -------------------------------------------------------------------------- */

/** Options for creating a CLI application. */
export interface CLIApplicationOptions {
  readonly name?: string;
  readonly version?: string;
  readonly description?: string;
  readonly logger?: Logger;
  readonly cwd?: string;
  readonly env?: CLIEnvironment;
}

/** The CLI application interface. */
export interface CLIApplication {
  readonly name: string;
  readonly version?: string;
  readonly description?: string;
  register(command: CLICommand): CLIApplication;
  registerMany(commands: readonly CLICommand[]): CLIApplication;
  run(args?: CLIArguments): Promise<number>;
}

/* -------------------------------------------------------------------------- */
/* Output                                                                     */
/* -------------------------------------------------------------------------- */

/** Result of a CLI execution. */
export interface CLIOutput {
  readonly stdout: string;
  readonly stderr: string;
  readonly exitCode: number;
}

/** Writer interface for CLI output. */
export interface CLIWriter {
  write(message: string): void;
  writeLine(message?: string): void;
  error(message: string): void;
  errorLine(message?: string): void;
}

/* -------------------------------------------------------------------------- */
/* Prompting                                                                  */
/* -------------------------------------------------------------------------- */

/** Options for a text prompt. */
export interface CLIPromptOptions {
  readonly message: string;
  readonly defaultValue?: string;
  readonly required?: boolean;
  readonly hidden?: boolean;
}

/** Interactive prompt interface. */
export interface CLIPrompt {
  text(options: CLIPromptOptions): Promise<string>;
  confirm(message: string, defaultValue?: boolean): Promise<boolean>;
  select<T>(message: string, choices: readonly CLIChoice<T>[]): Promise<T>;
}

/** A selectable choice. */
export interface CLIChoice<T = string> {
  readonly label: string;
  readonly value: T;
  readonly description?: string;
}

/* -------------------------------------------------------------------------- */
/* Lifecycle                                                                  */
/* -------------------------------------------------------------------------- */

/** Lifecycle hooks for the CLI application. */
export interface CLIHooks {
  beforeRun?: (context: CLIContext) => void | Promise<void>;
  afterRun?: (context: CLIContext, exitCode: number) => void | Promise<void>;
  onError?: (error: unknown, context?: CLIContext) => void | Promise<void>;
}
