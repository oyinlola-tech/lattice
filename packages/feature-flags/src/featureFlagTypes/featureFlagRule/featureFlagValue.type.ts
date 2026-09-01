/**
 * Feature flag value types.
 *
 * A feature flag can return boolean, string, number, null, or a structured object.
 *
 * @module featureFlagTypes/featureFlagValue
 */

/** A feature flag value — boolean for simple toggles, string/number for variants. */
export type FeatureFlagValue =
  boolean | string | number | null | Record<string, unknown>;

/** Feature flag lifecycle state. */
export type FeatureFlagState = "active" | "disabled" | "archived" | "draft";

/** Feature flag visibility scope. */
export type FeatureFlagVisibility = "server" | "client";
