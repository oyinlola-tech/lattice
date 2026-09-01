/**
 * HTTP Date header validation.
 *
 * Validates HTTP-date format per RFC 7231 Section 7.1.1.1.
 */

export function isValidHTTPDate(value: string | undefined | null): boolean {
  if (!value) {
    return false;
  }

  const timestamp = Date.parse(value);

  return !Number.isNaN(timestamp);
}
