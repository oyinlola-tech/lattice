/**
 * Accept-Language header parsing and matching.
 *
 * Handles language tag negotiation with RFC-style basic
 * language range matching.
 */

import type { NegotiationPreference } from "./httpNegotiation.types.js";

import { parseNegotiationHeader } from "./httpNegotiation.parsing.js";

import {
  negotiate,
  getPreferenceQuality,
} from "./httpNegotiation.negotiate.js";

export function normalizeLanguageTag(value: string): string {
  return value.trim().replace(/_/g, "-").toLowerCase();
}

export function languageSpecificity(value: string): number {
  const normalized = normalizeLanguageTag(value);

  if (normalized === "*") {
    return 0;
  }

  return normalized.split("-").filter(Boolean).length;
}

export function parseAcceptLanguage(
  header: string | undefined | null,
): NegotiationPreference[] {
  return parseNegotiationHeader(header);
}

export function matchesLanguage(accepted: string, available: string): boolean {
  const left = normalizeLanguageTag(accepted);

  const right = normalizeLanguageTag(available);

  if (left === "*" || left === right) {
    return true;
  }

  return right.startsWith(`${left}-`);
}

export function negotiateLanguage(
  header: string | undefined | null,
  available: readonly string[],
): string | undefined {
  return negotiate(parseAcceptLanguage(header), available, matchesLanguage);
}

export function getLanguageQuality(
  header: string | undefined | null,
  language: string,
): number {
  const preferences = parseAcceptLanguage(header);

  if (preferences.length === 0) {
    return 1;
  }

  return getPreferenceQuality(preferences, language, matchesLanguage);
}
