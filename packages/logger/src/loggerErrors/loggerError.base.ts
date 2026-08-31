/**
 * Errors produced by the Lattice logger.
 *
 * LoggerError extends LoggingError from @lattice/errors so all
 * logger failures inherit the shared error infrastructure
 * (code, category, severity, statusCode, metadata, serialization).
 */

import { LoggingError } from "@lattice/errors";

/** Base error for all logger failures. */
export class LoggerError extends LoggingError {
  readonly loggerCode: string;

  constructor(message: string, code = "LOGGER_ERROR", options?: { readonly cause?: unknown }) {
    super(message, { cause: options?.cause });
    this.name = "LoggerError";
    this.loggerCode = code;
  }
}

/** Raised when logger configuration is invalid. */
export class LoggerConfigurationError extends LoggerError {
  constructor(message: string, options?: { readonly cause?: unknown }) {
    super(message, "LOGGER_CONFIGURATION_ERROR", options);
    this.name = "LoggerConfigurationError";
  }
}

/** Raised when a logger has already been disposed. */
export class LoggerDisposedError extends LoggerError {
  constructor(loggerName?: string) {
    super(loggerName ? `Logger "${loggerName}" has been disposed.` : "Logger has been disposed.", "LOGGER_DISPOSED");
    this.name = "LoggerDisposedError";
  }
}

/** Raised when a logger transport fails. */
export class LoggerTransportError extends LoggerError {
  readonly transportName?: string;

  constructor(message: string, options?: { readonly transportName?: string; readonly cause?: unknown }) {
    super(message, "LOGGER_TRANSPORT_ERROR", options);
    this.name = "LoggerTransportError";
    this.transportName = options?.transportName;
  }
}

/** Raised when a logger formatter fails. */
export class LoggerFormatterError extends LoggerError {
  readonly formatterName?: string;

  constructor(message: string, options?: { readonly formatterName?: string; readonly cause?: unknown }) {
    super(message, "LOGGER_FORMATTER_ERROR", options);
    this.name = "LoggerFormatterError";
    this.formatterName = options?.formatterName;
  }
}

/** Raised when a log entry is invalid. */
export class InvalidLoggerEntryError extends LoggerError {
  constructor(message: string, options?: { readonly cause?: unknown }) {
    super(message, "INVALID_LOGGER_ENTRY", options);
    this.name = "InvalidLoggerEntryError";
  }
}

/** Raised when an invalid logger level is supplied. */
export class InvalidLoggerLevelError extends LoggerError {
  readonly level?: unknown;

  constructor(level: unknown) {
    super(`Invalid logger level: ${String(level)}.`, "INVALID_LOGGER_LEVEL");
    this.name = "InvalidLoggerLevelError";
    this.level = level;
  }
}

/** Raised when a logger transport times out. */
export class LoggerTimeoutError extends LoggerTransportError {
  readonly timeout: number;

  constructor(transportName: string, timeout: number) {
    super(`Logger transport "${transportName}" timed out after ${timeout}ms.`, { transportName });
    this.name = "LoggerTimeoutError";
    this.timeout = timeout;
  }
}

/** Raised when an operation is attempted on a closed transport. */
export class LoggerTransportClosedError extends LoggerTransportError {
  constructor(transportName: string) {
    super(`Logger transport "${transportName}" is closed.`, { transportName });
    this.name = "LoggerTransportClosedError";
  }
}

/** Raised when a formatter is missing. */
export class LoggerFormatterNotFoundError extends LoggerError {
  readonly formatterName?: string;

  constructor(formatterName?: string) {
    super(
      formatterName ? `Logger formatter "${formatterName}" was not found.` : "Logger formatter was not found.",
      "LOGGER_FORMATTER_NOT_FOUND",
    );
    this.name = "LoggerFormatterNotFoundError";
    this.formatterName = formatterName;
  }
}

/** Raised when a transport is missing. */
export class LoggerTransportNotFoundError extends LoggerError {
  readonly transportName?: string;

  constructor(transportName?: string) {
    super(
      transportName ? `Logger transport "${transportName}" was not found.` : "Logger transport was not found.",
      "LOGGER_TRANSPORT_NOT_FOUND",
    );
    this.name = "LoggerTransportNotFoundError";
    this.transportName = transportName;
  }
}
