/**
 * Language negotiation utilities (Accept-Language header).
 *
 * @module httpHeaders/languageNegotiation
 */

import type { HTTPHeadersLike } from "../types/httpHeaders.type.js";
import { toHTTPHeaders } from "../conversion/httpHeaders.conversion.js";
import { parseWeightedValues } from "../internal/httpHeaders.internal.weightedValues.js";
import { languageSpecificity } from "../internal/httpHeaders.internal.specificity.js";

/**
 * Selects the best language from a list of candidates
 * based on the Accept-Language header quality values.
 *
 * @param headers - The headers to inspect.
 * @param candidates - The candidate language tags to choose from.
 * @returns The best matching language, or `undefined` if none match.
 */
export function preferredLanguage(
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
      "accept-language",
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
        language: string;
        quality: number;
        specificity: number;
      }
    | undefined;

  for (
    const candidate of candidates
  ) {
    const normalizedCandidate =
      candidate
        .trim()
        .toLowerCase();

    for (
      const item of accepted
    ) {
      const normalizedAccepted =
        item.value
          .trim()
          .toLowerCase();

      if (
        item.quality <=
          0
      ) {
        continue;
      }

      const specificity =
        languageSpecificity(
          normalizedAccepted,
          normalizedCandidate,
        );

      if (
        specificity ===
        0
      ) {
        continue;
      }

      if (
        !best ||
        item.quality >
          best.quality ||
        (
          item.quality ===
            best.quality &&
          specificity >
            best.specificity
        )
      ) {
        best = {
          language:
            candidate,
          quality:
            item.quality,
          specificity,
        };
      }
    }
  }

  return best?.language;
}
