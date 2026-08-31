/**
 * Preference sorting for HTTP content negotiation.
 *
 * Compares and sorts NegotiationPreference objects by quality,
 * specificity, and declaration order.
 */

import type {
  NegotiationPreference,
} from "./httpNegotiation.types.js";

export function comparePreferences(
  left: NegotiationPreference,
  right: NegotiationPreference,
): number {
  if (
    left.quality !==
    right.quality
  ) {
    return (
      right.quality -
      left.quality
    );
  }

  if (
    left.specificity !==
    right.specificity
  ) {
    return (
      right.specificity -
      left.specificity
    );
  }

  return (
    left.order -
    right.order
  );
}

export function sortPreferences(
  preferences: readonly NegotiationPreference[],
): NegotiationPreference[] {
  return [
    ...preferences,
  ].sort(comparePreferences);
}
