/**
 * Internal type guards for HTTP header utilities.
 *
 * @module httpHeaders/internal/typeGuards
 */

/**
 * Checks if a value is an iterable of header tuples.
 *
 * @param value - The value to check.
 * @returns `true` if the value is an iterable of `[string, string | number | boolean]` tuples.
 */
export function isIterableHeaders(
  value:
    | unknown,
): value is Iterable<
  readonly [
    string,
    string | number | boolean,
  ]
> {
  return (
    typeof value ===
      "object" &&
    value !==
      null &&
    Symbol.iterator in
      value
  );
}
