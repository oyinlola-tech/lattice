/**
 * Tenant context manager — high-level API for tenant context operations.
 *
 * @module context/contextManager
 */

import type { Tenant } from "../tenancyTypes/tenantInterface.js";
import type { TenantContextStorage } from "./contextStorage.core.js";
import type {
  SystemContext,
  TenantExecutionContext,
  ExecutionTenantContext,
} from "../tenancyTypes/tenantInterface.js";
import { TenantContextMissingError } from "../tenancyErrors/tenancyError.types.js";

/** Options for the context manager. */
export interface ContextManagerOptions {
  readonly storage: TenantContextStorage;
}

/**
 * Create a tenant context manager.
 */
export function createContextManager(options: ContextManagerOptions) {
  const { storage } = options;

  return {
    /**
     * Get the current execution context.
     */
    getCurrent(): ExecutionTenantContext | undefined {
      return storage.get();
    },

    /**
     * Get the current tenant, if any.
     */
    getCurrentTenant(): Tenant | undefined {
      const ctx = storage.get();
      if (ctx?.mode === "tenant") return ctx.tenant;
      return undefined;
    },

    /**
     * Require a current tenant — throws if missing.
     */
    requireCurrentTenant(): Tenant {
      const tenant = this.getCurrentTenant();
      if (!tenant) throw new TenantContextMissingError();
      return tenant;
    },

    /**
     * Check if running in system mode.
     */
    isSystemMode(): boolean {
      const ctx = storage.get();
      return ctx?.mode === "system";
    },

    /**
     * Run a callback within a tenant context.
     */
    run<T>(tenant: Tenant, callback: () => T): T {
      const context: TenantExecutionContext = {
        mode: "tenant",
        tenant,
        context: {
          tenantId: tenant.id,
          source: "manual",
          trust: "trusted",
          resolvedAt: new Date(),
          metadata: {},
        },
      };
      return storage.run(context, callback);
    },

    /**
     * Run a callback in system mode (no tenant).
     */
    runSystem<T>(callback: () => T): T {
      const context: SystemContext = { mode: "system" };
      return storage.run(context, callback);
    },

    /**
     * Run a callback with a specific tenant (for switching).
     */
    runAs<T>(tenant: Tenant, callback: () => T): T {
      return this.run(tenant, callback);
    },
  };
}
