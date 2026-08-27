/**
 * LatticeLogger normalization and assertion helpers.
 */

import {
  isLoggerFormatter,
} from "../../loggerFormatter/loggerFormatterGuard.js";

import {
  createTextLoggerFormatter,
} from "../../loggerFormatter/loggerFormatterFormatters/loggerFormatterFormatters.text.js";

import {
  createConsoleLoggerTransport,
} from "../../loggerTransport/loggerTransportConsole/loggerTransportConsole.core.js";

import {
  LoggerConfigurationError,
  LoggerDisposedError,
} from "../../loggerErrors/loggerError.base.js";

import type {
  LoggerConfiguration,
} from "../../loggerOptions/loggerOptions.type.js";

/**
 * Normalizes logger configuration with defaults.
 */
export function normalizeConfiguration(
  configuration: LoggerConfiguration,
): LoggerConfiguration {
  let formatter = configuration.formatter;

  if (typeof formatter === "string") {
    formatter = createTextLoggerFormatter();
  } else if (!isLoggerFormatter(formatter)) {
    formatter = createTextLoggerFormatter();
  }

  let transports = configuration.transports;

  if (transports.length === 0) {
    transports = [createConsoleLoggerTransport()];
  }

  return Object.freeze({
    ...configuration,
    formatter,
    transports,
  });
}

/**
 * Asserts that the logger is not disposed.
 */
export function assertActive(
  disposed: boolean,
  name: string,
): void {
  if (disposed) {
    throw new LoggerDisposedError(name);
  }
}

/**
 * Asserts that the logger configuration is mutable.
 */
export function assertMutable(
  mutable: boolean,
): void {
  if (!mutable) {
    throw new LoggerConfigurationError(
      "Logger configuration is immutable.",
    );
  }
}

/**
 * Handles infrastructure errors (transport/formatter errors).
 */
export function handleInfrastructureError(
  throwTransportErrors: boolean,
  error: Error,
): void {
  if (throwTransportErrors) {
    throw error;
  }
}
