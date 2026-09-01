/**
 * Condition combinators for composing authorization policies.
 *
 * @module conditions/conditions
 */

import type {
  PermissionConditionFn,
  PermissionContext,
} from "../permissionTypes/index.js";

/**
 * All conditions must return true.
 */
export function allOf(
  ...conditions: readonly PermissionConditionFn[]
): PermissionConditionFn {
  return async (context) => {
    for (const condition of conditions) {
      if (!(await condition(context))) return false;
    }
    return true;
  };
}

/**
 * At least one condition must return true.
 */
export function anyOf(
  ...conditions: readonly PermissionConditionFn[]
): PermissionConditionFn {
  return async (context) => {
    for (const condition of conditions) {
      if (await condition(context)) return true;
    }
    return false;
  };
}

/**
 * Negate a condition.
 */
export function not(condition: PermissionConditionFn): PermissionConditionFn {
  return async (context) => !(await condition(context));
}

/**
 * Always allow — unconditional pass.
 */
export function always(): PermissionConditionFn {
  return () => true;
}

/**
 * Always deny — unconditional fail.
 */
export function never(): PermissionConditionFn {
  return () => false;
}

/**
 * Check that the actor owns the resource.
 *
 * @param ownerField - The field on the resource that holds the owner's ID. Defaults to "ownerId".
 */
export function isOwner(ownerField: string = "ownerId"): PermissionConditionFn {
  return (context) => {
    if (!context.resource || typeof context.resource !== "object") return false;
    const resource = context.resource as Record<string, unknown>;
    const ownerId = resource[ownerField];
    return ownerId === context.actor.id;
  };
}

/**
 * Enforce tenant isolation — actor and resource must share the same tenant.
 *
 * @param actorTenantField - Field on actor metadata holding tenant ID. Defaults to "tenantId".
 * @param resourceTenantField - Field on resource holding tenant ID. Defaults to "tenantId".
 */
export function tenantIsolation(
  actorTenantField: string = "tenantId",
  resourceTenantField: string = "tenantId",
): PermissionConditionFn {
  return (context) => {
    const actorTenant = context.metadata?.get(actorTenantField);
    if (!context.resource || typeof context.resource !== "object") return false;
    const resource = context.resource as Record<string, unknown>;
    const resourceTenant = resource[resourceTenantField];
    return actorTenant !== undefined && actorTenant === resourceTenant;
  };
}
