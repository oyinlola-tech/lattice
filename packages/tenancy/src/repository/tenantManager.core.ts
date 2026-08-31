/**
 * Tenant manager — high-level orchestration.
 *
 * @module repository/tenantManager
 */

import type { TenantId } from "../tenancyTypes/tenantIdentity.js";
import type { Tenant } from "../tenancyTypes/tenantInterface.js";
import type { TenantResolver, TenantResolution } from "../tenancyTypes/resolverTypes.js";
import type { TenantRepository, TenantCache } from "../tenancyTypes/repositoryTypes.js";
import type { TenantContextStorage } from "../context/contextStorage.core.js";
import { TenantNotFoundError, TenantUnavailableError } from "../tenancyErrors/tenancyError.types.js";

/** Options for the tenant manager. */
export interface TenantManagerOptions {
  readonly repository: TenantRepository;
  readonly cache?: TenantCache;
  readonly storage: TenantContextStorage;
}

/**
 * Create a tenant manager.
 */
export function createTenantManager(options: TenantManagerOptions) {
  const { repository, cache, storage } = options;

  async function loadTenant(id: TenantId): Promise<Tenant | undefined> {
    // Check cache first
    if (cache) {
      const cached = await cache.get(id);
      if (cached) return cached;
    }

    // Load from repository
    const tenant = await repository.findById(id);
    if (tenant && cache) {
      await cache.set(tenant);
    }
    return tenant;
  }

  return {
    /**
     * Resolve tenant from a resolution.
     */
    async resolve(resolution: TenantResolution): Promise<Tenant | undefined> {
      return loadTenant(resolution.tenantId);
    },

    /**
     * Get a tenant by ID.
     */
    async get(id: TenantId): Promise<Tenant | undefined> {
      return loadTenant(id);
    },

    /**
     * Require a tenant by ID — throws if not found.
     */
    async require(id: TenantId): Promise<Tenant> {
      const tenant = await loadTenant(id);
      if (!tenant) throw new TenantNotFoundError(id);
      return tenant;
    },

    /**
     * Validate that a tenant is in an active state.
     */
    assertActive(tenant: Tenant): void {
      if (tenant.status !== "active") {
        throw new TenantUnavailableError(tenant.id, tenant.status);
      }
    },

    /**
     * Get the current tenant from context.
     */
    getCurrent(): Tenant | undefined {
      const ctx = storage.get();
      if (ctx?.mode === "tenant") return ctx.tenant;
      return undefined;
    },

    /**
     * Invalidate a cached tenant.
     */
    async invalidate(id: TenantId): Promise<void> {
      if (cache) await cache.delete(id);
    },
  };
}
