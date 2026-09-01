/**
 * Permission evaluator with full explain trace.
 *
 * Records each evaluation step for debugging and auditing.
 */

import type {
  PermissionActor,
  PermissionRule,
  PermissionContext,
  ExplainStep,
  ExplainResult,
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

/**
 * Evaluate with full explain trace.
 */
export async function evaluateWithExplain(
  actor: PermissionActor,
  permissionStr: string,
  resource: unknown,
  options: EvaluatorOptions,
  authOptions?: AuthorizationOptions,
): Promise<ExplainResult> {
  const permission = parsePermission(permissionStr);
  const steps: ExplainStep[] = [];

  if (actor.deniedPermissions) {
    for (const denied of actor.deniedPermissions) {
      if (
        denied === permissionStr ||
        denied === `${permission.resource}:*` ||
        denied === "*:*"
      ) {
        steps.push({
          type: "deny",
          detail: `Explicit deny: ${denied}`,
          matched: true,
        });
        return Object.freeze({ allowed: false, steps });
      }
    }
  }

  const allPermissions = resolveActorPermissions(actor, options);
  if (actor.roles) {
    for (const role of actor.roles) {
      steps.push({ type: "role", detail: `Role: ${role}`, matched: true });
    }
  }

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

  for (const perm of allPermissions) {
    const matched = matches(perm, permissionStr);
    steps.push({ type: "permission", detail: `Permission: ${perm}`, matched });
  }

  if (!ruleResult.allowed) {
    const ctx: PermissionContext = { actor, permission, resource };
    const policyResult = await evaluatePolicies(
      ctx,
      options.policies ?? [],
      authOptions,
    );
    if (policyResult !== null) {
      steps.push({
        type: "policy",
        detail: `Policy: ${policyResult.reason ?? "unknown"}`,
        matched: policyResult.allowed,
      });
      return Object.freeze({ allowed: policyResult.allowed, steps });
    }
    steps.push({ type: "deny", detail: "No matching rule", matched: false });
    return Object.freeze({ allowed: false, steps });
  }

  const ctx: PermissionContext = { actor, permission, resource };
  const policyResult = await evaluatePolicies(
    ctx,
    options.policies ?? [],
    authOptions,
  );
  if (policyResult !== null) {
    steps.push({
      type: "policy",
      detail: `Policy: ${policyResult.reason ?? "unknown"}`,
      matched: policyResult.allowed,
    });
    return Object.freeze({ allowed: policyResult.allowed, steps });
  }

  steps.push({ type: "permission", detail: "Rule matched", matched: true });
  return Object.freeze({ allowed: true, steps });
}
