/**
 * Logger formatters for Lattice.
 *
 * Formatters transform normalized LoggerEntry objects into output
 * representations. They do not perform transport or filtering.
 */

import type {
  LoggerEntry,
} from "./logger-entry";

import {
  serializeLoggerEntry,
  serializeLoggerError,
  serializeLoggerValue,
} from "./logger-entry";

/**
 * Supported formatter output.
 */
export type LoggerFormattedOutput =
  | string
  | Record<string, unknown>;

/**
 * Formatter context.
 */
export interface LoggerFormatterContext {
  /**
   * Logger name.
   */
  readonly loggerName?:
    string;

  /**
   * Environment.
   */
  readonly environment?:
    string;

  /**
   * Whether colors are enabled.
   */
  readonly colors?:
    boolean;

  /**
   * Whether stack traces should be included.
   */
  readonly includeStackTrace?:
    boolean;
}

/**
 * Logger formatter contract.
 */
export interface LoggerFormatter<
  TOutput extends LoggerFormattedOutput =
    LoggerFormattedOutput,
> {
  /**
   * Unique formatter identifier.
   */
  readonly name:
    string;

  /**
   * Formats a log entry.
   */
  format(
    entry:
      LoggerEntry,
    context?:
      LoggerFormatterContext,
  ):
    TOutput;
}

/**
 * Function-based formatter.
 */
export type LoggerFormatterFunction<
  TOutput extends LoggerFormattedOutput =
    LoggerFormattedOutput,
> = (
  entry:
    LoggerEntry,
  context:
    LoggerFormatterContext,
) =>
  TOutput;

/**
 * Formatter implementation.
 */
export type LoggerFormatterLike<
  TOutput extends LoggerFormattedOutput =
    LoggerFormattedOutput,
> =
  | LoggerFormatter<TOutput>
  | LoggerFormatterFunction<TOutput>
  | string;

/**
 * Formatter options.
 */
export interface LoggerFormatterOptions {
  readonly name?:
    string;
}

/**
 * Creates a formatter identifier.
 */
export function createLoggerFormatterId():
  string {
  if (
    typeof crypto !==
      "undefined" &&
    typeof crypto.randomUUID ===
      "function"
  ) {
    return `formatter:${crypto.randomUUID()}`;
  }

  return [
    "formatter",
    Date.now().toString(36),
    Math.random()
      .toString(36)
      .slice(2),
  ].join(":");
}

/**
 * Determines whether a formatter is function-based.
 */
export function isLoggerFormatterFunction(
  value:
    unknown,
):
  value is LoggerFormatterFunction {
  return (
    typeof value ===
    "function"
  );
}

/**
 * Determines whether a formatter is object-based.
 */
export function isLoggerFormatterObject(
  value:
    unknown,
):
  value is LoggerFormatter {
  if (
    typeof value !==
      "object" ||
    value === null
  ) {
    return false;
  }

  const candidate =
    value as {
      name?:
        unknown;

      format?:
        unknown;
    };

  return (
    typeof candidate.name ===
      "string" &&
    candidate.name.length >
      0 &&
    typeof candidate.format ===
      "function"
  );
}

/**
 * Determines whether a value is a valid formatter.
 */
export function isLoggerFormatter(
  value:
    unknown,
):
  value is LoggerFormatterLike {
  return (
    typeof value ===
      "string" ||
    isLoggerFormatterFunction(
      value,
    ) ||
    isLoggerFormatterObject(
      value,
    )
  );
}

/**
 * Creates a function-backed formatter.
 */
export function createLoggerFormatter<
  TOutput extends LoggerFormattedOutput =
    LoggerFormattedOutput,
>(
  formatter:
    LoggerFormatterLike<TOutput>,
  options:
    LoggerFormatterOptions = {},
):
  LoggerFormatter<TOutput> {
  if (
    !isLoggerFormatter(
      formatter,
    )
  ) {
    throw new TypeError(
      "Invalid logger formatter.",
    );
  }

  const name =
    options.name ??
    (
      isLoggerFormatterObject(
        formatter,
      )
        ? formatter.name
        : createLoggerFormatterId()
    );

  return Object.freeze({
    name,

    format(
      entry:
        LoggerEntry,
      context:
        LoggerFormatterContext =
          {},
    ):
      TOutput {
      if (
        isLoggerFormatterFunction(
          formatter,
        )
      ) {
        return formatter(
          entry,
          context,
        );
      }

      if (
        typeof formatter ===
          "string"
      ) {
        throw new Error(
          `Cannot format with string identifier "${formatter}" directly. Resolve the formatter first.`,
        );
      }

      return formatter.format(
        entry,
        context,
      );
    },
  });
}

/**
 * Formats an entry through a formatter.
 */
export function formatLoggerEntry<
  TOutput extends LoggerFormattedOutput =
    LoggerFormattedOutput,
