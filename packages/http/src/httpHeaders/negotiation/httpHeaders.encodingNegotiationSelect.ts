/**
 * Encoding negotiation selection utilities.
 *
 * @module httpHeaders/encodingNegotiationSelect
 */

import type { HTTPHeadersLike } from "../types/httpHeaders.type.js";
import { toHTTPHeaders } from "../conversion/httpHeaders.conversion.js";
import { parseWeightedValues } from "../internal/httpHeaders.internal.weightedValues.js";

/**
 * Selects the best encoding from a list of candidates
 * based on the Accept-Encoding header quality values.
 *
 * @param headers - The headers to inspect.
 * @param candidates - The candidate encodings to choose from.
 * @returns The best matching encoding, or `undefined` if none match.
 */
export function preferredEncoding(
  headers:
    | HTTPHeadersLike,
  candidates:
    | readonly string[],
): string
  | undefined {
  const value =
    toHTTPHeaders(
      headers,
    ).get(
      "accept-encoding",
    );

  if (
    !value
  ) {
    return candidates[0];
  }

  const accepted =
    parseWeightedValues(
      value,
    );

  let best:
    | {
        encoding: string;
        quality: number;
      }
    | undefined;

  for (
    const candidate of candidates
  ) {
    const normalized =
      candidate
        .trim()
        .toLowerCase();

    const match =
      accepted.find(
        (
          item,
        ) =>
          item.value
            .toLowerCase() ===
            normalized ||
          item.value ===
            "*",
      );

    if (
      !match ||
      match.quality <=
        0
    ) {
      continue;
    }

    if (
      !best ||
      match.quality >
        best.quality
    ) {
      best = {
        encoding:
          candidate,
        quality:
          match.quality,
      };
    }
  }

  return best?.encoding;
}
