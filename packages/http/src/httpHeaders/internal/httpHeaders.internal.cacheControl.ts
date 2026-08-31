/**
 * Internal helpers for Cache-Control directive parsing.
 *
 * @module httpHeaders/internal/cacheControl
 */

/**
 * Checks if a directive exists in the parsed directives record.
 *
 * @param directives - The parsed directives record.
 * @param name - The directive name to check.
 * @returns `true` if the directive is present.
 */
export function hasDirective(
  directives:
    | Record<
        string,
        string | true
      >,
  name:
    | string,
): boolean {
  return Object.prototype.hasOwnProperty.call(
    directives,
    name,
  );
}

/**
 * Retrieves a numeric directive value from the parsed directives record.
 *
 * @param directives - The parsed directives record.
 * @param name - The directive name to retrieve.
 * @returns The parsed number, or `undefined` if not present or not a valid non-negative integer.
 */
export function getDirectiveNumber(
  directives:
    | Record<
        string,
        string | true
      >,
  name:
    | string,
):
  | number
  | undefined {
  const value =
    directives[name];

  if (
    typeof value !==
    "string"
  ) {
    return undefined;
  }

  const parsed =
    Number(
      value,
    );

  return Number.isSafeInteger(
    parsed,
  ) &&
    parsed >=
      0
    ? parsed
    : undefined;
}
