import type { LogLevel } from "./log-level.js";
import type { LoggerContext } from "./logger-context.js";

/**
 * Represents a single structured log entry.
 *
 * A LogEntry is the framework's internal representation of a log event.
 * Concrete logger implementations decide how this entry is serialized
 * or transported.
 */
export interface LogEntry {
  /**
   * Severity of the log event.
   */
  readonly level: LogLevel;

  /**
   * Human-readable log message.
   */
  readonly message: string;

  /**
   * Time at which the log event was created.
   */
  readonly timestamp: Date;

  /**
   * Structured framework context.
   */
  readonly context?: LoggerContext;

  /**
   * Error associated with the log event.
   */
  readonly error?: LogError;
}

/**
 * Serializable representation of an error attached to a log entry.
 */
export interface LogError {
  /**
   * Error class or type name.
   */
  readonly name?: string;

  /**
   * Human-readable error message.
   */
  readonly message?: string;

  /**
   * Stack trace when available.
   */
  readonly stack?: string;

  /**
   * Machine-readable error code.
   */
  readonly code?: string;

  /**
   * Additional structured error information.
   */
  readonly details?: unknown;

  /**
   * Original underlying error when represented structurally.
   */
  readonly cause?: unknown;
}

/**
 * Creates a structured LogError from an unknown thrown value.
 *
 * This allows the logging system to safely handle:
 *
 * Error instances
 * FrameworkError instances
 * Strings
 * Objects
 * Unknown thrown values
 */
export function serializeLogError(
  error: unknown,
): LogError {
  if (error instanceof Error) {
    const candidate = error as Error & {
      code?: string;
      details?: unknown;
      cause?: unknown;
    };

    return {
      name: candidate.name,
      message: candidate.message,
      stack: candidate.stack,
      code: candidate.code,
      details: candidate.details,
      cause: candidate.cause,
    };
  }

  if (typeof error === "string") {
    return {
      message: error,
    };
  }

  if (error !== null && typeof error === "object") {
    return {
      details: error,
    };
  }

  return {
    message: String(error),
  };
}