/**
 * Logger entry interfaces.
 */

import type {
  LoggerLevel,
  LoggerLevelName,
} from "../../loggerLevel/loggerLevel.type.js";

import type {
  LogMetadata,
  LoggerEntryContext,
  LoggerSource,
} from "./loggerEntryHelpers.types.js";

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
