/**
 * Tenant security — validation, isolation, and access control.
 *
 * @module security
 */

export {
  getDefaultTrust,
  assertTenantUsable,
  assertTenantOwnership,
  assertTrustLevel,
  tenantKey,
  createTenantCacheKey,
} from "./guard.core.js";
