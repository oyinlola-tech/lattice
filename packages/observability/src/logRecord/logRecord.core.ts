/**
 * @zudojs/observability — Log Record
 *
 * Factory functions for creating structured log records.
 */

import type { LogRecord } from "../types.js";
import { LogLevel, type LogLevelName } from "../types.js";

/** Creates a structured log record. */
export function createLogRecord(options: {
  readonly level: LogLevel;
  readonly message: string;
  readonly loggerName: string;
  readonly context?: Record<string, unknown>;
  readonly error?: Error;
}): LogRecord {
  const error = options.error
    ? {
        name: options.error.name,
        message: options.error.message,
        stack: options.error.stack,
        cause: options.error.cause,
      }
    : undefined;

  return {
    level: options.level,
    levelName: logLevelToNameInternal(options.level),
    message: options.message,
    timestamp: new Date(),
    loggerName: options.loggerName,
    context: options.context,
    error,
  };
}

/** Creates a log record for an error. */
export function createErrorLogRecord(
  error: Error,
  level: LogLevel,
  loggerName: string,
): LogRecord {
  return createLogRecord({
    level,
    message: error.message,
    loggerName,
    context: { stack: error.stack },
    error,
  });
}

function logLevelToNameInternal(level: LogLevel): LogLevelName {
  const names: Record<number, LogLevelName> = {
    [LogLevel.TRACE]: "trace",
    [LogLevel.DEBUG]: "debug",
    [LogLevel.INFO]: "info",
    [LogLevel.WARN]: "warn",
    [LogLevel.ERROR]: "error",
    [LogLevel.FATAL]: "fatal",
    [LogLevel.OFF]: "off",
  };
  return names[level] ?? "off";
}
