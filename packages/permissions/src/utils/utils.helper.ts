/**
 * Utility helpers for the permissions package.
 *
 * @module utils/utils
 */

import type { PermissionActor } from "../permissionTypes/index.js";

/**
 * Create a permission check cache key.
 */
export function createCacheKey(actorId: string, permission: string, resourceId?: string): string {
  const base = `${actorId}:${permission}`;
  return resourceId ? `${base}:${resourceId}` : base;
}

/**
 * Extract the resource type from a permission string.
 *
 * @example extractResource("post:update") → "post"
 * @example extractResource("billing.invoice:refund") → "billing.invoice"
 */
export function extractResource(permission: string): string {
  const lastColon = permission.lastIndexOf(":");
  return lastColon > 0 ? permission.slice(0, lastColon) : permission;
}

/**
 * Extract the action from a permission string.
 *
 * @example extractAction("post:update") → "update"
 */
export function extractAction(permission: string): string {
  const lastColon = permission.lastIndexOf(":");
  return lastColon > 0 ? permission.slice(lastColon + 1) : "";
}

/**
 * Build a permission string from resource and action.
 */
export function buildPermission(resource: string, action: string): string {
  return `${resource}:${action}`;
}

/**
 * Create a quick actor object.
 */
export function createActor(
  id: string,
  options?: {
    readonly type?: string;
    readonly roles?: readonly string[];
    readonly permissions?: readonly string[];
    readonly deniedPermissions?: readonly string[];
  },
): PermissionActor {
  return Object.freeze({
    id,
    type: options?.type,
    roles: options?.roles,
    permissions: options?.permissions,
    deniedPermissions: options?.deniedPermissions,
  });
}
