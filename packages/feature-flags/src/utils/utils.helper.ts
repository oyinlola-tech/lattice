/**
 * Utility helpers for feature flags.
 *
 * @module utils/utils
 */

import type { FeatureFlagValue } from "../featureFlagTypes/featureFlagRule/featureFlagValue.type.js";

/**
 * Check if a value is a plain object (not null, not array).
 */
export function isPlainObject(
  value: unknown,
): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Check if two feature flag values are equal.
 */
export function valuesEqual(a: FeatureFlagValue, b: FeatureFlagValue): boolean {
  if (a === b) return true;
  if (a === null || b === null) return false;
  if (typeof a !== typeof b) return false;
  if (typeof a === "object" && typeof b === "object") {
    return JSON.stringify(a) === JSON.stringify(b);
  }
  return false;
}
