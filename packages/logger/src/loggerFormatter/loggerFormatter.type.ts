/**
 * Logger formatter types and interfaces.
 */

import type {
  LoggerEntry,
} from "../loggerEntry/loggerEntry.type.js";

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
  readonly loggerName?: string;
  readonly environment?: string;
  readonly colors?: boolean;
  readonly includeStackTrace?: boolean;
}

/**
 * Logger formatter contract.
 */
export interface LoggerFormatter<
  TOutput extends LoggerFormattedOutput = LoggerFormattedOutput,
> {
  readonly name: string;
  format(entry: LoggerEntry, context?: LoggerFormatterContext): TOutput;
}

/**
 * Function-based formatter.
 */
export type LoggerFormatterFunction<
  TOutput extends LoggerFormattedOutput = LoggerFormattedOutput,
> = (entry: LoggerEntry, context: LoggerFormatterContext) => TOutput;

/**
 * Formatter implementation.
 */
export type LoggerFormatterLike<
  TOutput extends LoggerFormattedOutput = LoggerFormattedOutput,
> = LoggerFormatter<TOutput> | LoggerFormatterFunction<TOutput> | string;

/**
 * Formatter options.
 */
export interface LoggerFormatterOptions {
  readonly name?: string;
}

/**
 * JSON formatter options.
 */
export interface JsonLoggerFormatterOptions extends LoggerFormatterOptions {
  readonly pretty?: boolean;
  readonly indent?: number;
  readonly includeUndefined?: boolean;
}

/**
 * Text formatter options.
 */
export interface TextLoggerFormatterOptions extends LoggerFormatterOptions {
  readonly includeTimestamp?: boolean;
  readonly includeLogger?: boolean;
  readonly includeMetadata?: boolean;
  readonly includeContext?: boolean;
  readonly includeSource?: boolean;
  readonly includeStackTrace?: boolean;
  readonly metadataSeparator?: string;
}
