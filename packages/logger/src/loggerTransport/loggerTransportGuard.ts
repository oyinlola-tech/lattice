/**
 * Logger transport type guards and ID generation.
 */

import type {
  LoggerTransport,
  LoggerTransportFunction,
  LoggerTransportLike,
} from "./loggerTransport.type.js";

/**
 * Creates a transport identifier.
 */
export function createLoggerTransportId():
  string {
  if (
    typeof crypto !==
      "undefined" &&
    typeof crypto.randomUUID ===
      "function"
  ) {
    return `transport:${crypto.randomUUID()}`;
  }

  return [
    "transport",
    Date.now().toString(36),
    Math.random()
      .toString(36)
      .slice(2),
  ].join(":");
}

/**
 * Determines whether a value is a function transport.
 */
export function isLoggerTransportFunction(
  value:
    unknown,
):
  value is LoggerTransportFunction {
  return (
    typeof value ===
    "function"
  );
}

/**
 * Determines whether a value is a transport object.
 */
export function isLoggerTransportObject(
  value:
    unknown,
):
  value is LoggerTransport {
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

      write?:
        unknown;
    };

  return (
    typeof candidate.name ===
      "string" &&
    candidate.name.length >
      0 &&
    typeof candidate.write ===
      "function"
  );
}

/**
 * Checks whether a value is a valid transport.
 */
export function isLoggerTransport(
  value:
    unknown,
):
  value is LoggerTransportLike {
  return (
    isLoggerTransportFunction(
      value,
    ) ||
    isLoggerTransportObject(
      value,
    )
  );
}
