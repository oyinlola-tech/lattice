/**
 * Forwarded / proxy header utilities.
 *
 * @module httpHeaders/forwarded
 */

import type { HTTPHeadersLike } from "../types/httpHeaders.type.js";
import { getHeaderValues, splitHeaderValues } from "../list/httpHeaders.list.js";

/**
 * Retrieves all forwarded values for a header, splitting nested comma-separated values.
 *
 * @param headers - The headers to inspect.
 * @param name - The header name (e.g. `"Forwarded"` or `"X-Forwarded-For"`).
 * @returns An array of all forwarded values.
 */
export function getForwardedValues(
  headers:
    | HTTPHeadersLike,
  name:
    | string,
): string[] {
  return getHeaderValues(
    headers,
    name,
  ).flatMap(
    (
      value,
    ) =>
      splitHeaderValues(
        value,
      ),
  );
}

/**
 * Retrieves the first forwarded value for a header.
 *
 * @param headers - The headers to inspect.
 * @param name - The header name.
 * @returns The first forwarded value, or `undefined` if none exist.
 */
export function getFirstForwardedValue(
  headers:
    | HTTPHeadersLike,
  name:
    | string,
): string
  | undefined {
  return getForwardedValues(
    headers,
    name,
  )[0];
}
