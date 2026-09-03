/**
 * Logger helper functions.
 */

import type { LogMetadata } from "../../loggerEntry/loggerEntry.type.js";

import type { LoggerContext } from "../../loggerContext/loggerContext.core.js";

import { createTextLoggerFormatter } from "../../loggerFormatter/loggerFormatterFormatters/loggerFormatterFormatters.text.js";

import { createConsoleLoggerTransport } from "../../loggerTransport/loggerTransport.registry.js";

import type { ChildLoggerOptions } from "../../loggerOptions/loggerOptions.type.js";

import type { Logger } from "../core/loggerCore.type.js";

import { ContextLogger } from "../core/loggerCore.context.js";

import { createLogger } from "../core/loggerCore.core.js";

/**
 * Creates a child logger.
 */
export function createChildLogger(
  parent: Logger,
  options: ChildLoggerOptions = {},
): Logger {
  return parent.child(options);
}

/**
 * Creates a logger specifically for an error.
 */
export function logError(
  logger: Logger,
  error: Error,
  message?: string,
  metadata?: LogMetadata,
): void {
  if (!logger.enabled) {
    return;
  }

  logger.log(1, message ?? error.message, {
    metadata,
    error,
  });
}

/**
 * Creates a logger context and executes a callback inside it.
 */
export function withLoggerContext<T>(
  logger: Logger,
  context: LoggerContext,
  callback: () => T,
): T {
  const scoped = logger.withContext(context);

  if (scoped instanceof ContextLogger) {
    return callback();
  }

  return callback();
}

/**
 * Creates a default application logger.
 */
export function createDefaultLogger(name = "zudolib"): Logger {
  return createLogger({
    name,
    level: 3,
    formatter: createTextLoggerFormatter(),
    transports: [createConsoleLoggerTransport()],
  });
}
