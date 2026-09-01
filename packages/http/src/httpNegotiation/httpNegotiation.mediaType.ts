/**
 * Media type parsing and specificity helpers.
 *
 * Utilities for normalizing, splitting, and scoring media types
 * used in Accept header negotiation.
 */

import { normalizeToken } from "./httpNegotiation.internal.js";

export function normalizeMediaType(value: string): string {
  return value.trim().split(";", 1)[0].trim().toLowerCase();
}

export function splitMediaType(value: string): [string, string] | undefined {
  const normalized = normalizeMediaType(value);

  const separator = normalized.indexOf("/");

  if (separator <= 0 || separator === normalized.length - 1) {
    return undefined;
  }

  return [normalized.slice(0, separator), normalized.slice(separator + 1)];
}

export function mediaTypeSpecificity(value: string): number {
  const parts = splitMediaType(value);

  if (!parts) {
    return 0;
  }

  const [type, subtype] = parts;

  if (type === "*" && subtype === "*") {
    return 0;
  }

  if (subtype === "*") {
    return 1;
  }

  if (subtype.startsWith("*+")) {
    return 2;
  }

  return 3;
}
