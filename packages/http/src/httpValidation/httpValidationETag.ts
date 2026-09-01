/**
 * HTTP ETag validation.
 *
 * Validates ETag header format (strong and weak) per RFC 7232.
 */

export function isValidETag(value: string | undefined | null): boolean {
  if (!value) {
    return false;
  }

  /*
   * Strong: "abc"
   * Weak:   W/"abc"
   */
  return /^(?:W\/)?"[^"\r\n]*"$/.test(value);
}
