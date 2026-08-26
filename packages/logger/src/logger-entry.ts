/**
 * Structured log entry for Lattice.
 *
 * A LoggerEntry is the normalized representation of a log
 * message before it is passed to a formatter or transport.
 */

import type {
  LoggerLevel,
  LoggerLevelName,
} from "./logger-level";

/**
 * Values that can safely be attached to a log entry.
 */
export type LogValue =
  | string
  | number
  | boolean
  | bigint
  | null
  | undefined
  | Date
  | Error
  | readonly unknown[]
  | {
      readonly [key: string]:
        unknown;
    };

/**
 * Structured logging metadata.
 */
export type LogMetadata =
  Readonly<
    Record<
      string,
      LogValue
    >
  >;

/**
 * Information about the source of a log entry.
 */
export interface LoggerSource {
  /**
   * Application or service name.
   */
  readonly service?:
    string;

  /**
   * Application component.
   */
  readonly component?:
    string;

  /**
   * Module that produced the log.
   */
  readonly module?:
    string;

  /**
   * Source file.
   */
  readonly file?:
    string;

  /**
   * Source function.
   */
  readonly function?:
    string;

  /**
   * Source line.
   */
  readonly line?:
    number;
}

/**
 * Context information associated with a log entry.
 */
export interface LoggerEntryContext {
  /**
   * Correlation identifier.
   */
  readonly correlationId?:
    string;

  /**
   * Request identifier.
   */
  readonly requestId?:
    string;

  /**
   * Trace identifier.
   */
  readonly traceId?:
    string;

  /**
   * Span identifier.
   */
  readonly spanId?:
    string;

  /**
   * User identifier.
   */
  readonly userId?:
    string;

  /**
   * Tenant identifier.
   */
  readonly tenantId?:
    string;

  /**
   * Additional context.
   */
  readonly metadata?:
    LogMetadata;
}

/**
 * Complete structured log entry.
 */
export interface LoggerEntry {
  /**
   * Unique identifier for this log entry.
   */
  readonly id:
    string;

  /**
   * Numeric severity.
   */
  readonly level:
    LoggerLevel;

  /**
   * Canonical severity name.
   */
  readonly levelName:
    LoggerLevelName;

  /**
   * Human-readable message.
   */
  readonly message:
    string;

  /**
   * Structured metadata.
   */
  readonly metadata:
    LogMetadata;

  /**
   * Execution context.
   */
  readonly context?:
    LoggerEntryContext;

  /**
   * Source information.
   */
  readonly source?:
    LoggerSource;

  /**
   * Error associated with the entry.
   */
  readonly error?:
    Error;

  /**
   * Logger name.
   */
  readonly logger?:
    string;

  /**
   * Timestamp of the log event.
   */
  readonly timestamp:
    Date;

  /**
   * Unix timestamp in milliseconds.
   */
  readonly timestampMs:
    number;

  /**
   * Process identifier where available.
   */
  readonly pid?:
    number;

  /**
   * Hostname where available.
   */
  readonly hostname?:
    string;

  /**
   * Environment name.
   */
  readonly environment?:
    string;
}

/**
 * Input used to create a log entry.
 */
export interface LoggerEntryInput {
  readonly id?:
    string;

  readonly level:
    LoggerLevel;

  readonly levelName?:
    LoggerLevelName;

  readonly message:
    string;

  readonly metadata?:
    LogMetadata;

  readonly context?:
    LoggerEntryContext;

  readonly source?:
    LoggerSource;

  readonly error?:
    Error;

  readonly logger?:
    string;

  readonly timestamp?:
    Date;

  readonly pid?:
    number;

  readonly hostname?:
    string;

  readonly environment?:
    string;
}

/**
 * Creates a unique log entry identifier.
 */
export function createLoggerEntryId():
  string {
  if (
    typeof crypto !==
      "undefined" &&
    typeof crypto.randomUUID ===
      "function"
  ) {
    return `log:${crypto.randomUUID()}`;
  }

  return [
    "log",
    Date.now().toString(36),
    Math.random()
      .toString(36)
      .slice(2),
  ].join(":");
}

/**
 * Creates a normalized LoggerEntry.
 */
export function createLoggerEntry(
  input:
    LoggerEntryInput,
):
  LoggerEntry {
  const timestamp =
    input.timestamp ??
    new Date();

  const timestampMs =
    timestamp.getTime();

  if (
    !Number.isFinite(
      timestampMs,
    )
  ) {
    throw new RangeError(
      "Logger entry timestamp must be a valid date.",
    );
  }

  const levelName =
    input.levelName ??
    loggerLevelNameFallback(
      input.level,
    );

  return Object.freeze({
    id:
      input.id ??
      createLoggerEntryId(),

    level:
      input.level,

    levelName,

    message:
      input.message,

    metadata:
      Object.freeze({
        ...(input.metadata ??
          {}),
      }),

    context:
      input.context
        ? Object.freeze({
            ...input.context,

            metadata:
              input.context
                .metadata
                ? Object.freeze({
                    ...input.context
                      .metadata,
                  })
                : undefined,
          })
        : undefined,

    source:
      input.source
        ? Object.freeze({
            ...input.source,
          })
        : undefined,

    error:
      input.error,

    logger:
      input.logger,

    timestamp,

    timestampMs,

    pid:
      input.pid,

    hostname:
      input.hostname,

    environment:
      input.environment,
  });
}

