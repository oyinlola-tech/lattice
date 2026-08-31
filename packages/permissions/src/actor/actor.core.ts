/**
 * Actor helper functions for creating and inspecting permission actors.
 *
 * @module actor/actor
 */

import type { PermissionActor } from "../permissionTypes/index.js";

/**
 * Create a permission actor.
 */
export function createPermissionActor(
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
    roles: options?.roles ? Object.freeze([...options.roles]) : undefined,
    permissions: options?.permissions ? Object.freeze([...options.permissions]) : undefined,
    deniedPermissions: options?.deniedPermissions ? Object.freeze([...options.deniedPermissions]) : undefined,
  });
}

/**
 * Check if an actor has a specific role.
 */
export function actorHasRole(actor: PermissionActor, role: string): boolean {
  return actor.roles?.includes(role) ?? false;
}

/**
 * Check if an actor has a direct permission.
 */
export function actorHasPermission(actor: PermissionActor, permission: string): boolean {
  return actor.permissions?.includes(permission) ?? false;
}

/**
 * Check if an actor is a system/service actor.
 */
export function isSystemActor(actor: PermissionActor): boolean {
  return actor.type === "system" || actor.type === "service";
}
