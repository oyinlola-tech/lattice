/**
 * Logger entry creation for dispatch.
 */

import type { LoggerLevel } from "../../../loggerLevel/loggerLevel.type.js";

import type {
  LogMetadata,
  LoggerEntry,
  LoggerEntryInput,
} from "../../../loggerEntry/loggerEntry.type.js";

import { createLoggerEntry } from "../../../loggerEntry/loggerEntry.core.js";

import {
  contextToLogMetadata,
  createLoggerContext,
} from "../../../loggerContext/loggerContext.core.js";

import type {
  LoggerConfiguration,
  LogOptions,
} from "../../../loggerOptions/loggerOptions.type.js";

/**
 * Creates a normalized log entry.
 */
export function createEntry(
  configuration: LoggerConfiguration,
  contextStorage: {
    get():
      | import("../../../loggerContext/loggerContext.core.js").LoggerContext
      | undefined;
  },
  level: LoggerLevel,
  message: string,
  options: LogOptions,
): LoggerEntry {
  const activeContext = configuration.inheritContext
    ? contextStorage.get()
    : undefined;

  const contextMetadata = activeContext
    ? contextToLogMetadata(activeContext)
    : {};

  const metadata = {
    ...configuration.metadata,
    ...contextMetadata,
    ...(options.metadata ?? {}),
  } as LogMetadata;

  const context = options.context
    ? createLoggerContext({
        parent: activeContext,
        metadata: options.context,
      })
    : activeContext;

  const input: LoggerEntryInput = {
    level,
    message,
    metadata,
    context: context
      ? {
          metadata:
            context.metadata as unknown as import("../../../loggerEntry/loggerEntry.type.js").LogMetadata,
        }
      : undefined,
    source: options.source,
    error: options.error,
    logger: options.logger ?? configuration.name,
    timestamp: options.timestamp,
    environment: configuration.environment,
  };

  return createLoggerEntry(input);
}
