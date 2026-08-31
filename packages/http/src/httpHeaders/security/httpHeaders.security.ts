/**
 * Header security utilities for preventing header injection.
 *
 * @module httpHeaders/security
 */

/**
 * Checks if a string contains CR or LF characters.
 *
 * @param value - The string to check.
 * @returns `true` if the string contains `\r` or `\n`.
 */
export function containsCRLF(
  value:
    | string,
): boolean {
  return /[\r\n]/.test(
    value,
  );
}

/**
 * Throws if a header value contains CR or LF characters.
 *
 * @param value - The header value to validate.
 * @throws {TypeError} If the value contains CR or LF characters.
 */
export function assertSafeHeaderValue(
  value:
    | string,
): void {
  if (
    containsCRLF(
      value,
    )
  ) {
    throw new TypeError(
      "HTTP header values must not contain CR or LF characters.",
    );
  }
}

/**
 * Removes CR and LF characters from a header value.
 *
 * @param value - The header value to sanitize.
 * @returns The sanitized value with CR and LF characters removed.
 */
export function sanitizeHeaderValue(
  value:
    | string,
): string {
  return value.replace(
    /[\r\n]/g,
    "",
  );
}
