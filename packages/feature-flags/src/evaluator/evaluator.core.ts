/**
 * Feature flag evaluator.
 *
 * Runs rules in order against a context and produces a structured evaluation result.
 *
 * @module evaluator/evaluator
 */

import type { FeatureFlag } from "../featureFlagTypes/featureFlag.interface.js";
import type { FeatureFlagContext } from "../featureFlagTypes/featureFlagContext.js";
import type { FeatureFlagValue } from "../featureFlagTypes/featureFlagRule/featureFlagValue.type.js";
import type { FeatureFlagEvaluation, FeatureFlagEvaluationReason } from "../featureFlagTypes/featureFlagEvaluation.js";
import { evaluateRule } from "./evaluatorRule.core.js";

/**
 * Evaluate a feature flag against a context.
 *
 * @param flag - The feature flag definition.
 * @param context - The evaluation context.
 * @returns A structured evaluation result.
 */
export function evaluateFlag<TValue extends FeatureFlagValue = FeatureFlagValue>(
  flag: FeatureFlag,
  context: FeatureFlagContext = {},
): FeatureFlagEvaluation<TValue> {
  if (!flag.enabled) {
    return {
      key: flag.key,
      value: flag.defaultValue as TValue,
      reason: "disabled",
      defaulted: true,
    };
  }

  if (flag.state === "archived" || flag.state === "draft") {
    return {
      key: flag.key,
      value: flag.defaultValue as TValue,
      reason: flag.state === "archived" ? "expired" : "disabled",
      defaulted: true,
    };
  }

  if (flag.metadata?.expiresAt && flag.metadata.expiresAt < new Date()) {
    return {
      key: flag.key,
      value: flag.defaultValue as TValue,
      reason: "expired",
      defaulted: true,
    };
  }

  if (flag.dependencies && flag.dependencies.length > 0) {
    return {
      key: flag.key,
      value: flag.defaultValue as TValue,
      reason: "dependency_disabled",
      matchedRule: undefined,
      defaulted: true,
    };
  }

  if (!flag.rules || flag.rules.length === 0) {
    return {
      key: flag.key,
      value: flag.defaultValue as TValue,
      reason: "default",
      defaulted: true,
    };
  }

  for (let i = 0; i < flag.rules.length; i++) {
    const rule = flag.rules[i]!;
    const result = evaluateRule(rule, context, flag.key);

    if (result.matched) {
      const reason: FeatureFlagEvaluationReason =
        rule.type === "percentage" ? "percentage_rollout" :
        rule.type === "variant" ? "variant_assignment" :
        rule.type === "static" ? "static" :
        "rule_match";

      return {
        key: flag.key,
        value: (result.value ?? flag.defaultValue) as TValue,
        reason,
        matchedRule: i,
        variant: result.variant,
        defaulted: false,
      };
    }
  }

  return {
    key: flag.key,
    value: flag.defaultValue as TValue,
    reason: "default",
    defaulted: true,
  };
}
