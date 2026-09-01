/**
 * @oyinlola141/lattice-cli — CLI Runner
 *
 * Executes CLI commands with lifecycle hooks and error handling.
 */

import type {
  CLICommand,
  CLIContext,
  CLIHooks,
} from "../cliType/cliType.type.js";
import { CLI_EXIT_CODES } from "../cliConstant/cliConstant.value.js";
import { normalizeCLIError } from "../cliError/cliError.base.js";
import { executeCommand } from "../cliCommand/cliCommand.factory.js";

/* -------------------------------------------------------------------------- */
/* Runner Options                                                             */
/* -------------------------------------------------------------------------- */

/** Configuration for the CLI runner. */
export interface CLIRunnerOptions {
  readonly hooks?: CLIHooks;
  readonly onError?: (
    error: unknown,
    context: CLIContext,
  ) => void | Promise<void>;
}

/* -------------------------------------------------------------------------- */
/* Runner                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Executes CLI commands with lifecycle hooks and error handling.
 */
export class CLIRunner {
  private readonly hooks: CLIHooks;
  private readonly onError?: CLIRunnerOptions["onError"];
  private running = false;

  constructor(options: CLIRunnerOptions = {}) {
    this.hooks = options.hooks ?? {};
    this.onError = options.onError;
  }

  /** Runs a command with hooks and error handling. */
  public async run(command: CLICommand, context: CLIContext): Promise<number> {
    if (this.running) return CLI_EXIT_CODES.GENERAL_ERROR;

    this.running = true;

    try {
      if (this.hooks.beforeRun) {
        await this.hooks.beforeRun(context);
      }

      await executeCommand(command, context);

      if (this.hooks.afterRun) {
        await this.hooks.afterRun(context, CLI_EXIT_CODES.SUCCESS);
      }

      return CLI_EXIT_CODES.SUCCESS;
    } catch (error) {
      const normalized = normalizeCLIError(error);

      if (this.hooks.onError) {
        await this.hooks.onError(normalized, context);
      }

      if (this.onError) {
        await this.onError(normalized, context);
      }

      return normalized.exitCode;
    } finally {
      this.running = false;
    }
  }

  /** Runs a command, catching any unhandled errors. */
  public async safeRun(
    command: CLICommand,
    context: CLIContext,
  ): Promise<number> {
    try {
      return await this.run(command, context);
    } catch {
      return CLI_EXIT_CODES.GENERAL_ERROR;
    }
  }

  /** Whether the runner is currently executing. */
  public get isRunning(): boolean {
    return this.running;
  }
}

/* -------------------------------------------------------------------------- */
/* Factory                                                                    */
/* -------------------------------------------------------------------------- */

/** Creates a new CLI runner. */
export function createCLIRunner(options: CLIRunnerOptions = {}): CLIRunner {
  return new CLIRunner(options);
}

/** Convenience function to run a single command. */
export async function runCLICommand(
  command: CLICommand,
  context: CLIContext,
  options: CLIRunnerOptions = {},
): Promise<number> {
  const runner = createCLIRunner(options);
  return runner.run(command, context);
}
