/**
 * Lattice HTTP route result utility helpers.
 */

/* -------------------------------------------------------------------------- */
/* Headers                                                                    */
/* -------------------------------------------------------------------------- */

export function normalizeHeaders(
  headers?:
    | HeadersInit,
):
  | Record<string, string> {
  if (
    !headers
  ) {
    return {};
  }

  const output:
    | Record<string, string> =
    {};

  if (
    headers instanceof
    Headers
  ) {
    headers.forEach(
      (
        value,
        key,
      ) => {
        output[key] =
          value;
      },
    );

    return output;
  }

  if (
    Array.isArray(
      headers,
    )
  ) {
    for (
      const [
        key,
        value,
      ] of headers
    ) {
      output[key] =
        value;
    }

    return output;
  }

  for (
    const [
      key,
      value,
    ] of Object.entries(
      headers,
    )
  ) {
    output[key] =
      String(
        value,
      );
  }

  return output;
}

export function getHeader(
  headers:
    | Record<string, string>,
  name:
    | string,
):
  | string
  | undefined {
  const target =
    name.toLowerCase();

  for (
    const [
      key,
      value,
    ] of Object.entries(
      headers,
    )
  ) {
    if (
      key.toLowerCase() ===
      target
    ) {
      return value;
    }
  }

  return undefined;
}

/* -------------------------------------------------------------------------- */
/* Validation                                                                 */
/* -------------------------------------------------------------------------- */

export function validateStatus(
  status:
    | number,
):
  | void {
  if (
    !Number.isInteger(
      status,
    ) ||
    status <
      100 ||
    status >
      599
  ) {
    throw new RangeError(
      `Invalid HTTP status code: ${status}.`,
    );
  }
}

/* -------------------------------------------------------------------------- */
/* Type Guards                                                                */
/* -------------------------------------------------------------------------- */

export function isReadableStream(
  value:
    | unknown,
):
  value is ReadableStream<Uint8Array> {
  return (
    typeof ReadableStream !==
      "undefined" &&
    value instanceof
      ReadableStream
  );
}
