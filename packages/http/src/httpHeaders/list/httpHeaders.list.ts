/**
 * Header list reading utilities.
 *
 * @module httpHeaders/list
 */

import type { HTTPHeadersLike } from "../types/httpHeaders.type.js";
import { toHTTPHeaders } from "../conversion/httpHeaders.conversion.js";

/**
 * Splits a comma-separated header value string into trimmed, non-empty parts.
 *
 * @param value - The raw header value string.
 * @returns An array of trimmed, non-empty values.
 */
export function splitHeaderValues(
  value:
    | string
    | undefined,
): string[] {
  if (
    value ===
      undefined ||
    value.trim() ===
      ""
  ) {
    return [];
  }

  return value
    .split(",")
    .map(
      (
        item,
      ) =>
        item.trim(),
    )
    .filter(
      Boolean,
    );
}

/**
 * Retrieves all comma-separated values for a header as an array.
 *
 * @param headers - The headers to inspect.
 * @param name - The header name.
 * @returns An array of trimmed values.
 */
export function getHeaderValues(
  headers:
    | HTTPHeadersLike,
  name:
    | string,
): string[] {
  return splitHeaderValues(
    toHTTPHeaders(
      headers,
    ).get(
      name,
    ),
  );
}