>(
  formatter:
    LoggerFormatterLike<TOutput>,
  entry:
    LoggerEntry,
  context:
    LoggerFormatterContext =
      {},
):
  TOutput {
  if (
    isLoggerFormatterFunction(
      formatter,
    )
  ) {
    return formatter(
      entry,
      context,
    );
  }

  if (
    typeof formatter ===
      "string"
  ) {
    throw new Error(
      `Cannot format with string identifier "${formatter}" directly. Resolve the formatter first.`,
    );
  }

  return formatter.format(
    entry,
    context,
  );
}

/**
 * JSON formatter options.
 */
export interface JsonLoggerFormatterOptions
  extends LoggerFormatterOptions {
  /**
   * Pretty-print JSON.
   */
  readonly pretty?:
    boolean;

  /**
   * Number of spaces for pretty printing.
   */
  readonly indent?:
    number;

  /**
   * Include undefined properties.
   */
  readonly includeUndefined?:
    boolean;
}

/**
 * Creates a JSON formatter.
 */
export function createJsonLoggerFormatter(
  options:
    JsonLoggerFormatterOptions =
      {},
):
  LoggerFormatter<string> {
  const pretty =
    options.pretty ??
    false;

  const indent =
    options.indent ??
    2;

  return createLoggerFormatter(
    (
      entry,
    ) => {
      const serialized =
        serializeLoggerEntry(
          entry,
        );

      const normalized =
        options.includeUndefined
          ? serialized
          : removeUndefinedValues(
              serialized,
            );

      return JSON.stringify(
        normalized,
        null,
        pretty
          ? indent
          : undefined,
      );
    },
    {
      name:
        options.name ??
        "json",
    },
  );
}

/**
 * Text formatter options.
 */
export interface TextLoggerFormatterOptions
  extends LoggerFormatterOptions {
  /**
   * Include timestamps.
   */
  readonly includeTimestamp?:
    boolean;

  /**
   * Include logger name.
   */
  readonly includeLogger?:
    boolean;

  /**
   * Include metadata.
   */
  readonly includeMetadata?:
    boolean;

  /**
   * Include context.
   */
  readonly includeContext?:
    boolean;

  /**
   * Include source information.
   */
  readonly includeSource?:
    boolean;

  /**
   * Include error stack traces.
   */
  readonly includeStackTrace?:
    boolean;

  /**
   * Separator between metadata fields.
   */
  readonly metadataSeparator?:
    string;
}

/**
 * Creates a human-readable text formatter.
 */
export function createTextLoggerFormatter(
  options:
    TextLoggerFormatterOptions =
      {},
):
  LoggerFormatter<string> {
  const includeTimestamp =
    options.includeTimestamp ??
    true;

  const includeLogger =
    options.includeLogger ??
    true;

  const includeMetadata =
    options.includeMetadata ??
    true;

  const includeContext =
    options.includeContext ??
    true;

  const includeSource =
    options.includeSource ??
    false;

  const includeStackTrace =
    options.includeStackTrace ??
    true;

  const metadataSeparator =
    options.metadataSeparator ??
    " ";

  return createLoggerFormatter(
    (
      entry,
    ) => {
      const parts:
        string[] =
        [];

      if (
        includeTimestamp
      ) {
        parts.push(
          entry.timestamp.toISOString(),
        );
      }

      parts.push(
        `[${entry.levelName.toUpperCase()}]`,
      );

      if (
        includeLogger &&
        entry.logger
      ) {
        parts.push(
          `[${entry.logger}]`,
        );
      }

      parts.push(
        entry.message,
      );

      if (
        includeContext &&
        entry.context
      ) {
        const context =
          formatContext(
            entry,
          );

        if (
          context
        ) {
          parts.push(
            context,
          );
        }
      }

      if (
        includeSource &&
        entry.source
      ) {
        const source =
          formatSource(
            entry,
          );

        if (
          source
        ) {
          parts.push(
            source,
          );
        }
      }

      if (
        includeMetadata &&
        Object.keys(
          entry.metadata,
        ).length >
          0
      ) {
        parts.push(
          formatMetadata(
            entry.metadata,
            metadataSeparator,
          ),
        );
      }

      if (
        entry.error
      ) {
        parts.push(
          formatError(
            entry.error,
            includeStackTrace,
          ),
        );
      }

      return parts.join(
        " ",
      );
    },
    {
      name:
        options.name ??
        "text",
    },
  );
}

/**
 * Creates a compact formatter intended for console output.
 */
export function createCompactLoggerFormatter(
  options:
    LoggerFormatterOptions = {},
):
  LoggerFormatter<string> {
  return createLoggerFormatter(
    (
      entry,
    ) => {
      const level =
        entry.levelName
          .toUpperCase();

      const logger =
        entry.logger
          ? ` ${entry.logger}:`
          : "";

      return `${level}${logger} ${entry.message}`;
    },
    {
      name:
        options.name ??
        "compact",
    },
  );
}

