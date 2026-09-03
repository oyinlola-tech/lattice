/**
 * ZudoLogger log level convenience methods.
 */

import { LoggerLevel } from "../../loggerLevel/loggerLevel.type.js";

import type { LogMetadata } from "../../loggerEntry/loggerEntry.type.js";

import { logAtLevel } from "./loggerCoreMethods/index.js";

import type { ZudoLoggerContext } from "../core/loggerCore.core.js";

import type { LogOptions } from "../../loggerOptions/loggerOptions.type.js";

/**
 * Creates bound log methods for a given context.
 */
export function createLogMethods(ctx: ZudoLoggerContext) {
  return {
    fatal: (message: string, metadata?: LogMetadata) =>
      logAtLevel(ctx, LoggerLevel.FATAL, message, { metadata }),
    error: (message: string, metadata?: LogMetadata) =>
      logAtLevel(ctx, LoggerLevel.ERROR, message, { metadata }),
    warn: (message: string, metadata?: LogMetadata) =>
      logAtLevel(ctx, LoggerLevel.WARN, message, { metadata }),
    info: (message: string, metadata?: LogMetadata) =>
      logAtLevel(ctx, LoggerLevel.INFO, message, { metadata }),
    debug: (message: string, metadata?: LogMetadata) =>
      logAtLevel(ctx, LoggerLevel.DEBUG, message, { metadata }),
    trace: (message: string, metadata?: LogMetadata) =>
      logAtLevel(ctx, LoggerLevel.TRACE, message, { metadata }),
    log: (level: LoggerLevel, message: string, options?: LogOptions) =>
      logAtLevel(ctx, level, message, options),
  };
}
