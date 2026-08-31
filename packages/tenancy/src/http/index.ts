/**
 * HTTP middleware adapter barrel.
 *
 * @module http
 */

export type { HttpMiddleware, HttpMiddlewareContext } from "./httpTypes.js";

export type {
  ResolveTenantMiddlewareOptions,
  RequireTenantMiddlewareOptions,
} from "./tenancyMiddleware.core.js";
export {
  TENANT_STATE_KEY,
  TENANT_CONTEXT_STATE_KEY,
  createResolveTenantMiddleware,
  createRequireTenantMiddleware,
} from "./tenancyMiddleware.core.js";

export type { TenantGuardMiddlewareOptions } from "./tenancyMiddleware.guard.js";
export {
  createTenantGuardMiddleware,
  createTenantPropagationMiddleware,
} from "./tenancyMiddleware.guard.js";

export { createForbidden, createNotFound } from "./httpHelpers.js";
