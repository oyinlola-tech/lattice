/**
 * Core permission evaluator — resolves actor permissions and evaluates rules + policies.
 */

import type {
  PermissionActor,
  PermissionRule,
  PermissionContext,
  PermissionDecision,
  AuthorizationOptions,
} from "../permissionTypes/index.js";
import { parsePermission, matches } from "../permission/permission.core.js";
import { compileRules, findMatchingRules } from "../rule/ruleCompiler.js";
import { evaluateRules } from "../rule/rule.core.js";
import {
  resolveActorPermissions,
  evaluatePolicies,
} from "./evaluator.pipeline.js";
import type { EvaluatorOptions } from "./evaluator.pipeline.js";

export { evaluateWithExplain } from "./evaluator.explain.js";

/**
 * Evaluate a single permission check and return a decision.
 */
export async function evaluate(
  actor: PermissionActor,
  permissionStr: string,
  resource: unknown,
  options: EvaluatorOptions,
  authOptions?: AuthorizationOptions,
): Promise<PermissionDecision> {
  const permission = parsePermission(permissionStr);

  if (actor.deniedPermissions) {
    for (const denied of actor.deniedPermissions) {
      if (
        denied === permissionStr ||
        denied === `${permission.resource}:*` ||
        denied === "*:*"
      ) {
        return Object.freeze({
          allowed: false,
          reason: "explicit_deny",
          matchedPermission: denied,
        });
      }
    }
  }

  const allPermissions = resolveActorPermissions(actor, options);

  const matchingPermissions = allPermissions.filter((p) =>
    matches(p, permissionStr),
  );
  const rules: PermissionRule[] = matchingPermissions.map((p) => {
    const parsed = parsePermission(p);
    return {
      effect: "allow" as const,
      action: parsed.action,
      resource: parsed.resource,
    };
  });

  const compiled = compileRules(rules);
  const matching = findMatchingRules(compiled, permission);
  const ruleResult = evaluateRules(matching, permission);

  if (!ruleResult.allowed) {
    const ctx: PermissionContext = { actor, permission, resource };
    const policyResult = await evaluatePolicies(
      ctx,
      options.policies ?? [],
      authOptions,
    );
    if (policyResult !== null) return policyResult;

    return Object.freeze({ allowed: false, reason: "no_matching_rule" });
  }

  const ctx: PermissionContext = { actor, permission, resource };
  const policyResult = await evaluatePolicies(
    ctx,
    options.policies ?? [],
    authOptions,
  );
  if (policyResult !== null) return policyResult;

  return Object.freeze({
    allowed: true,
    reason: "role_permission",
    matchedPermission: permissionStr,
  });
}
