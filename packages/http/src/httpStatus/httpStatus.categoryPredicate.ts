/**
 * Category-level status predicates.
 *
 * Tests whether a numeric status code belongs to a given HTTP class (1xx–5xx).
 */

export function isInformational(
  status:
    | number,
):
  | boolean {
  return (
    status >=
      100 &&
    status <
      200
  );
}

export function isSuccess(
  status:
    | number,
):
  | boolean {
  return (
    status >=
      200 &&
    status <
      300
  );
}

export function isRedirection(
  status:
    | number,
):
  | boolean {
  return (
    status >=
      300 &&
    status <
      400
  );
}

export function isClientError(
  status:
    | number,
):
  | boolean {
  return (
    status >=
      400 &&
    status <
      500
  );
}

export function isServerError(
  status:
    | number,
):
  | boolean {
  return (
    status >=
      500 &&
    status <
      600
  );
}

export function isError(
  status:
    | number,
):
  | boolean {
  return (
    isClientError(
      status,
    ) ||
    isServerError(
      status,
    )
  );
}
