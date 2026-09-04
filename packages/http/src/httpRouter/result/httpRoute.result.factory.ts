/**
 * Zudojs HTTP route result factory functions.
 */

import { HttpRouteResult } from "./httpRoute.result.class.js";

import type {
  RouteResultBody,
  RouteResultInit,
} from "./httpRoute.result.type.js";

/* -------------------------------------------------------------------------- */
/* Factory Functions                                                          */
/* -------------------------------------------------------------------------- */

export function routeResult(init: RouteResultInit = {}): HttpRouteResult {
  return new HttpRouteResult(init);
}

export function response(
  body?: RouteResultBody,
  init: Omit<RouteResultInit, "body"> = {},
): HttpRouteResult {
  return new HttpRouteResult({
    ...init,
    body: body ?? null,
  });
}

export function ok(
  body?: RouteResultBody,
  init: Omit<RouteResultInit, "body" | "status"> = {},
): HttpRouteResult {
  return new HttpRouteResult({
    ...init,
    status: 200,
    body: body ?? null,
  });
}

export function created(
  body?: RouteResultBody,
  init: Omit<RouteResultInit, "body" | "status"> = {},
): HttpRouteResult {
  return new HttpRouteResult({
    ...init,
    status: 201,
    body: body ?? null,
  });
}

export function accepted(
  body?: RouteResultBody,
  init: Omit<RouteResultInit, "body" | "status"> = {},
): HttpRouteResult {
  return new HttpRouteResult({
    ...init,
    status: 202,
    body: body ?? null,
  });
}

export function noContent(
  init: Omit<RouteResultInit, "body" | "status"> = {},
): HttpRouteResult {
  return new HttpRouteResult({
    ...init,
    status: 204,
    body: null,
  });
}

export function redirect(
  location: string,
  status: number = 302,
): HttpRouteResult {
  return new HttpRouteResult({
    status,
    headers: {
      Location: location,
    },
    body: null,
  });
}
