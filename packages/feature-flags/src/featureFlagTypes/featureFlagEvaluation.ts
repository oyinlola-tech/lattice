/**
 * Feature flag evaluation result types.
 *
 * Every evaluation produces a structured result with reasoning.
 *
 * @module featureFlagTypes/featureFlagEvaluation
 */

import type { FeatureFlagValue } from "./featureFlagRule/featureFlagValue.type.js";

/** Why a flag evaluation produced its result. */
export type FeatureFlagEvaluationReason =
  | "default"
  | "static"
  | "rule_match"
  | "target_match"
  | "percentage_rollout"
  | "variant_assignment"
  | "disabled"
  | "not_found"
  | "error"
  | "dependency_disabled"
  | "expired";

/** The result of evaluating a feature flag. */
export interface FeatureFlagEvaluation<TValue = FeatureFlagValue> {
  /** The flag key that was evaluated. */
  readonly key: string;
  /** The resolved value. */
  readonly value: TValue;
  /** Why this value was chosen. */
  readonly reason: FeatureFlagEvaluationReason;
  /** The matched rule index, if any. */
  readonly matchedRule?: number;
  /** The assigned variant key, if any. */
  readonly variant?: string;
  /** Whether the default value was used. */
  readonly defaulted: boolean;
}
