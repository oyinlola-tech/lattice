/**
 * Generic negotiation algorithm.
 *
 * Provides the core negotiate() and getPreferenceQuality() functions
 * used by all Accept-* header negotiators.
 */

import type {
  NegotiationPreference,
} from "./httpNegotiation.types.js";

import {
  sortPreferences,
} from "./httpNegotiation.sorting.js";

import {
  isAcceptableQuality,
} from "./httpNegotiation.quality.js";

export function negotiate<T>(
  preferences: readonly NegotiationPreference[],
  available: readonly T[],
  matcher: (
    accepted: string,
    available: T,
  ) => boolean,
): T | undefined {
  if (
    available.length ===
    0
  ) {
    return undefined;
  }

  const sorted =
    sortPreferences(
      preferences,
    );

  for (
    const preference of sorted
  ) {
    if (
      !isAcceptableQuality(
        preference.quality,
      )
    ) {
      continue;
    }

    for (
      const candidate of available
    ) {
      if (
        matcher(
          preference.value,
          candidate,
        )
      ) {
        return candidate;
      }
    }
  }

  return undefined;
}

export function getPreferenceQuality<T>(
  preferences: readonly NegotiationPreference[],
  value: T,
  matcher: (
    accepted: string,
    available: T,
  ) => boolean,
): number {
  let best: NegotiationPreference | undefined;

  for (
    const preference of preferences
  ) {
    if (
      matcher(
        preference.value,
        value,
      )
    ) {
      if (
        !best ||
        preference.quality >
          best.quality ||
        (
          preference.quality ===
            best.quality &&
          preference.specificity >
            best.specificity
        )
      ) {
        best = preference;
      }
    }
  }

  return (
    best?.quality ??
    0
  );
}
