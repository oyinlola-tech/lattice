/**
 * Lattice HTTP route result.
 *
 * Normalizes the different values a route handler may return into a
 * predictable HTTP response description.
 *
 * This file re-exports the public API from the split modules.
 */

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type {
  RouteResultBody,
  RouteResultValue,
  RouteResultInit,
  RouteResult,
  RouteResultContext,
  RouteResultOptions,
} from "./httpRoute.result.type.js";

export {
  DEFAULT_ROUTE_STATUS,
  DEFAULT_CONTENT_TYPE,
} from "./httpRoute.result.type.js";

/* -------------------------------------------------------------------------- */
/* Class                                                                      */
/* -------------------------------------------------------------------------- */

export { HttpRouteResult } from "./httpRoute.result.class.js";

/* -------------------------------------------------------------------------- */
/* Factory Functions                                                          */
/* -------------------------------------------------------------------------- */

export {
  routeResult,
  response,
  ok,
  created,
  accepted,
  noContent,
  redirect,
} from "./httpRoute.result.factory.js";

/* -------------------------------------------------------------------------- */
/* Error Results                                                              */
/* -------------------------------------------------------------------------- */

export {
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  methodNotAllowed,
  conflict,
  unprocessableEntity,
  tooManyRequests,
} from "./httpRoute.result.error.4xx.js";

export {
  internalServerError,
  notImplemented,
  serviceUnavailable,
} from "./httpRoute.result.error.5xx.js";

/* -------------------------------------------------------------------------- */
/* Normalization                                                              */
/* -------------------------------------------------------------------------- */

export {
  normalizeRouteResult,
  resultFromContext,
} from "./httpRoute.result.normalize.js";

/* -------------------------------------------------------------------------- */
/* Type Guards                                                                */
/* -------------------------------------------------------------------------- */

export {
  isRouteResult,
  isRouteResultInit,
  isRouteResultBody,
} from "./httpRoute.result.guard.js";
