/**
 * Internal helpers for computing media type and language specificity scores.
 *
 * @module httpHeaders/internal/specificity
 */

import type { ParsedMediaType } from "../internal/httpHeaders.internal.mediaType.js";

/**
 * Computes a specificity score for a media type match.
 *
 * @param accepted - The accepted media type pattern.
 * @param candidate - The candidate media type to match against.
 * @returns A specificity score (0 = no match, 1 = wildcard type, 2 = wildcard subtype or suffix match, 3 = exact match).
 */
export function mediaTypeSpecificity(
  accepted:
    | ParsedMediaType,
  candidate:
    | ParsedMediaType,
):
  | number {
  if (
    accepted.type !==
      "*" &&
    accepted.type !==
      candidate.type
  ) {
    return 0;
  }

  if (
    accepted.subtype ===
      "*"
  ) {
    return accepted.type ===
      "*"
      ? 1
      : 2;
  }

  if (
    accepted.subtype.startsWith(
      "*+",
    )
  ) {
    return candidate.subtype.endsWith(
      accepted.subtype.slice(
        1,
      ),
    )
      ? 2
      : 0;
  }

  return accepted.subtype ===
    candidate.subtype
    ? 3
    : 0;
}

/**
 * Computes a specificity score for a language match.
 *
 * @param accepted - The accepted language tag (e.g. `"en"` or `"en-US"`).
 * @param candidate - The candidate language tag.
 * @returns A specificity score (0 = no match, 1 = wildcard, 2 = prefix match, 3 = exact match).
 */
export function languageSpecificity(
  accepted:
    | string,
  candidate:
    | string,
):
  | number {
  if (
    accepted ===
      "*"
  ) {
    return 1;
  }

  if (
    accepted ===
      candidate
  ) {
    return 3;
  }

  if (
    candidate.startsWith(
      `${accepted}-`,
    ) ||
    accepted.startsWith(
      `${candidate}-`,
    )
  ) {
    return 2;
  }

  return 0;
}
