/**
 * Accept-Charset header parsing and matching.
 *
 * Handles character set negotiation for response encoding.
 */

import type { NegotiationPreference } from "./httpNegotiation.types.js";

import { parseNegotiationHeader } from "./httpNegotiation.parsing.js";

import { normalizeToken } from "./httpNegotiation.internal.js";

import { negotiate } from "./httpNegotiation.negotiate.js";

export function parseAcceptCharset(
  header: string | undefined | null,
): NegotiationPreference[] {
  return parseNegotiationHeader(header);
}

export function matchesCharset(accepted: string, available: string): boolean {
  const left = normalizeToken(accepted);

  const right = normalizeToken(available);

  return left === "*" || left === right;
}

export function negotiateCharset(
  header: string | undefined | null,
  available: readonly string[],
): string | undefined {
  return negotiate(parseAcceptCharset(header), available, matchesCharset);
}
