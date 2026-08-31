/**
 * Rule matching and compilation for permission evaluation.
 *
 * @module rule/rule
 */

import type { PermissionRule, Permission } from "../permissionTypes/index.js";

/**
 * Check if a rule matches a target permission.
 *
 * A rule matches if its resource and action patterns match the target,
 * considering wildcard support.
 */
export function ruleMatches(rule: PermissionRule, target: Permission): boolean {
  return resourceMatches(rule.resource, target.resource) &&
    actionMatches(rule.action, target.action);
}

/**
 * Check if a rule's resource pattern matches a target resource.
 */
function resourceMatches(
  pattern: string | readonly string[],
  target: string,
): boolean {
  if (Array.isArray(pattern)) {
    return pattern.some((p) => patternStrMatches(p, target));
  }
  return patternStrMatches(pattern as string, target);
}

/**
 * Check if a rule's action pattern matches a target action.
 */
function actionMatches(
  pattern: string | readonly string[],
  target: string,
): boolean {
  if (Array.isArray(pattern)) {
    return pattern.some((p) => patternStrMatches(p, target));
  }
  return patternStrMatches(pattern as string, target);
}

/**
 * Check if a single pattern string matches a target, supporting wildcards.
 */
function patternStrMatches(pattern: string, target: string): boolean {
  if (pattern === "*") return true;
  if (pattern === target) return true;

  // Namespace wildcard: "billing.*" matches "billing.invoice"
  if (pattern.endsWith(".*")) {
    const prefix = pattern.slice(0, -2);
    return target === prefix || target.startsWith(`${prefix}.`);
  }

  return false;
}

/**
 * Evaluate a set of rules against a target permission.
 *
 * Returns the effective decision after applying deny-overrides and priority.
 * Default: deny.
 */
export function evaluateRules(
  rules: readonly PermissionRule[],
  target: Permission,
): { readonly allowed: boolean; readonly matchedRule?: PermissionRule } {
  const matching = rules.filter((r) => ruleMatches(r, target));

  if (matching.length === 0) {
    return { allowed: false };
  }

  // Sort by priority descending; same priority: deny wins (deny has higher effective priority)
  const sorted = [...matching].sort((a, b) => {
    const priA = a.priority ?? 0;
    const priB = b.priority ?? 0;
    if (priA !== priB) return priB - priA;
    // Same priority: deny wins
    if (a.effect === "deny" && b.effect !== "deny") return -1;
    if (b.effect === "deny" && a.effect !== "deny") return 1;
    return 0;
  });

  const top = sorted[0]!;
  return {
    allowed: top.effect === "allow",
    matchedRule: top,
  };
}
