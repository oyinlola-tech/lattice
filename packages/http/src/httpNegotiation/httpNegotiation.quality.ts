/**
 * Quality value parsing and formatting for HTTP negotiation.
 *
 * Handles the q-value parameter used in Accept, Accept-Encoding,
 * Accept-Language, and Accept-Charset headers.
 */

import {
  MIN_NEGOTIATION_QUALITY,
  MAX_NEGOTIATION_QUALITY,
} from "./httpNegotiation.types.js";

import {
  clamp,
} from "./httpNegotiation.internal.js";

export function parseQuality(
  value: string,
): number {
  const normalized =
    value.trim();

  if (
    normalized === ""
  ) {
    return 0;
  }

  const quality =
    Number(normalized);

  if (
    !Number.isFinite(quality)
  ) {
    return 0;
  }

  return clamp(
    quality,
    MIN_NEGOTIATION_QUALITY,
    MAX_NEGOTIATION_QUALITY,
  );
}

export function formatQuality(
  quality: number,
): string {
  const normalized =
    clamp(
      quality,
      MIN_NEGOTIATION_QUALITY,
      MAX_NEGOTIATION_QUALITY,
    );

  if (
    normalized === 1
  ) {
    return "1";
  }

  if (
    normalized === 0
  ) {
    return "0";
  }

  return normalized
    .toFixed(3)
    .replace(
      /0+$/,
      "",
    );
}

export function isAcceptableQuality(
  quality: number,
): boolean {
  return (
    Number.isFinite(quality) &&
    quality > 0
  );
}
