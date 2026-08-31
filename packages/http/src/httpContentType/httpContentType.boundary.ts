/**
 * HTTP Content-Type boundary parameter helpers.
 */

import type {
  ContentType,
} from "./httpContentType.type.js";
import {
  parseContentType,
} from "./httpContentType.parser.js";
import {
  formatContentType,
} from "./httpContentType.formatter.js";

export function getBoundary(
  value:
    | string
    | ContentType
    | undefined
    | null,
): string | undefined {
  const parsed =
    typeof value === "string"
      ? parseContentType(value)
      : value;

  return parsed?.parameters.boundary;
}

export function hasBoundary(
  value:
    | string
    | ContentType
    | undefined
    | null,
): boolean {
  return (
    getBoundary(value) !== undefined
  );
}

export function withBoundary(
  value:
    | string
    | ContentType,
  boundary: string,
): string {
  const parsed =
    typeof value === "string"
      ? parseContentType(value)
      : value;

  if (!parsed) {
    throw new TypeError(
      "Invalid content type.",
    );
  }

  return formatContentType({
    ...parsed,
    parameters: {
      ...parsed.parameters,
      boundary,
    },
  });
}
