/**
 * Encoding helpers for Accept-Encoding negotiation.
 *
 * Utilities for normalizing and testing encoding values.
 */

import {
  normalizeToken,
} from "./httpNegotiation.internal.js";

export function normalizeEncoding(
  value: string,
): string {
  return normalizeToken(
    value,
  );
}

export function isIdentityEncoding(
  value: string,
): boolean {
  return (
    normalizeEncoding(
      value,
    ) === "identity"
  );
}

export function isWildcardEncoding(
  value: string,
): boolean {
  return (
    normalizeEncoding(
      value,
    ) === "*"
  );
}