/**
 * Converts an unknown value into logger metadata.
 */
export function normalizeLogMetadata(
  value:
    unknown,
):
  LogMetadata {
  if (
    value === null ||
    value === undefined
  ) {
    return {};
  }

  if (
    typeof value !==
      "object" ||
    Array.isArray(value)
  ) {
    return {
      value:
        value as LogValue,
    };
  }

  return {
    ...value as Record<
      string,
      LogValue
    >,
  };
}

/**
 * Creates a LoggerEntry from an Error.
 */
export function createErrorLoggerEntry(
  error:
    Error,
  level:
    LoggerLevel,
  message?:
    string,
  metadata?:
    LogMetadata,
):
  LoggerEntry {
  return createLoggerEntry({
    level,

    message:
      message ??
      error.message,

    metadata,

    error,
  });
}

/**
 * Returns a plain serializable representation of an entry.
 *
 * This intentionally does not call JSON.stringify itself.
 */
export function serializeLoggerEntry(
  entry:
    LoggerEntry,
):
  Record<string, unknown> {
  return {
    id:
      entry.id,

    level:
      entry.level,

    levelName:
      entry.levelName,

    message:
      entry.message,

    metadata:
      entry.metadata,

    context:
      entry.context,

    source:
      entry.source,

    error:
      entry.error
        ? serializeLoggerError(
            entry.error,
          )
        : undefined,

    logger:
      entry.logger,

    timestamp:
      entry.timestamp.toISOString(),

    timestampMs:
      entry.timestampMs,

    pid:
      entry.pid,

    hostname:
      entry.hostname,

    environment:
      entry.environment,
  };
}

/**
 * Converts an Error into a serializable structure.
 */
export function serializeLoggerError(
  error:
    Error,
):
  Record<string, unknown> {
  const result:
    Record<string, unknown> = {
    name:
      error.name,

    message:
      error.message,

    stack:
      error.stack,
  };

  if (
    "cause" in error
  ) {
    result.cause =
      serializeLoggerValue(
        (
          error as Error & {
            cause?:
              unknown;
          }
        ).cause,
      );
  }

  return result;
}

/**
 * Converts arbitrary values into safer serializable values.
 */
export function serializeLoggerValue(
  value:
    unknown,
  seen:
    WeakSet<object> =
      new WeakSet<object>(),
):
  unknown {
  if (
    value === null ||
    value === undefined ||
    typeof value ===
      "string" ||
    typeof value ===
      "number" ||
    typeof value ===
      "boolean"
  ) {
    return value;
  }

  if (
    typeof value ===
      "bigint"
  ) {
    return value.toString();
  }

  if (
    value instanceof Date
  ) {
    return value.toISOString();
  }

  if (
    value instanceof Error
  ) {
    return serializeLoggerError(
      value,
    );
  }

  if (
    typeof value ===
      "function"
  ) {
    return `[Function ${
      value.name ||
      "anonymous"
    }]`;
  }

  if (
    typeof value ===
      "symbol"
  ) {
    return value.toString();
  }

  if (
    typeof value !==
      "object"
  ) {
    return String(value);
  }

  if (
    seen.has(
      value,
    )
  ) {
    return "[Circular]";
  }

  seen.add(
    value,
  );

  if (
    Array.isArray(
      value,
    )
  ) {
    return value.map(
      (
        item,
      ) =>
        serializeLoggerValue(
          item,
          seen,
        ),
    );
  }

  const result:
    Record<string, unknown> =
    {};

  for (
    const [
      key,
      item,
    ] of Object.entries(
      value,
    )
  ) {
    result[key] =
      serializeLoggerValue(
        item,
        seen,
      );
  }

  return result;
}

/**
 * Fallback level-name mapping kept local to avoid introducing
 * a circular dependency into logger-entry.ts.
 */
function loggerLevelNameFallback(
  level:
    LoggerLevel,
):
  LoggerLevelName {
  switch (
    level
  ) {
    case 0:
      return "fatal";

    case 1:
      return "error";

    case 2:
      return "warn";

    case 3:
      return "info";

    case 4:
      return "debug";

    case 5:
      return "trace";

    default:
      throw new RangeError(
        `Unknown logger level: ${String(level)}`,
      );
  }
}