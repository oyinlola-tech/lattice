/**
 * Logger entry dispatch to transports.
 */

import type {
  LoggerEntry,
} from "../../../loggerEntry/loggerEntry.type.js";

import {
  formatLoggerEntry,
} from "../../../loggerFormatter/loggerFormatter.core.js";

import {
  createLoggerTransport,
  writeLoggerTransport,
} from "../../../loggerTransport/loggerTransport.core.js";

import {
  isLoggerTransport,
} from "../../../loggerTransport/loggerTransportGuard.js";

import {
  LoggerFormatterError,
  LoggerTransportError,
  toLoggerError,
} from "../../../loggerErrors/loggerError.base.js";

import type {
  LoggerConfiguration,
} from "../../../loggerOptions/loggerOptions.type.js";

/**
 * Default formatter used when no formatter is configured.
 */
import {
  createTextLoggerFormatter,
} from "../../../loggerFormatter/loggerFormatterFormatters/loggerFormatterFormatters.text.js";

function defaultFormat(
  configuration: LoggerConfiguration,
  entry: LoggerEntry,
): string {
  return createTextLoggerFormatter({
    name: "default",
  }).format(entry, {
    loggerName: configuration.name,
    environment: configuration.environment,
  });
}

/**
 * Writes to a transport.
 */
async function writeTransport(
  configuration: LoggerConfiguration,
  transport: ReturnType<typeof createLoggerTransport>,
  entry: LoggerEntry,
  formatted: unknown,
): Promise<void> {
  const transportContext = {
    loggerName: configuration.name,
    environment: configuration.environment,
  };

  if (typeof formatted === "string") {
    const formattedEntry = { ...entry, message: formatted };
    await writeLoggerTransport(transport.transport, formattedEntry, transportContext);
    return;
  }

  await writeLoggerTransport(transport.transport, entry, transportContext);
}

/**
 * Dispatches an entry to the configured transports.
 */
export async function dispatchEntry(
  configuration: LoggerConfiguration,
  entry: LoggerEntry,
  handleError: (error: Error) => void,
): Promise<void> {
  const formatter = configuration.formatter;
  let formatted: unknown;

  try {
    if (typeof formatter === "string") {
      formatted = defaultFormat(configuration, entry);
    } else {
      formatted = formatLoggerEntry(formatter, entry, {
        loggerName: configuration.name,
        environment: configuration.environment,
      });
    }
  } catch (error) {
    const formatterError = new LoggerFormatterError(
      `Failed to format log entry: ${toLoggerError(error).message}`,
      { cause: error },
    );
    handleError(formatterError);
    return;
  }

  for (const transport of configuration.transports) {
    try {
      if (!isLoggerTransport(transport)) {
        continue;
      }

      const registered = createLoggerTransport(transport);

      if (!registered.enabled) {
        continue;
      }

      await writeTransport(configuration, registered, entry, formatted);
    } catch (error) {
      const transportError = new LoggerTransportError(
        `Failed to write log entry: ${toLoggerError(error).message}`,
        { cause: error },
      );
      handleError(transportError);
    }
  }
}
