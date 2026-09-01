/**
 * HTTP status code validation.
 *
 * Validates HTTP status codes (100–599).
 */

import type { HTTPValidationResult } from "./httpValidationTypes.type.js";

export function isValidStatusCode(
  status: number | string | undefined | null,
): boolean {
  if (status === undefined || status === null) {
    return false;
  }

  const code = typeof status === "number" ? status : Number(status);

  return Number.isInteger(code) && code >= 100 && code <= 599;
}

export function validateStatusCode(
  status: number | string,
): HTTPValidationResult {
  if (!isValidStatusCode(status)) {
    return {
      valid: false,
      reason: "HTTP status code must be an integer between 100 and 599.",
    };
  }

  return {
    valid: true,
    value: String(status),
  };
}
