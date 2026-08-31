/**
 * Accept-Encoding header parsing and matching.
 *
 * Handles content encoding negotiation for transfer compression.
 */

import type {
  NegotiationPreference,
} from "./httpNegotiation.types.js";

import {
  parseNegotiationHeader,
} from "./httpNegotiation.parsing.js";

import {
  normalizeToken,
} from "./httpNegotiation.internal.js";

import {
  negotiate,
  getPreferenceQuality,
} from "./httpNegotiation.negotiate.js";

export function parseAcceptEncoding(
  header:
    | string
    | undefined
    | null,
): NegotiationPreference[] {
  return parseNegotiationHeader(
    header,
  );
}

export function matchesEncoding(
  accepted: string,
  available: string,
): boolean {
  const left =
    normalizeToken(
      accepted,
    );

  const right =
    normalizeToken(
      available,
    );

  return (
    left === "*" ||
    left === right
  );
}

export function negotiateEncoding(
  header:
    | string
    | undefined
    | null,
  available: readonly string[],
): string | undefined {
  const preferences =
    parseAcceptEncoding(
      header,
    );

  if (
    preferences.length === 0
  ) {
    return available[0];
  }

  return negotiate(
    preferences,
    available,
    matchesEncoding,
  );
}

export function getEncodingQuality(
  header:
    | string
    | undefined
    | null,
  encoding: string,
): number {
  const preferences =
    parseAcceptEncoding(
      header,
    );

  if (
    preferences.length === 0
  ) {
    return 1;
  }

  return getPreferenceQuality(
    preferences,
    encoding,
    matchesEncoding,
  );
}
