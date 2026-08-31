/**
 * Feature flag rule types.
 *
 * Rules determine how a flag evaluates against a given context.
 *
 * @module featureFlagTypes/featureFlagRule
 */

import type { FeatureFlagValue } from "./featureFlagValue.type.js";

/** Operators for attribute-based targeting. */
export type FeatureFlagOperator =
  | "equals"
  | "not_equals"
  | "contains"
  | "starts_with"
  | "ends_with"
  | "in"
  | "not_in"
  | "greater_than"
  | "greater_than_or_equal"
  | "less_than"
  | "less_than_or_equal"
  | "exists"
  | "matches";

/** A static rule — always returns its value. */
export interface FeatureFlagStaticRule {
  readonly type: "static";
  readonly value: FeatureFlagValue;
}

/** Target specific users by ID. */
export interface FeatureFlagUserRule {
  readonly type: "user";
  readonly users: readonly string[];
  readonly value: FeatureFlagValue;
}

/** Target specific tenants by ID. */
export interface FeatureFlagTenantRule {
  readonly type: "tenant";
  readonly tenants: readonly string[];
  readonly value: FeatureFlagValue;
}

/** Target by attribute matching. */
export interface FeatureFlagAttributeRule {
  readonly type: "attribute";
  readonly attribute: string;
  readonly operator: FeatureFlagOperator;
  readonly value: unknown;
}

/** Percentage-based rollout — deterministic per subject. */
export interface FeatureFlagPercentageRule {
  readonly type: "percentage";
  readonly percentage: number;
  readonly value: FeatureFlagValue;
}

/** Time-windowed rule — enabled only within a date range. */
export interface FeatureFlagScheduleRule {
  readonly type: "schedule";
  readonly startAt: string;
  readonly endAt: string;
  readonly value: FeatureFlagValue;
}

/** Variant assignment rule — assigns a variant key based on weight. */
export interface FeatureFlagVariantRule {
  readonly type: "variant";
  readonly variants: readonly FeatureFlagVariant[];
}

/** A variant with a weight for percentage-based assignment. */
export interface FeatureFlagVariant {
  readonly key: string;
  readonly weight: number;
}

/** Union of all feature flag rule types. */
export type FeatureFlagRule =
  | FeatureFlagStaticRule
  | FeatureFlagUserRule
  | FeatureFlagTenantRule
  | FeatureFlagAttributeRule
  | FeatureFlagPercentageRule
  | FeatureFlagScheduleRule
  | FeatureFlagVariantRule;
