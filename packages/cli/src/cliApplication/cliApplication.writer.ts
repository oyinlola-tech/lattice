/**
 * @oyinlola141/lattice-cli — CLI Writer
 *
 * Writer factory and signal handling for the CLI application.
 */

import type { CLIWriter } from "../cliType/cliType.type.js";
import { CLI_EXIT_CODES } from "../cliConstant/cliConstant.value.js";

/* -------------------------------------------------------------------------- */
/* Writer Factory                                                             */
/* -------------------------------------------------------------------------- */

/** Creates a CLIWriter that writes to stdout/stderr. */
export function createCLIWriter(): CLIWriter {
  return {
    write(message: string): void {
      process.stdout.write(message);
    },

    writeLine(message = ""): void {
      process.stdout.write(`${message}\n`);
    },

    error(message: string): void {
      process.stderr.write(message);
    },

    errorLine(message = ""): void {
      process.stderr.write(`${message}\n`);
    },
  };
}

/* -------------------------------------------------------------------------- */
/* Signal Handling                                                            */
/* -------------------------------------------------------------------------- */

/** Registers a SIGINT handler and returns an unsubscribe function. */
export function registerCLIInterruptHandler(
  onInterrupt: () => void | Promise<void>,
): () => void {
  const handler = async () => {
    try {
      await onInterrupt();
    } finally {
      process.exit(CLI_EXIT_CODES.INTERRUPTED);
    }
  };

  process.on("SIGINT", handler);

  return () => {
    process.off("SIGINT", handler);
  };
}
