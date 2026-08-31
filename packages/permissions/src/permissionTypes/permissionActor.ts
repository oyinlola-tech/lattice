/**
 * Core domain types: actor, permission, and permission string.
 *
 * @module permissionTypes/permissionActor
 */

/** An entity requesting access — user, service, worker, bot, etc. */
export interface PermissionActor {
  /** Unique identifier for the actor. */
  readonly id: string;
  /** Actor type (e.g. "user", "service", "system"). */
  readonly type?: string;
  /** Roles assigned to this actor. */
  readonly roles?: readonly string[];
  /** Direct permissions granted to this actor. */
  readonly permissions?: readonly string[];
  /** Permissions explicitly denied to this actor. */
  readonly deniedPermissions?: readonly string[];
}

/** A parsed permission with resource and action. */
export interface Permission {
  /** Resource being accessed (e.g. "post", "billing.invoice"). */
  readonly resource: string;
  /** Action being performed (e.g. "read", "update", "*"). */
  readonly action: string;
}

/** Permission string format: "resource:action" or wildcards like "post:*", "*:*". */
export type PermissionString = string;
