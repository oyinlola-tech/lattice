/**
 * Encoding negotiation checking utilities.
 *
 * @module httpHeaders/encodingNegotiation
 */

import type { HTTPHeadersLike } from "../types/httpHeaders.type.js";
import { toHTTPHeaders } from "../conversion/httpHeaders.conversion.js";
import { parseWeightedValues } from "../internal/httpHeaders.internal.weightedValues.js";

/**
 * Checks if the Accept-Encoding header permits a given encoding.
 *
 * @param headers - The headers to inspect.
 * @param encoding - The encoding to check (e.g. `"gzip"`).
 * @returns `true` if the encoding is accepted (or if no Accept-Encoding header is present).
 */
export function acceptsEncoding(
  headers:
    | HTTPHeadersLike,
  encoding:
    | string,
): boolean {
  const value =
    toHTTPHeaders(
      headers,
    ).get(
      "accept-encoding",
    );

  if (
    !value
  ) {
    return true;
  }

  const requested =
    encoding
      .trim()
      .toLowerCase();

  const entries =
    parseWeightedValues(
      value,
    );

  for (
    const entry of entries
  ) {
    const candidate =
      entry.value
        .toLowerCase();

    if (
      entry.quality <=
        0
    ) {
      continue;
    }

    if (
      candidate ===
        requested ||
      candidate ===
        "*"
    ) {
      return true;
    }
  }

  return false;
}
