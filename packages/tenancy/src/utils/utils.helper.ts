/**
 * Utility helpers for the tenancy package.
 *
 * @module utils/utils
 */

import type { TenantId } from "../tenancyTypes/tenantIdentity.js";
import type { Tenant, TenantContext } from "../tenancyTypes/tenantInterface.js";

/**
 * Check if a tenant is in a usable state.
 */
export function isTenantActive(tenant: Tenant): boolean {
  return tenant.status === "active";
}

/**
 * Check if two tenant IDs match.
 */
export function sameTenant(a: TenantId, b: TenantId): boolean {
  return a === b;
}

/**
 * Create a tenant summary string for logging.
 */
export function summarizeTenant(tenant: Tenant): string {
  return `Tenant(${tenant.id}, ${tenant.name}, ${tenant.status})`;
}

/**
 * Create a tenant context summary string for logging.
 */
export function summarizeContext(ctx: TenantContext): string {
  return `TenantContext(${ctx.tenantId}, source=${ctx.source}, trust=${ctx.trust})`;
}
