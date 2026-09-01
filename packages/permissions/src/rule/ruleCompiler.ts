/**
 * Rule compiler — indexes rules for fast lookup during authorization.
 *
 * @module rule/ruleCompiler
 */

import type { PermissionRule, Permission } from "../permissionTypes/index.js";

/** Compiled rule index for O(1) lookup by resource:action. */
interface RuleIndex {
  /** Exact matches: "post:update" → rules. */
  readonly exact: ReadonlyMap<string, readonly PermissionRule[]>;
  /** Resource wildcards: "post:*" → rules. */
  readonly resourceWildcard: ReadonlyMap<string, readonly PermissionRule[]>;
  /** Action wildcards: "*:read" → rules. */
  readonly actionWildcard: ReadonlyMap<string, readonly PermissionRule[]>;
  /** Global wildcards: "*:*" → rules. */
  readonly globalWildcard: readonly PermissionRule[];
}

/**
 * Compile a set of rules into an optimized index.
 */
export function compileRules(rules: readonly PermissionRule[]): RuleIndex {
  const exact = new Map<string, PermissionRule[]>();
  const resourceWildcard = new Map<string, PermissionRule[]>();
  const actionWildcard = new Map<string, PermissionRule[]>();
  const globalWildcard: PermissionRule[] = [];

  for (const rule of rules) {
    const resources = normalizeToArray(rule.resource);
    const actions = normalizeToArray(rule.action);

    for (const resource of resources) {
      for (const action of actions) {
        if (resource === "*" && action === "*") {
          globalWildcard.push(rule);
        } else if (resource === "*") {
          const key = action;
          if (!actionWildcard.has(key)) actionWildcard.set(key, []);
          actionWildcard.get(key)!.push(rule);
        } else if (action === "*") {
          const key = resource;
          if (!resourceWildcard.has(key)) resourceWildcard.set(key, []);
          resourceWildcard.get(key)!.push(rule);
        } else {
          const key = `${resource}:${action}`;
          if (!exact.has(key)) exact.set(key, []);
          exact.get(key)!.push(rule);
        }
      }
    }
  }

  const index: RuleIndex = {
    exact,
    resourceWildcard,
    actionWildcard,
    globalWildcard,
  };
  return index;
}

/**
 * Find all rules from the compiled index that match a target permission.
 */
export function findMatchingRules(
  index: RuleIndex,
  target: Permission,
): readonly PermissionRule[] {
  const results: PermissionRule[] = [];
  const key = `${target.resource}:${target.action}`;

  // 1. Exact matches
  const exactRules = index.exact.get(key);
  if (exactRules) results.push(...exactRules);

  // 2. Resource wildcard: "post:*" matches "post:update"
  const resWildcard = index.resourceWildcard.get(target.resource);
  if (resWildcard) results.push(...resWildcard);

  // 3. Action wildcard: "*:read" matches "post:read"
  const actWildcard = index.actionWildcard.get(target.action);
  if (actWildcard) results.push(...actWildcard);

  // 4. Global wildcard: "*:*"
  results.push(...index.globalWildcard);

  return results;
}

function normalizeToArray(value: string | readonly string[]): string[] {
  return Array.isArray(value) ? [...value] : [value as string];
}
