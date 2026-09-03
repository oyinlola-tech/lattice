/**
 * HTTP middleware adapter for @zudo/permissions.
 *
 * Requires @zudo/http as a peer dependency.
 *
 * @module http
 */

export {
  createActorMiddleware,
  createRequirePermissionMiddleware,
  authorize,
  createRequirePermissionsMiddleware,
  ACTOR_STATE_KEY,
  DECISION_STATE_KEY,
  type AuthorizeMiddlewareOptions,
  type RequirePermissionMiddlewareOptions,
} from "./httpMiddleware.core.js";

export {
  createForbiddenResponse,
  createJsonResponse,
  type DeniedResponseOptions,
} from "./httpHelpers.js";

export type {
  HttpMiddleware,
  HttpMiddlewareContext,
  HttpRequestContext,
  HttpResponseContext,
  HttpMiddlewareState,
} from "./httpTypes.js";
