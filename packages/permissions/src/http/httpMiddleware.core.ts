/**
 * HTTP middleware adapter for @oyinlola141/lattice-permissions.
 *
 * Provides middleware factories that integrate the authorization engine
 * with @oyinlola141/lattice-http's middleware pipeline.
 *
 * @module http/httpMiddleware
 */

import type {
  PermissionActor,
  PermissionDecision,
  AuthorizationOptions,
} from "../permissionTypes/index.js";
import type { PermissionEngine } from "../evaluator/authorizationEngine.js";
import type { HttpMiddleware, HttpMiddlewareContext } from "./httpTypes.js";
import { createForbiddenResponse, createJsonResponse } from "./httpHelpers.js";

// ─── Options ──────────────────────────────────────────────────────────────

/** Options for the authorize middleware. */
export interface AuthorizeMiddlewareOptions {
  /** Function to extract an actor from the request context. */
  readonly extractActor: (
    context: HttpMiddlewareContext,
  ) => PermissionActor | Promise<PermissionActor> | undefined;
  /** Authorization options (signal, policyTimeout). */
  readonly authorization?: AuthorizationOptions;
  /** Custom 403 response body. */
  readonly deniedResponse?: (decision: PermissionDecision) => unknown;
}

/** Options for the requirePermission middleware. */
export interface RequirePermissionMiddlewareOptions extends AuthorizeMiddlewareOptions {
  /** The permission to check (e.g. "post:update"). */
  readonly permission: string;
  /** Function to extract the resource from the request (optional). */
  readonly extractResource?: (context: HttpMiddlewareContext) => unknown;
}

// ─── State Keys ───────────────────────────────────────────────────────────

/** State key for the current actor. */
export const ACTOR_STATE_KEY = "permissions:actor";

/** State key for the authorization decision. */
export const DECISION_STATE_KEY = "permissions:decision";

// ─── Middleware Factories ──────────────────────────────────────────────────

/**
 * Create middleware that extracts the actor from the request and stores it in state.
 */
export function createActorMiddleware(
  options: AuthorizeMiddlewareOptions,
): HttpMiddleware {
  return async (context, next) => {
    const actor = await options.extractActor(context);
    if (actor) {
      context.state.set(ACTOR_STATE_KEY, actor);
    }
    return next();
  };
}

/**
 * Create middleware that checks a permission and returns 403 if denied.
 */
export function createRequirePermissionMiddleware(
  engine: PermissionEngine,
  options: RequirePermissionMiddlewareOptions,
): HttpMiddleware {
  return async (context, next) => {
    const actor = context.state.get<PermissionActor>(ACTOR_STATE_KEY);
    if (!actor) {
      return createForbiddenResponse(
        "No actor found in request context",
        options,
      );
    }
    const resource = options.extractResource?.(context);
    const decision = await engine.check(
      actor,
      options.permission,
      resource,
      options.authorization,
    );
    context.state.set(DECISION_STATE_KEY, decision);
    if (!decision.allowed) {
      return createForbiddenResponse(
        decision.reason ?? "Access denied",
        options,
      );
    }
    return next();
  };
}

/**
 * Create middleware that checks a permission and short-circuits on denial.
 */
export function authorize(
  engine: PermissionEngine,
  permission: string,
  options: Omit<RequirePermissionMiddlewareOptions, "permission">,
): HttpMiddleware {
  return createRequirePermissionMiddleware(engine, {
    permission,
    extractActor: options.extractActor,
    authorization: options.authorization,
    deniedResponse: options.deniedResponse,
    extractResource: options.extractResource,
  });
}

/**
 * Create middleware that checks multiple permissions in batch.
 */
export function createRequirePermissionsMiddleware(
  engine: PermissionEngine,
  permissions: readonly string[],
  options: AuthorizeMiddlewareOptions,
): HttpMiddleware {
  return async (context, next) => {
    const actor = context.state.get<PermissionActor>(ACTOR_STATE_KEY);
    if (!actor) {
      return createForbiddenResponse(
        "No actor found in request context",
        options,
      );
    }
    const results = new Map<string, PermissionDecision>();
    for (const perm of permissions) {
      const decision = await engine.check(
        actor,
        perm,
        undefined,
        options.authorization,
      );
      results.set(perm, decision);
    }
    context.state.set("permissions:decisions", results);
    for (const [perm, decision] of results) {
      if (!decision.allowed) {
        return createForbiddenResponse(
          decision.reason ?? `Missing permission: ${perm}`,
          options,
        );
      }
    }
    return next();
  };
}
