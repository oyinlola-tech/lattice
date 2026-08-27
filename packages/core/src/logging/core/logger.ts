export type LogLevel =
  | "trace"
  | "debug"
  | "info"
  | "warn"
  | "error"
  | "fatal";

/**
 * Structured metadata attached to a log entry.
 */
export type LogContext = Record<string, unknown>;

/**
 * A structured log entry.
 */
export interface LogEntry {
  readonly level: LogLevel;
  readonly message: string;
  readonly context?: LogContext;
  readonly timestamp: Date;
  readonly error?: unknown;
}

/**
 * Logger contract used throughout Lattice.
 *
 * The core does not depend on a particular logging implementation.
 * Adapters can later connect this interface to Pino, Winston,
 * OpenTelemetry, cloud logging systems, or custom implementations.
 */
export interface Logger {
  /**
   * Logs a trace level message.
   */
  trace(message: string, context?: LogContext): void;

  /**
   * Logs a debug level message.
   */
  debug(message: string, context?: LogContext): void;

  /**
   * Logs an informational message.
   */
  info(message: string, context?: LogContext): void;

  /**
   * Logs a warning.
   */
  warn(message: string, context?: LogContext): void;

  /**
   * Logs an error.
   */
  error(
    message: string,
    error?: unknown,
    context?: LogContext,
  ): void;

  /**
   * Logs a fatal error.
   */
  fatal(
    message: string,
    error?: unknown,
    context?: LogContext,
  ): void;

  /**
   * Creates a child logger with persistent context.
   */
  child(context: LogContext): Logger;
}

/**
 * Base logger implementation that provides common behavior
 * such as persistent child context.
 *
 * Concrete output implementations can extend this class.
 */
export abstract class BaseLogger implements Logger {
  private readonly persistentContext: LogContext;

  protected constructor(
    context: LogContext = {},
  ) {
    this.persistentContext = {
      ...context,
    };
  }

  public trace(
    message: string,
    context?: LogContext,
  ): void {
    this.write("trace", message, context);
  }

  public debug(
    message: string,
    context?: LogContext,
  ): void {
    this.write("debug", message, context);
  }

  public info(
    message: string,
    context?: LogContext,
  ): void {
    this.write("info", message, context);
  }

  public warn(
    message: string,
    context?: LogContext,
  ): void {
    this.write("warn", message, context);
  }

  public error(
    message: string,
    error?: unknown,
    context?: LogContext,
  ): void {
    this.write("error", message, context, error);
  }

  public fatal(
    message: string,
    error?: unknown,
    context?: LogContext,
  ): void {
    this.write("fatal", message, context, error);
  }

  public child(context: LogContext): Logger {
    return this.createChild({
      ...this.persistentContext,
      ...context,
    });
  }

  /**
   * Writes a structured log entry.
   *
   * Concrete loggers decide where and how the entry is written.
   */
  protected abstract write(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: unknown,
  ): void;

  /**
   * Creates a child logger.
   */
  protected abstract createChild(
    context: LogContext,
  ): Logger;
}