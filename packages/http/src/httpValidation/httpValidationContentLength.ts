/**
 * HTTP Content-Length validation.
 *
 * Validates Content-Length header values (non-negative safe integers).
 */

import type { HTTPValidationResult } from "./httpValidationTypes.type.js";

export function isValidContentLength(
  value:
    | number
    | string
    | undefined
    | null,
): boolean {
  if (
    value ===
      undefined ||
    value ===
      null
  ) {
    return false;
  }

  const length =
    typeof value ===
    "number"
      ? value
      : Number(
          value,
        );

  return (
    Number.isSafeInteger(
      length,
    ) &&
    length >=
      0
  );
}

export function validateContentLength(
  value:
    | number
    | string,
): HTTPValidationResult {
  if (
    !isValidContentLength(
      value,
    )
  ) {
    return {
      valid: false,
      reason:
        "Content-Length must be a non-negative safe integer.",
    };
  }

  return {
    valid: true,
    value:
      String(
        value,
      ),
  };
}
