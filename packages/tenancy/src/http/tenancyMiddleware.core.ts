/**
 * HTTP middleware adapter for @zudo/tenancy.
 *
 * Provides middleware factories that resolve and enforce tenant context.
 *
 * @module http/tenancyMiddleware
 *
 * Requires @zudo/http as a peer dependency.
 */

import type { TenantId } from "../tenancyTypes/tenantIdentity.js";
import type {
  Tenant,
  TenantContext,
  TenantRequirement,
} from "../tenancyTypes/tenantInterface.js";
import type {
  TenantResolver,
  TenantResolution,
} from "../tenancyTypes/resolverTypes.js";
import type { TenantRepository } from "../tenancyTypes/repositoryTypes.js";
import type { TenantContextStorage } from "../context/contextStorage.core.js";
import type { HttpMiddleware } from "./httpTypes.js";
import { createForbidden } from "./httpHelpers.js";

// ─── State Keys ───────────────────────────────────────────────────────────

/** State key for the resolved tenant. */
export const TENANT_STATE_KEY = "tenancy:tenant";

/** State key for the tenant context. */
export const TENANT_CONTEXT_STATE_KEY = "tenancy:context";

// ─── Options ──────────────────────────────────────────────────────────────

/** Options for the resolve tenant middleware. */
export interface ResolveTenantMiddlewareOptions {
  /** Resolver chain or single resolver to determine tenant. */
  readonly resolver: TenantResolver;
  /** Repository to load the full tenant after resolution. */
  readonly repository: TenantRepository;
  /** Tenant context storage for propagation. */
  readonly storage: TenantContextStorage;
  /** Custom error response for missing tenant. */
  readonly notFoundResponse?: (
    resolution: TenantResolution | undefined,
  ) => unknown;
}

/** Options for the require tenant middleware. */
export interface RequireTenantMiddlewareOptions {
  /** Requirement level. */
  readonly requirement?: TenantRequirement;
  /** Custom error response. */
  readonly deniedResponse?: (tenant: Tenant | undefined) => unknown;
}

// ─── Middleware Factories ──────────────────────────────────────────────────

/**
 * Create middleware that resolves the tenant from the request
 * and creates a tenant context.
 */
export function createResolveTenantMiddleware(
  options: ResolveTenantMiddlewareOptions,
): HttpMiddleware {
  return async (context, next) => {
    const resolution = await options.resolver.resolve(context);

    if (!resolution) {
      const body = options.notFoundResponse?.(resolution) ?? {
        error: "Tenant not found",
      };
      return {
        status: 404,
        body,
        headers: { "content-type": "application/json" },
      };
    }

    const tenant = await options.repository.findById(resolution.tenantId);
    if (!tenant) {
      const body = options.notFoundResponse?.(resolution) ?? {
        error: `Tenant "${resolution.tenantId}" not found`,
      };
      return {
        status: 404,
        body,
        headers: { "content-type": "application/json" },
      };
    }

    const tenantContext: TenantContext = {
      tenantId: tenant.id,
      source: resolution.source,
      trust: resolution.trust,
      resolvedAt: new Date(),
      metadata: resolution.metadata ?? {},
    };

    context.state.set(TENANT_STATE_KEY, tenant);
    context.state.set(TENANT_CONTEXT_STATE_KEY, tenantContext);

    return options.storage.run(
      {
        mode: "tenant",
        tenant,
        context: tenantContext,
      },
      () => next(),
    );
  };
}

/**
 * Create middleware that enforces tenant presence.
 *
 * Must run after `createResolveTenantMiddleware`.
 */
export function createRequireTenantMiddleware(
  options?: RequireTenantMiddlewareOptions,
): HttpMiddleware {
  const requirement = options?.requirement ?? "required";

  return async (context, next) => {
    if (requirement === "forbidden") {
      const tenant = context.state.get<Tenant>(TENANT_STATE_KEY);
      if (tenant) {
        return createForbidden("Tenant context is not allowed for this route");
      }
      return next();
    }

    if (requirement === "optional") {
      return next();
    }

    const tenant = context.state.get<Tenant>(TENANT_STATE_KEY);
    if (!tenant) {
      const body = options?.deniedResponse?.(undefined) ?? {
        error: "Tenant context is required",
      };
      return {
        status: 401,
        body,
        headers: { "content-type": "application/json" },
      };
    }

    return next();
  };
}
