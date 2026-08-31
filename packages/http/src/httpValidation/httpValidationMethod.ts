/**
 * HTTP method validation.
 *
 * Validates that a string is a valid HTTP method per RFC 7230.
 */

import type { HTTPValidationResult } from "./httpValidationTypes.type.js";
import { isHTTPToken } from "./httpValidationToken.js";

export function isValidHTTPMethod(
  method:
    | string
    | undefined
    | null,
): boolean {
  if (
    method ===
      undefined ||
    method ===
      null ||
    method.length ===
      0
  ) {
    return false;
  }

  return isHTTPToken(
    method,
  );
}

export function validateHTTPMethod(
  method: string,
): HTTPValidationResult {
  if (
    !isValidHTTPMethod(
      method,
    )
  ) {
    return {
      valid: false,
      reason:
        "Invalid HTTP method.",
    };
  }

  return {
    valid: true,
    value:
      method.toUpperCase(),
  };
}
