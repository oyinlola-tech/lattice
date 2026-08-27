import {
  LogLevel,
  LogLevelPriority,
  shouldLog,
  type LogLevel as LogLevelType,
} from "../core/logLevel.level.js";
import type { LogEntry } from "../core/logEntry.entry.js";
import {
  serializeLogError,
} from "../core/logEntry.entry.js";
import type { LoggerContext } from "../core/loggerContext.context.js";
import {
  DEFAULT_LOGGER_OPTIONS,
  type LoggerOptions,
} from "../core/loggerOptions.options.js";
import {
  BaseLogger,
  type LogContext,
} from "../core/logger.js";

/**
 * Logger implementation that writes structured log entries
 * to the Node.js console.
 *
 * This implementation is primarily intended for:
 *
 * Development
 * Testing
 * Local tooling
 *
 * Production applications can replace it with a dedicated
 * structured logging implementation such as a Pino adapter.
 */
export class ConsoleLogger extends BaseLogger {
  private readonly options: Required<
    Pick<
      LoggerOptions,
      | "level"
      | "timestamps"
      | "structured"
      | "includeStackTrace"
    >
  > &
    Omit<LoggerOptions, "level" | "timestamps" | "structured" | "includeStackTrace">;

  public constructor(
    options: LoggerOptions = {},
    context: LoggerContext = {},
  ) {
    super({
      ...options.context,
      ...context,
    });

    this.options = {
      ...DEFAULT_LOGGER_OPTIONS,
      ...options,
    };
  }

  /**
   * Writes a log entry to the console.
   */
  protected write(
    level: LogLevelType,
    message: string,
    context?: LogContext,
    error?: unknown,
  ): void {
    if (!shouldLog(level, this.options.level)) {
      return;
    }

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context,
      ...(error !== undefined
        ? {
            error: serializeLogError(error),
          }
        : {}),
    };

    if (this.options.structured) {
      this.writeStructured(entry);
      return;
    }

    this.writeHumanReadable(entry);
  }

  /**
   * Creates a child logger that inherits the current
   * logger configuration and adds persistent context.
   */
  protected createChild(
    context: LogContext,
  ): ConsoleLogger {
    return new ConsoleLogger(
      this.options,
      {
        ...this.options.context,
        ...context,
      },
    );
  }

  /**
   * Writes the log entry as JSON.
   */
  private writeStructured(entry: LogEntry): void {
    const output = {
      level: entry.level,
      message: entry.message,
      ...(this.options.timestamps
        ? {
            timestamp: entry.timestamp.toISOString(),
          }
        : {}),
      ...(entry.context !== undefined
        ? {
            context: entry.context,
          }
        : {}),
      ...(entry.error !== undefined
        ? {
            error: this.options.includeStackTrace
              ? entry.error
              : this.removeStackTrace(entry.error),
          }
        : {}),
    };

    this.writeToConsole(entry.level, JSON.stringify(output));
  }

  /**
   * Writes a human-readable log entry.
   */
  private writeHumanReadable(entry: LogEntry): void {
    const timestamp = this.options.timestamps
      ? `[${entry.timestamp.toISOString()}] `
      : "";

    const level = entry.level.toUpperCase();

    const context =
      entry.context !== undefined
        ? ` ${this.formatContext(entry.context)}`
        : "";

    const error =
      entry.error !== undefined
        ? ` ${this.formatError(entry.error)}`
        : "";

    this.writeToConsole(
      entry.level,
      `${timestamp}${level}: ${entry.message}${context}${error}`,
    );
  }

  /**
   * Writes to the appropriate console method based on severity.
   */
  private writeToConsole(
    level: LogLevelType,
    message: string,
  ): void {
    switch (level) {
      case LogLevel.TRACE:
        console.trace(message);
        break;

      case LogLevel.DEBUG:
        console.debug(message);
        break;

      case LogLevel.INFO:
        console.info(message);
        break;

      case LogLevel.WARN:
        console.warn(message);
        break;

      case LogLevel.ERROR:
        console.error(message);
        break;

      case LogLevel.FATAL:
        console.error(message);
        break;

      default:
        console.log(message);
    }
  }

  /**
   * Formats structured context for human-readable output.
   */
  private formatContext(
    context: LoggerContext,
  ): string {
    return Object.entries(context)
      .map(([key, value]) => {
        return `${key}=${this.stringifyValue(value)}`;
      })
      .join(" ");
  }

  /**
   * Formats a structured error for human-readable output.
   */
  private formatError(
    error: NonNullable<LogEntry["error"]>,
  ): string {
    const parts: string[] = [];

    if (error.name) {
      parts.push(error.name);
    }

    if (error.message) {
      parts.push(error.message);
    }

    if (
      this.options.includeStackTrace &&
      error.stack
    ) {
      parts.push(`\n${error.stack}`);
    }

    return parts.join(": ");
  }

  /**
   * Removes the stack trace from an error representation.
   */
  private removeStackTrace(
    error: NonNullable<LogEntry["error"]>,
  ): Omit<NonNullable<LogEntry["error"]>, "stack"> {
    const {
      stack: _stack,
      ...safeError
    } = error;

    return safeError;
  }

  /**
   * Safely converts arbitrary values into strings.
   */
  private stringifyValue(
    value: unknown,
  ): string {
    if (typeof value === "string") {
      return value;
    }

    try {
      return JSON.stringify(value);
    } catch {
      return "[unserializable]";
    }
  }
}