/**
 * Creates a development formatter with detailed metadata.
 */
export function createDevelopmentLoggerFormatter(
  options:
    TextLoggerFormatterOptions =
      {},
):
  LoggerFormatter<string> {
  return createTextLoggerFormatter({
    ...options,

    name:
      options.name ??
      "development",

    includeTimestamp:
      options.includeTimestamp ??
      true,

    includeLogger:
      options.includeLogger ??
      true,

    includeMetadata:
      options.includeMetadata ??
      true,

    includeContext:
      options.includeContext ??
      true,

    includeSource:
      options.includeSource ??
      true,

    includeStackTrace:
      options.includeStackTrace ??
      true,
  });
}

/**
 * Creates a production formatter.
 *
 * Production logs use JSON by default because structured logs are
 * easier to ingest into centralized logging systems.
 */
export function createProductionLoggerFormatter(
  options:
    JsonLoggerFormatterOptions =
      {},
):
  LoggerFormatter<string> {
  return createJsonLoggerFormatter({
    ...options,

    name:
      options.name ??
      "production",
  });
}

/**
 * Creates a formatter that returns structured objects.
 */
export function createStructuredLoggerFormatter(
  options:
    LoggerFormatterOptions =
      {},
):
  LoggerFormatter<
    Record<string, unknown>
  > {
  return createLoggerFormatter(
    (
      entry,
    ) =>
      serializeLoggerEntry(
        entry,
      ),
    {
      name:
        options.name ??
        "structured",
    },
  );
}

/**
 * Formats logger context.
 */
function formatContext(
  entry:
    LoggerEntry,
):
  string {
  if (
    !entry.context
  ) {
    return "";
  }

  const values:
    string[] =
    [];

  for (
    const [
      key,
      value,
    ] of Object.entries(
      entry.context,
    )
  ) {
    if (
      value ===
        undefined ||
      value ===
        null
    ) {
      continue;
    }

    values.push(
      `${key}=${String(value)}`,
    );
  }

  return values.length >
    0
    ? `[${values.join(" ")}]`
    : "";
}

/**
 * Formats logger source information.
 */
function formatSource(
  entry:
    LoggerEntry,
):
  string {
  const source =
    entry.source;

  if (
    !source
  ) {
    return "";
  }

  const location:
    string[] =
    [];

  if (
    source.file
  ) {
    location.push(
      source.file,
    );
  }

  if (
    source.line !==
      undefined
  ) {
    location.push(
      String(
        source.line,
      ),
    );
  }

  const functionName =
    source.function
      ? ` ${source.function}`
      : "";

  return location.length >
    0
    ? `[${location.join(":")}${functionName}]`
    : "";
}

/**
 * Formats metadata as key=value pairs.
 */
function formatMetadata(
  metadata:
    Record<string, unknown>,
  separator:
    string,
):
  string {
  return Object.entries(
    metadata,
  )
    .filter(
      (
        [, value],
      ) =>
        value !==
        undefined,
    )
    .map(
      (
        [key, value],
      ) =>
        `${key}=${formatValue(
          value,
        )}`,
    )
    .join(
      separator,
    );
}

/**
 * Formats an arbitrary metadata value.
 */
function formatValue(
  value:
    unknown,
):
  string {
  if (
    value ===
      null
  ) {
    return "null";
  }

  if (
    typeof value ===
      "string"
  ) {
    if (
      /\s/.test(
        value,
      )
    ) {
      return JSON.stringify(
        value,
      );
    }

    return value;
  }

  if (
    typeof value ===
      "object"
  ) {
    return JSON.stringify(
      serializeLoggerValue(
        value,
      ),
    );
  }

  return String(
    value,
  );
}

/**
 * Formats an Error.
 */
function formatError(
  error:
    Error,
  includeStackTrace:
    boolean,
):
  string {
  if (
    includeStackTrace &&
    error.stack
  ) {
    return `\n${error.stack}`;
  }

  const serialized =
    serializeLoggerError(
      error,
    );

  return `error=${JSON.stringify(
    serialized,
  )}`;
}

/**
 * Removes undefined values recursively.
 */
function removeUndefinedValues(
  value:
    unknown,
):
  unknown {
  if (
    Array.isArray(
      value,
    )
  ) {
    return value.map(
      (
        item,
      ) =>
        removeUndefinedValues(
          item,
        ),
    );
  }

  if (
    value &&
    typeof value ===
      "object" &&
    !(
      value instanceof Date
    )
  ) {
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
      if (
        item ===
        undefined
      ) {
        continue;
      }

      result[key] =
        removeUndefinedValues(
          item,
        );
    }

    return result;
  }

  return value;
}