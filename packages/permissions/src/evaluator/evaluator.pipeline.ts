/**
 * Permission resolution and policy evaluation pipeline.
 *
 * @module evaluator/evaluator.pipeline
 */

import type {
  PermissionActor,
  PermissionContext,
  PermissionDecision,
  PermissionPolicyDefinition,
  AuthorizationOptions,
} from "../permissionTypes/index.js";
import { resolveRolePermissions } from "../role/roleHierarchy.js";
import { AuthorizationAbortedError } from "../permissionErrors/index.js";

/** Configuration for the evaluator. */
export interface EvaluatorOptions {
  /** Function to look up a role definition by name. */
  readonly getRole?: (name: string) =>
    | {
        readonly name: string;
        readonly permissions: readonly string[];
        readonly inherits?: readonly string[];
      }
    | undefined;
  /** Registered policies. */
  readonly policies?: readonly PermissionPolicyDefinition[];
  /** Default timeout for async policy evaluation (ms). */
  readonly policyTimeout?: number;
}

/**
 * Resolve all permissions for an actor (direct + role-based).
 */
export function resolveActorPermissions(
  actor: PermissionActor,
  options: EvaluatorOptions,
): readonly string[] {
  const permissions = new Set<string>();

  // Direct permissions
  if (actor.permissions) {
    for (const p of actor.permissions) permissions.add(p);
  }

  // Role-based permissions
  if (actor.roles && options.getRole) {
    const rolePerms = resolveRolePermissions(actor.roles, options.getRole);
    for (const p of rolePerms) permissions.add(p);
  }

  return Array.from(permissions);
}

/**
 * Evaluate policies for a context. Returns null if no policy matched.
 */
export async function evaluatePolicies(
  context: PermissionContext,
  policies: readonly PermissionPolicyDefinition[],
  authOptions?: AuthorizationOptions,
): Promise<PermissionDecision | null> {
  if (policies.length === 0) return null;

  const permissionStr = `${context.permission.resource}:${context.permission.action}`;
  const applicable = policies.filter((p) =>
    p.permissions.includes(permissionStr),
  );

  if (applicable.length === 0) return null;

  for (const policy of applicable) {
    try {
      const result = await withTimeout(
        Promise.resolve(policy.evaluate(context)),
        authOptions?.policyTimeout,
      );
      if (!result.allowed) {
        return Object.freeze({
          allowed: false,
          reason: result.reason ?? `policy:${policy.name}`,
          policy: policy.name,
        });
      }
    } catch (error) {
      if (error instanceof AuthorizationAbortedError) throw error;
      // Policy error — fail closed
      return Object.freeze({
        allowed: false,
        reason: `policy_error:${policy.name}`,
        policy: policy.name,
      });
    }
  }

  return Object.freeze({
    allowed: true,
    reason: "policy_allow",
    policy: applicable.map((p) => p.name).join(","),
  });
}

/**
 * Run a promise with an optional timeout.
 */
async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs?: number,
): Promise<T> {
  if (!timeoutMs) return promise;

  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error("Policy timeout"));
    }, timeoutMs);

    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}
