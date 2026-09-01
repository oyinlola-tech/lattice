/**
 * Logger metadata and error formatting helpers.
 */

import {
  serializeLoggerError,
  serializeLoggerValue,
} from "../../loggerEntry/loggerEntryHelpers/loggerEntryHelpers.valueSerialize.js";

/**
 * Formats metadata as key=value pairs.
 */
export function formatMetadata(
  metadata: Record<string, unknown>,
  separator: string,
): string {
  return Object.entries(metadata)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}=${formatValue(value)}`)
    .join(separator);
}

/**
 * Formats an arbitrary metadata value.
 */
export function formatValue(value: unknown): string {
  if (value === null) {
    return "null";
  }

  if (typeof value === "string") {
    if (/\s/.test(value)) {
      return JSON.stringify(value);
    }

    return value;
  }

  if (typeof value === "object") {
    return JSON.stringify(serializeLoggerValue(value));
  }

  return String(value);
}

/**
 * Formats an Error.
 */
export function formatError(error: Error, includeStackTrace: boolean): string {
  if (includeStackTrace && error.stack) {
    return `\n${error.stack}`;
  }

  const serialized = serializeLoggerError(error);

  return `error=${JSON.stringify(serialized)}`;
}
