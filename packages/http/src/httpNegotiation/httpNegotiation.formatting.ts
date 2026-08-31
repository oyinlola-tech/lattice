/**
 * Header formatting for HTTP negotiation preferences.
 *
 * Serializes NegotiationPreference objects back into
 * header value strings.
 */

import type {
  NegotiationPreference,
} from "./httpNegotiation.types.js";

import {
  DEFAULT_NEGOTIATION_QUALITY,
} from "./httpNegotiation.types.js";

import {
  formatQuality,
} from "./httpNegotiation.quality.js";

import {
  quoteIfNeeded,
} from "./httpNegotiation.internal.js";

export function formatNegotiationPreferences(
  preferences: readonly NegotiationPreference[],
): string {
  return preferences
    .map(
      formatPreference,
    )
    .join(", ");
}

export function formatPreference(
  preference: NegotiationPreference,
): string {
  const parameters =
    Object.entries(
      preference.parameters,
    ).map(
      ([key, value]) =>
        `${key}=${quoteIfNeeded(
          value,
        )}`,
    );

  if (
    preference.quality !==
    DEFAULT_NEGOTIATION_QUALITY
  ) {
    parameters.push(
      `q=${formatQuality(
        preference.quality,
      )}`,
    );
  }

  return [
    preference.value,
    ...parameters,
  ].join("; ");
}
