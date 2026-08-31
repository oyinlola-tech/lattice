/**
 * HTTP date header utilities.
 *
 * @module httpHeaders/date
 */

/**
 * Parses an HTTP date string into a Date object.
 *
 * @param value - The raw date string (e.g. from a Last-Modified header).
 * @returns The parsed Date, or `undefined` if invalid.
 */
export function parseHTTPDate(
  value:
    | string
    | undefined,
): Date
  | undefined {
  if (
    !value
  ) {
    return undefined;
  }

  const timestamp =
    Date.parse(
      value,
    );

  if (
    Number.isNaN(
      timestamp,
    )
  ) {
    return undefined;
  }

  return new Date(
    timestamp,
  );
}

/**
 * Formats a Date or timestamp into an HTTP date string.
 *
 * @param value - The date or timestamp to format.
 * @returns The formatted UTC date string.
 * @throws {RangeError} If the date is invalid.
 */
export function formatHTTPDate(
  value:
    | Date
    | number,
): string {
  const date =
    value instanceof
    Date
      ? value
      : new Date(
          value,
        );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    throw new RangeError(
      "Invalid HTTP date.",
    );
  }

  return date.toUTCString();
}

/**
 * Checks if an HTTP date string represents a time that has already passed.
 *
 * @param value - The raw date string.
 * @param now - The current time (defaults to `Date.now()`).
 * @returns `true` if the date is in the past or equal to `now`.
 */
export function isHTTPDateExpired(
  value:
    | string
    | undefined,
  now:
    | Date
    | number = Date.now(),
): boolean {
  const date =
    parseHTTPDate(
      value,
    );

  if (
    !date
  ) {
    return false;
  }

  const current =
    now instanceof
    Date
      ? now.getTime()
      : now;

  return (
    date.getTime() <=
    current
  );
}
