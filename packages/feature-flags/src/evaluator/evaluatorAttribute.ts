/**
 * Attribute matching for feature flag targeting rules.
 *
 * Supports dot-notation traversal for nested attributes and all comparison operators.
 *
 * @module evaluator/evaluatorAttribute
 */

import type { FeatureFlagOperator } from "../featureFlagTypes/featureFlagRule/featureFlagRule.type.js";

/**
 * Safely resolve a dot-notation path from an object.
 *
 * @param obj - The object to traverse.
 * @param path - Dot-separated path (e.g. "user.country").
 * @returns The value at the path, or undefined.
 */
export function resolvePath(obj: unknown, path: string): unknown {
  const parts = path.split(".");
  let current: unknown = obj;

  for (const part of parts) {
    if (
      current === null ||
      current === undefined ||
      typeof current !== "object"
    ) {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }

  return current;
}

/**
 * Evaluate an attribute rule against a context value.
 *
 * @param actual - The actual value from context.
 * @param operator - The comparison operator.
 * @param expected - The expected value from the rule.
 * @returns Whether the condition matches.
 */
export function matchAttribute(
  actual: unknown,
  operator: FeatureFlagOperator,
  expected: unknown,
): boolean {
  switch (operator) {
    case "equals":
      return actual === expected;

    case "not_equals":
      return actual !== expected;

    case "contains":
      return (
        typeof actual === "string" &&
        typeof expected === "string" &&
        actual.includes(expected)
      );

    case "starts_with":
      return (
        typeof actual === "string" &&
        typeof expected === "string" &&
        actual.startsWith(expected)
      );

    case "ends_with":
      return (
        typeof actual === "string" &&
        typeof expected === "string" &&
        actual.endsWith(expected)
      );

    case "in":
      return Array.isArray(expected) && expected.includes(actual);

    case "not_in":
      return Array.isArray(expected) && !expected.includes(actual);

    case "greater_than":
      return (
        typeof actual === "number" &&
        typeof expected === "number" &&
        actual > expected
      );

    case "greater_than_or_equal":
      return (
        typeof actual === "number" &&
        typeof expected === "number" &&
        actual >= expected
      );

    case "less_than":
      return (
        typeof actual === "number" &&
        typeof expected === "number" &&
        actual < expected
      );

    case "less_than_or_equal":
      return (
        typeof actual === "number" &&
        typeof expected === "number" &&
        actual <= expected
      );

    case "exists":
      return actual !== undefined && actual !== null;

    case "matches":
      return (
        typeof actual === "string" &&
        typeof expected === "string" &&
        new RegExp(expected).test(actual)
      );

    default:
      return false;
  }
}
