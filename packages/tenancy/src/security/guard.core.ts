/**
 * Tenant guard — validates tenant access and isolation.
 *
 * @module security/guard
 */

import type { TenantId } from "../tenancyTypes/tenantIdentity.js";
import type {
  Tenant,
  TenantResource,
} from "../tenancyTypes/tenantInterface.js";
import type {
  TenantResolutionSource,
  TenantTrustLevel,
} from "../tenancyTypes/tenantInterface.js";
import {
  TenantAccessDeniedError,
  TenantIsolationError,
  TenantUnavailableError,
} from "../tenancyErrors/tenancyError.types.js";

/** Trust levels for resolution sources. */
const TRUST_MAP: Record<TenantResolutionSource, TenantTrustLevel> = {
  jwt: "trusted",
  "api-key": "trusted",
  manual: "trusted",
  system: "trusted",
  header: "verified",
  subdomain: "verified",
  domain: "verified",
  path: "untrusted",
  custom: "untrusted",
};

/**
 * Get the default trust level for a resolution source.
 */
export function getDefaultTrust(
  source: TenantResolutionSource,
): TenantTrustLevel {
  return TRUST_MAP[source] ?? "untrusted";
}

/**
 * Validate that a tenant is usable.
 */
export function assertTenantUsable(tenant: Tenant): void {
  if (tenant.status !== "active") {
    throw new TenantUnavailableError(tenant.id, tenant.status);
  }
}

/**
 * Validate tenant ownership of a resource.
 */
export function assertTenantOwnership(
  resource: TenantResource,
  tenantId: TenantId,
): void {
  if (resource.tenantId !== tenantId) {
    throw new TenantIsolationError(tenantId, resource.tenantId);
  }
}

/**
 * Validate that a trust level is sufficient.
 */
export function assertTrustLevel(
  actual: TenantTrustLevel,
  required: TenantTrustLevel,
  source: TenantResolutionSource,
): void {
  const levels: TenantTrustLevel[] = ["untrusted", "verified", "trusted"];
  const actualIdx = levels.indexOf(actual);
  const requiredIdx = levels.indexOf(required);

  if (actualIdx < requiredIdx) {
    throw new TenantAccessDeniedError(
      `Insufficient trust level from "${source}": need ${required}, got ${actual}`,
    );
  }
}

/**
 * Create a tenant key for scoped resources.
 */
export function tenantKey(
  tenantId: TenantId,
  key: string,
  separator: string = ":",
): string {
  return `tenant${separator}${tenantId}${separator}${key}`;
}

/**
 * Create a tenant cache key.
 */
export function createTenantCacheKey(tenantId: TenantId, key: string): string {
  return tenantKey(tenantId, key, ":");
}
