/**
 * HTTP port validation.
 *
 * Validates TCP port numbers (0–65535).
 */

import type { HTTPValidationResult } from "./httpValidationTypes.type.js";

export function isValidPort(
  port:
    | number
    | string
    | undefined
    | null,
): boolean {
  if (
    port ===
      undefined ||
    port ===
      null
  ) {
    return false;
  }

  const numeric =
    typeof port ===
    "number"
      ? port
      : Number(
          port,
        );

  return (
    Number.isInteger(
      numeric,
    ) &&
    numeric >=
      0 &&
    numeric <=
      65535
  );
}

export function validatePort(
  port:
    | number
    | string,
): HTTPValidationResult {
  if (
    !isValidPort(
      port,
    )
  ) {
    return {
      valid: false,
      reason:
        "Port must be an integer between 0 and 65535.",
    };
  }

  return {
    valid: true,
    value:
      String(
        port,
      ),
  };
}
