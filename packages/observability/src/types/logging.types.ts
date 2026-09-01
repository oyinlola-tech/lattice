/**
 * Logging types for the observability package.
 */

/** Numeric log level hierarchy. Lower = more severe. */
export enum LogLevel {
  TRACE = 0,
  DEBUG = 1,
  INFO = 2,
  WARN = 3,
  ERROR = 4,
  FATAL = 5,
  OFF = 6,
}

/** Human-readable log level name. */
export type LogLevelName =
  "trace" | "debug" | "info" | "warn" | "error" | "fatal" | "off";

/** A structured log record produced by a logger. */
export interface LogRecord {
  readonly level: LogLevel;
  readonly levelName: LogLevelName;
  readonly message: string;
  readonly timestamp: Date;
  readonly loggerName: string;
  readonly context?: Record<string, unknown>;
  readonly error?: {
    readonly name: string;
    readonly message: string;
    readonly stack?: string;
    readonly cause?: unknown;
  };
}

/** Structured logger interface. */
export interface Logger {
  readonly name: string;
  readonly level: LogLevel;

  trace(message: string, context?: Record<string, unknown>): void;
  debug(message: string, context?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, context?: Record<string, unknown>): void;
  fatal(message: string, context?: Record<string, unknown>): void;

  /** Creates a child logger with persistent context. */
  child(name: string, context?: Record<string, unknown>): Logger;

  /** Checks if a level would be logged. */
  isLevelEnabled(level: LogLevel): boolean;

  /** Flushes any buffered log records. */
  flush(): Promise<void>;
}

/** Options for creating a logger. */
export interface LoggerOptions {
  readonly name: string;
  readonly level?: LogLevel;
  readonly context?: Record<string, unknown>;
  readonly transport?: LogTransport;
}

/** A log transport writes records to a destination. */
export interface LogTransport {
  readonly name: string;
  write(record: LogRecord): void | Promise<void>;
}

/** Exports log records to a backend. */
export interface LogExporter {
  export(records: readonly LogRecord[]): Promise<void>;
  shutdown(): Promise<void>;
}
