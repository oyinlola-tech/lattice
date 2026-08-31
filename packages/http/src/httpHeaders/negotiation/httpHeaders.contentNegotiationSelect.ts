/**
 * Content negotiation media type selection utilities.
 *
 * @module httpHeaders/contentNegotiationSelect
 */

import type { HTTPHeadersLike } from "../types/httpHeaders.type.js";
import { toHTTPHeaders } from "../conversion/httpHeaders.conversion.js";
import { parseWeightedValues } from "../internal/httpHeaders.internal.weightedValues.js";
import { parseMediaType } from "../internal/httpHeaders.internal.mediaType.js";
import { mediaTypeSpecificity } from "../internal/httpHeaders.internal.specificity.js";

/**
 * Selects the best matching media type from a list of candidates
 * based on the Accept header quality values.
 *
 * @param headers - The headers to inspect.
 * @param candidates - The candidate media types to choose from.
 * @returns The best matching candidate, or `undefined` if none match.
 */
export function preferredMediaType(
  headers:
    | HTTPHeadersLike,
  candidates:
    | readonly string[],
): string
  | undefined {
  const accept =
    toHTTPHeaders(
      headers,
    ).get(
      "accept",
    );

  if (
    !accept
  ) {
    return candidates[0];
  }

  const accepted =
    parseWeightedValues(
      accept,
    );

  let best:
    | {
        candidate: string;
        quality: number;
        specificity: number;
      }
    | undefined;

  for (
    const candidate of candidates
  ) {
    const parsedCandidate =
      parseMediaType(
        candidate,
      );

    if (
      !parsedCandidate
    ) {
      continue;
    }

    for (
      const acceptedItem of accepted
    ) {
      const parsedAccepted =
        parseMediaType(
          acceptedItem.value,
        );

      if (
        !parsedAccepted ||
        acceptedItem.quality <=
          0
      ) {
        continue;
      }

      const specificity =
        mediaTypeSpecificity(
          parsedAccepted,
          parsedCandidate,
        );

      if (
        specificity ===
        0
      ) {
        continue;
      }

      const score =
        acceptedItem.quality;

      if (
        !best ||
        score >
          best.quality ||
        (
          score ===
            best.quality &&
          specificity >
            best.specificity
        )
      ) {
        best = {
          candidate,
          quality: score,
          specificity,
        };
      }
    }
  }

  return best?.candidate;
}
