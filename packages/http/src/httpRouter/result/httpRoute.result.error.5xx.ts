/**
 * Lattice HTTP route result 5xx error factory functions.
 */

import {
  HttpRouteResult,
} from "./httpRoute.result.class.js";

import type {
  RouteResultBody,
} from "./httpRoute.result.type.js";

/* -------------------------------------------------------------------------- */
/* 5xx Error Results                                                          */
/* -------------------------------------------------------------------------- */

export function internalServerError(
  body?:
    | RouteResultBody,
):
  | HttpRouteResult {
  return new HttpRouteResult({
    status:
      500,
    body:
      body ??
      {
        error:
          "Internal Server Error",
      },
  });
}

export function notImplemented(
  body?:
    | RouteResultBody,
):
  | HttpRouteResult {
  return new HttpRouteResult({
    status:
      501,
    body:
      body ??
      {
        error:
          "Not Implemented",
      },
  });
}

export function serviceUnavailable(
  body?:
    | RouteResultBody,
):
  | HttpRouteResult {
  return new HttpRouteResult({
    status:
      503,
    body:
      body ??
      {
        error:
          "Service Unavailable",
      },
  });
}
