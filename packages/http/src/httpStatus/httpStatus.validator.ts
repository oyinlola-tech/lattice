/**
 * Status code validation.
 *
 * Type guard and assertion for valid HTTP status codes (100–599).
 */

export function isValidStatusCode(
  status:
    | unknown,
):
  status is number {
  return (
    typeof status ===
      "number" &&
    Number.isInteger(
      status,
    ) &&
    status >=
      100 &&
    status <=
      599
  );
}

export function assertValidStatusCode(
  status:
    | number,
):
  | void {
  if (
    !isValidStatusCode(
      status,
    )
  ) {
    throw new RangeError(
      `Invalid HTTP status code: ${status}.`,
    );
  }
}
