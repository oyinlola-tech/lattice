/**
 * Role-based access control (RBAC) types.
 *
 * @module authRbac
 *
 * Re-exported from @zudo/permissions for backward compatibility.
 * For new code, import directly from @zudo/permissions.
 */

import type {
  PermissionString as PermissionsPermissionString,
  RoleDefinition as PermissionsRole,
} from "@zudo/permissions";

/**
 * Permission string format: "resource:action"
 * Examples: "users:read", "posts:write", "admin:*"
 */
export type Permission = PermissionsPermissionString;

/**
 * Role definition with associated permissions.
 */
export type Role = PermissionsRole;

/**
 * Guard result after checking permissions.
 */
export interface GuardResult {
  /** Whether access is allowed */
  readonly allowed: boolean;
  /** Reason for denial (if denied) */
  readonly reason?: string;
  /** Required permission that was missing */
  readonly requiredPermission?: Permission;
  /** User's roles at time of check */
  readonly userRoles?: readonly string[];
}

/**
 * Guard context for authorization checks.
 */
export interface GuardContext {
  /** User ID to check */
  readonly userId: string;
  /** User's roles */
  readonly roles: readonly string[];
  /** Required permission */
  readonly permission: Permission;
  /** Optional resource owner ID (for ownership checks) */
  readonly resourceOwnerId?: string;
}
