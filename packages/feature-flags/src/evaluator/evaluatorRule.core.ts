/**
 * Rule evaluator for feature flags.
 *
 * Evaluates a single rule against an evaluation context.
 *
 * @module evaluator/evaluatorRule
 */

import type { FeatureFlagRule } from "../featureFlagTypes/featureFlagRule/featureFlagRule.type.js";
import type { FeatureFlagContext } from "../featureFlagTypes/featureFlagContext.js";
import type { FeatureFlagValue } from "../featureFlagTypes/featureFlagRule/featureFlagValue.type.js";
import { isInRollout } from "../rollout/rolloutBucketing.js";
import { matchAttribute, resolvePath } from "./evaluatorAttribute.js";

/** Result of evaluating a single rule. */
export interface RuleEvaluationResult {
  /** Whether the rule matched. */
  readonly matched: boolean;
  /** The value to return if matched. */
  readonly value?: FeatureFlagValue;
  /** The variant key if a variant rule matched. */
  readonly variant?: string;
}

/**
 * Evaluate a single feature flag rule against a context.
 *
 * @param rule - The rule to evaluate.
 * @param context - The evaluation context.
 * @param flagKey - The flag key (used for percentage bucketing).
 * @returns The evaluation result.
 */
export function evaluateRule(
  rule: FeatureFlagRule,
  context: FeatureFlagContext,
  flagKey: string,
): RuleEvaluationResult {
  switch (rule.type) {
    case "static":
      return { matched: true, value: rule.value };

    case "user": {
      if (!context.userId) return { matched: false };
      const matched = rule.users.includes(context.userId);
      return { matched, value: matched ? rule.value : undefined };
    }

    case "tenant": {
      if (!context.tenantId) return { matched: false };
      const matched = rule.tenants.includes(context.tenantId);
      return { matched, value: matched ? rule.value : undefined };
    }

    case "attribute": {
      let actual = resolvePath(context, rule.attribute);
      if (actual === undefined && context.attributes) {
        actual = resolvePath(context.attributes, rule.attribute);
      }
      const matched = matchAttribute(actual, rule.operator, rule.value);
      return { matched, value: matched ? true : undefined };
    }

    case "percentage": {
      const subject = context.userId ?? context.tenantId ?? context.sessionId ?? "anonymous";
      const matched = isInRollout(flagKey, subject, rule.percentage);
      return { matched, value: matched ? rule.value : undefined };
    }

    case "schedule": {
      const now = Date.now();
      const start = new Date(rule.startAt).getTime();
      const end = new Date(rule.endAt).getTime();
      const matched = now >= start && now <= end;
      return { matched, value: matched ? rule.value : undefined };
    }

    case "variant": {
      const subject = context.userId ?? context.tenantId ?? context.sessionId ?? "anonymous";
      const totalWeight = rule.variants.reduce((sum: number, v: { weight: number }) => sum + v.weight, 0);
      if (totalWeight <= 0) return { matched: false };

      const bucket = isInRollout(flagKey, subject, 100) ? 99 : 0;
      let cumulative = 0;

      for (const variant of rule.variants) {
        cumulative += (variant.weight / totalWeight) * 100;
        if (bucket < cumulative) {
          return { matched: true, value: variant.key, variant: variant.key };
        }
      }

      return { matched: false };
    }

    default:
      return { matched: false };
  }
}
