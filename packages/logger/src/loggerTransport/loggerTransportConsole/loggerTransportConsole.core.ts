/**
 * Console logger transport.
 */

import type {
  LoggerTransport,
  LoggerTransportOptions,
  RegisteredLoggerTransport,
} from "../loggerTransport.type.js";

import { createLoggerTransport } from "../loggerTransport.core.js";

import { serializeTransportEntry } from "../loggerTransportHelpers/loggerTransportHelpers.js";

/**
 * Creates a simple console transport.
 *
 * Uses the standard console methods rather than depending on
 * Node.js-specific APIs.
 */
export function createConsoleLoggerTransport(
  options: LoggerTransportOptions = {},
): RegisteredLoggerTransport {
  const transport: LoggerTransport = {
    name: options.name ?? "console",

    enabled: options.enabled ?? true,

    write(entry): void {
      const payload = serializeTransportEntry(entry);

      switch (entry.levelName) {
        case "fatal":
        case "error":
          console.error(payload);
          break;

        case "warn":
          console.warn(payload);
          break;

        case "debug":
        case "trace":
          console.debug(payload);
          break;

        case "info":
        default:
          console.info(payload);
          break;
      }
    },
  };

  return createLoggerTransport(transport, options);
}
