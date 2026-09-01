/**
 * Internal helpers for parsing weighted header values (e.g. Accept, Accept-Encoding).
 *
 * @module httpHeaders/internal/weightedValues
 */

import { splitHeaderValues } from "../list/httpHeaders.list.js";

/**
 * A value with an associated quality weight.
 */
export interface WeightedValue {
  readonly value: string;

  readonly quality: number;
}

/**
 * Parses a comma-separated header value string into weighted values,
 * sorted by quality descending.
 *
 * @param value - The raw header value string.
 * @returns An array of weighted values sorted by quality (highest first).
 */
export function parseWeightedValues(value: string): WeightedValue[] {
  return splitHeaderValues(value)
    .map((item) => {
      const parts = item.split(";");

      const name = (parts.shift() ?? "").trim();

      let quality = 1;

      for (const parameter of parts) {
        const [key, rawValue] = parameter.split("=").map((part) => part.trim());

        if (key?.toLowerCase() === "q") {
          const parsed = Number(rawValue);

          if (Number.isFinite(parsed)) {
            quality = Math.min(1, Math.max(0, parsed));
          }
        }
      }

      return {
        value: name,
        quality,
      };
    })
    .filter((item) => item.value.length > 0)
    .sort((left, right) => right.quality - left.quality);
}
