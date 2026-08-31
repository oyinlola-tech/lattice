/**
 * In-memory tenant repository and domain registry.
 *
 * @module repository/repository
 */

import type { TenantId } from "../tenancyTypes/tenantIdentity.js";
import type { Tenant } from "../tenancyTypes/tenantInterface.js";
import type { TenantRepository } from "../tenancyTypes/repositoryTypes.js";
import type { TenantDomain } from "../tenancyTypes/tenancyOptions.js";
import { TenantNotFoundError } from "../tenancyErrors/tenancyError.types.js";

/**
 * Create an in-memory tenant repository.
 */
export function createMemoryTenantRepository(): TenantRepository & {
  add(tenant: Tenant): void;
  remove(id: TenantId): void;
  all(): readonly Tenant[];
} {
  const tenants = new Map<string, Tenant>();
  const bySlug = new Map<string, Tenant>();
  const byDomain = new Map<string, Tenant>();

  return {
    async findById(id: TenantId): Promise<Tenant | undefined> {
      return tenants.get(id);
    },

    async findBySlug(slug: string): Promise<Tenant | undefined> {
      return bySlug.get(slug);
    },

    async findByDomain(domain: string): Promise<Tenant | undefined> {
      return byDomain.get(domain);
    },

    add(tenant: Tenant): void {
      tenants.set(tenant.id, tenant);
      if (tenant.slug) bySlug.set(tenant.slug, tenant);
    },

    remove(id: TenantId): void {
      const tenant = tenants.get(id);
      if (tenant) {
        tenants.delete(id);
        if (tenant.slug) bySlug.delete(tenant.slug);
      }
    },

    all(): readonly Tenant[] {
      return Array.from(tenants.values());
    },
  };
}

/**
 * Create a domain-to-tenant registry.
 */
export function createDomainRegistry() {
  const domains = new Map<string, TenantId>();

  return {
    register(domain: string, tenantId: TenantId): void {
      domains.set(domain, tenantId);
    },

    unregister(domain: string): void {
      domains.delete(domain);
    },

    resolve(domain: string): TenantId | undefined {
      return domains.get(domain);
    },

    all(): readonly TenantDomain[] {
      return Array.from(domains.entries()).map(([domain, tenantId]) => ({ domain, tenantId }));
    },
  };
}
