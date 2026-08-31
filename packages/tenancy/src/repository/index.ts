/**
 * Tenant repository and manager.
 *
 * @module repository
 */

export {
  createMemoryTenantRepository,
  createDomainRegistry,
} from "./repository.core.js";

export {
  createTenantManager,
  type TenantManagerOptions,
} from "./tenantManager.core.js";
