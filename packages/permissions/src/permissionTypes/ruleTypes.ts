/**
 * Rule, condition, context, and decision types.
 *
 * @module permissionTypes/ruleTypes
 */

import type { PermissionActor, Permission } from "./permissionActor.js";

/** Whether a rule allows or denies access. */
export type RuleEffect = "allow" | "deny";

/** A permission rule that grants or denies access under conditions. */
export interface PermissionRule {
  /** Allow or deny. */
  readonly effect: RuleEffect;
  /** Action(s) this rule applies to. */
  readonly action: string | readonly string[];
  /** Resource(s) this rule applies to. */
  readonly resource: string | readonly string[];
  /** Optional condition function for ABAC. */
  readonly condition?: PermissionConditionFn;
  /** Rule priority — higher wins. Same priority: deny wins. */
  readonly priority?: number;
  /** Human-readable rule name for debugging. */
  readonly name?: string;
}

/** A function that evaluates whether a condition is met. */
export type PermissionConditionFn = (
  context: PermissionContext,
) => boolean | Promise<boolean>;

/** Context provided during authorization evaluation. */
export interface PermissionContext {
  /** The actor requesting access. */
  readonly actor: PermissionActor;
  /** The permission string being checked (e.g. "post:update"). */
  readonly permission: Permission;
  /** The target resource (optional). */
  readonly resource?: unknown;
  /** Arbitrary metadata (IP, tenant, timestamp, etc.). */
  readonly metadata?: ReadonlyMap<string, unknown>;
}

/** Result of an authorization check. */
export interface PermissionDecision {
  /** Whether the action is allowed. */
  readonly allowed: boolean;
  /** Human-readable reason for the decision. */
  readonly reason?: string;
  /** Name of the policy/rule that produced the decision. */
  readonly policy?: string;
  /** The matched permission string. */
  readonly matchedPermission?: string;
  /** Additional decision metadata. */
  readonly metadata?: unknown;
}
