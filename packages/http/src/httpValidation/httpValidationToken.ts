/**
 * HTTP token validation.
 *
 * Validates RFC 7230 token format used in method names,
 * header names, media types, and cache directives.
 */

import type { HTTPValidationResult } from "./httpValidationTypes.type.js";

export function isHTTPToken(
  value:
    | string
    | undefined
    | null,
): value is string {
  if (
    value ===
      undefined ||
    value ===
      null ||
    value.length ===
      0
  ) {
    return false;
  }

  return /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/.test(
    value,
  );
}

export function validateHTTPToken(
  value: string,
): HTTPValidationResult {
  if (
    isHTTPToken(
      value,
    )
  ) {
    return {
      valid: true,
      value,
    };
  }

  return {
    valid: false,
    reason:
      "Value contains characters that are not valid in an HTTP token.",
  };
}
