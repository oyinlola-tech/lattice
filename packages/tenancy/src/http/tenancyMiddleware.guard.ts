/**
 * Tenant guard and propagation middleware.
 *
 * @module http/tenancyMiddleware.guard
 */

import type { Tenant, TenantContext } from "../tenancyTypes/tenantInterface.js";
import type { TenantRepository } from "../tenancyTypes/repositoryTypes.js";
import type { TenantContextStorage } from "../context/contextStorage.core.js";
import type { HttpMiddleware } from "./httpTypes.js";
import { createForbidden } from "./httpHelpers.js";
import {
  TENANT_STATE_KEY,
  TENANT_CONTEXT_STATE_KEY,
} from "./tenancyMiddleware.core.js";

// ─── Options ──────────────────────────────────────────────────────────────

/** Options for the tenant guard middleware. */
export interface TenantGuardMiddlewareOptions {
  /** Tenant context storage. */
  readonly storage: TenantContextStorage;
  /** Repository to validate the tenant. */
  readonly repository: TenantRepository;
}

// ─── Middleware Factories ──────────────────────────────────────────────────

/**
 * Create middleware that validates tenant status.
 *
 * Ensures the resolved tenant is active before proceeding.
 */
export function createTenantGuardMiddleware(
  options: TenantGuardMiddlewareOptions,
): HttpMiddleware {
  return async (context, next) => {
    const tenant = context.state.get<Tenant>(TENANT_STATE_KEY);
    if (!tenant) return next();

    if (tenant.status !== "active") {
      return createForbidden(
        `Tenant "${tenant.id}" is not available (status: ${tenant.status})`,
      );
    }

    return next();
  };
}

/**
 * Create middleware that propagates tenant context from state
 * into AsyncLocalStorage for downstream handlers.
 */
export function createTenantPropagationMiddleware(
  storage: TenantContextStorage,
): HttpMiddleware {
  return async (context, next) => {
    const tenant = context.state.get<Tenant>(TENANT_STATE_KEY);
    const tenantCtx = context.state.get<TenantContext>(
      TENANT_CONTEXT_STATE_KEY,
    );

    if (tenant && tenantCtx) {
      return storage.run(
        {
          mode: "tenant",
          tenant,
          context: tenantCtx,
        },
        () => next(),
      );
    }

    return next();
  };
}
