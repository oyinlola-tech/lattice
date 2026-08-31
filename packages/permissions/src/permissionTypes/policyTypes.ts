/**
 * Role, resolver, cache, policy, explain, and options types.
 *
 * @module permissionTypes/policyTypes
 */

import type { PermissionActor } from "./permissionActor.js";
import type { PermissionRule, PermissionContext, PermissionDecision } from "./ruleTypes.js";

/** A role definition with permissions and optional inheritance. */
export interface RoleDefinition {
  /** Role name (e.g. "admin", "editor"). */
  readonly name: string;
  /** Permissions granted by this role. */
  readonly permissions: readonly string[];
  /** Roles this role inherits from. */
  readonly inherits?: readonly string[];
  /** Role description. */
  readonly description?: string;
  /** Whether this is a system role (cannot be deleted). */
  readonly system?: boolean;
}

/** Resolves permissions for an actor from an external source. */
export interface PermissionResolver {
  resolvePermissions(actor: PermissionActor): Promise<readonly PermissionRule[]>;
}

/** Resolves roles for an actor from an external source. */
export interface RoleResolver {
  resolveRoles(actor: PermissionActor): Promise<readonly string[]>;
}

/** Cache adapter for authorization decisions. */
export interface PermissionCache {
  get(key: string): Promise<PermissionDecision | undefined>;
  set(key: string, value: PermissionDecision, options?: { readonly ttl?: number }): Promise<void>;
  delete(key: string): Promise<void>;
  invalidateActor(actorId: string): Promise<void>;
}

/** A named authorization policy. */
export interface PermissionPolicyDefinition {
  readonly name: string;
  readonly permissions: readonly string[];
  readonly cacheable?: boolean;
  readonly priority?: number;
  evaluate(context: PermissionContext): PermissionDecision | Promise<PermissionDecision>;
}

/** A step in an explain trace. */
export interface ExplainStep {
  readonly type: "role" | "permission" | "rule" | "policy" | "deny";
  readonly detail: string;
  readonly matched: boolean;
}

/** Full explanation of an authorization decision. */
export interface ExplainResult {
  readonly allowed: boolean;
  readonly steps: readonly ExplainStep[];
}

/** Options for authorization checks. */
export interface AuthorizationOptions {
  readonly signal?: AbortSignal;
  readonly policyTimeout?: number;
}
