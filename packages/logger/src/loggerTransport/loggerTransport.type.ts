/**
 * Logger transport types and interfaces.
 */

import type {
  LoggerEntry,
} from "../loggerEntry/loggerEntry.type.js";

/**
 * Configuration passed to transports.
 */
export interface LoggerTransportContext {
  /**
   * Name of the logger that produced the entry.
   */
  readonly loggerName?:
    string;

  /**
   * Environment in which logging is occurring.
   */
  readonly environment?:
    string;

  /**
   * Abort signal for asynchronous transport operations.
   */
  readonly signal?:
    AbortSignal;
}

/**
 * Base transport contract.
 */
export interface LoggerTransport {
  /**
   * Unique transport identifier.
   */
  readonly name:
    string;

  /**
   * Whether the transport is currently enabled.
   */
  readonly enabled:
    boolean;

  /**
   * Writes a log entry.
   */
  write(
    entry:
      LoggerEntry,
    context?:
      LoggerTransportContext,
  ):
    void |
    Promise<void>;

  /**
   * Flushes buffered output.
   */
  flush?():
    void |
    Promise<void>;

  /**
   * Closes the transport.
   */
  close?():
    void |
    Promise<void>;
}

/**
 * Function-based transport.
 */
export type LoggerTransportFunction =
  (
    entry:
      LoggerEntry,
    context:
      LoggerTransportContext,
  ) =>
    void |
    Promise<void>;

/**
 * Transport object or function.
 */
export type LoggerTransportLike =
  | LoggerTransport
  | LoggerTransportFunction;

/**
 * Options for creating a transport.
 */
export interface LoggerTransportOptions {
  /**
   * Transport identifier.
   */
  readonly name?:
    string;

  /**
   * Whether the transport starts enabled.
   */
  readonly enabled?:
    boolean;
}

/**
 * Registered transport.
 */
export interface RegisteredLoggerTransport
  extends LoggerTransport {
  readonly name:
    string;

  readonly enabled:
    boolean;

  readonly transport:
    LoggerTransportLike;
}

/**
 * Options for buffered logging.
 */
export interface LoggerBufferedTransportOptions
  extends LoggerTransportOptions {
  /**
   * Maximum number of entries held in memory.
   */
  readonly maxSize?:
    number;

  /**
   * Automatic flush interval in milliseconds.
   */
  readonly flushInterval?:
    number;
}
