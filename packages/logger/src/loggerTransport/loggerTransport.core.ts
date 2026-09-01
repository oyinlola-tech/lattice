/**
 * Core logger transport functions.
 */

import type { LoggerEntry } from "../loggerEntry/loggerEntry.type.js";

import type {
  LoggerTransportContext,
  LoggerTransportLike,
  LoggerTransportOptions,
  RegisteredLoggerTransport,
} from "./loggerTransport.type.js";

import {
  createLoggerTransportId,
  isLoggerTransportFunction,
  isLoggerTransportObject,
  isLoggerTransport,
} from "./loggerTransportGuard.js";

/**
 * Creates a registered transport.
 */
export function createLoggerTransport(
  transport: LoggerTransportLike,
  options: LoggerTransportOptions = {},
): RegisteredLoggerTransport {
  if (!isLoggerTransport(transport)) {
    throw new TypeError("Invalid logger transport.");
  }

  const name =
    options.name ??
    (isLoggerTransportObject(transport)
      ? transport.name
      : createLoggerTransportId());

  return Object.freeze({
    name,
    enabled:
      options.enabled ??
      (isLoggerTransportObject(transport) ? transport.enabled : true),
    transport,
    write(
      entry: LoggerEntry,
      context?: LoggerTransportContext,
    ): void | Promise<void> {
      return writeLoggerTransport(transport, entry, context);
    },
    flush(): void | Promise<void> {
      if (isLoggerTransportObject(transport) && transport.flush) {
        return transport.flush();
      }
    },
    close(): void | Promise<void> {
      if (isLoggerTransportObject(transport) && transport.close) {
        return transport.close();
      }
    },
  });
}

/**
 * Writes an entry through a transport.
 */
export async function writeLoggerTransport(
  transport: LoggerTransportLike,
  entry: LoggerEntry,
  context: LoggerTransportContext = {},
): Promise<void> {
  if (isLoggerTransportFunction(transport)) {
    await transport(entry, context);
    return;
  }

  await transport.write(entry, context);
}

/**
 * Enables a transport.
 */
export function enableLoggerTransport(
  transport: RegisteredLoggerTransport,
): RegisteredLoggerTransport {
  return createLoggerTransport(transport.transport, {
    name: transport.name,
    enabled: true,
  });
}

/**
 * Disables a transport.
 */
export function disableLoggerTransport(
  transport: RegisteredLoggerTransport,
): RegisteredLoggerTransport {
  return createLoggerTransport(transport.transport, {
    name: transport.name,
    enabled: false,
  });
}
