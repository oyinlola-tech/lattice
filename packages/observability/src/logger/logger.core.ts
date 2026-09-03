/**
 * @zudo/observability — Logger Core
 *
 * Structured logger implementation with level filtering, transport support,
 * child loggers, and persistent context.
 */

import type { Logger, LoggerOptions, LogTransport } from "../types.js";
import { LogLevel } from "../types.js";
import { shouldLog, logLevelToName } from "../logLevel/index.js";
import { createLogRecord } from "../logRecord/index.js";

/** Default no-op transport that discards all records. */
const noopTransport: LogTransport = {
  name: "noop",
  write: () => {},
};

/**
 * Core structured logger with level filtering, child loggers,
 * persistent context, and transport support.
 */
export class StructuredLogger implements Logger {
  readonly name: string;
  readonly level: LogLevel;

  private readonly context: Record<string, unknown>;
  private readonly transport: LogTransport;

  constructor(options: LoggerOptions) {
    this.name = options.name;
    this.level = options.level ?? LogLevel.INFO;
    this.context = { ...(options.context ?? {}) };
    this.transport = options.transport ?? noopTransport;
  }

  trace(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.TRACE, message, context);
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.ERROR, message, context);
  }

  fatal(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.FATAL, message, context);
  }

  child(name: string, context?: Record<string, unknown>): Logger {
    const childName = `${this.name}.${name}`;
    const childContext = { ...this.context, ...(context ?? {}) };
    return new StructuredLogger({
      name: childName,
      level: this.level,
      context: childContext,
      transport: this.transport,
    });
  }

  isLevelEnabled(level: LogLevel): boolean {
    return shouldLog(this.level, level);
  }

  async flush(): Promise<void> {
    // Transport-specific flush; default is no-op
  }

  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
  ): void {
    if (!this.isLevelEnabled(level)) return;

    const mergedContext = { ...this.context, ...(context ?? {}) };
    const record = createLogRecord({
      level,
      message,
      loggerName: this.name,
      context:
        Object.keys(mergedContext).length > 0 ? mergedContext : undefined,
    });

    this.transport.write(record);
  }
}

/** Creates a structured logger. */
export function createStructuredLogger(
  options: LoggerOptions,
): StructuredLogger {
  return new StructuredLogger(options);
}
