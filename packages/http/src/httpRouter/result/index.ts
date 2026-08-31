/**
 * HTTP route results.
 */

export {
  HttpRouteResult,
  ok,
  created,
  noContent,
  redirect,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  tooManyRequests,
  internalServerError,
  accepted,
  methodNotAllowed,
  unprocessableEntity,
  notImplemented,
  serviceUnavailable,
  routeResult,
  response,
  normalizeRouteResult,
  resultFromContext,
  isRouteResult,
  isRouteResultInit,
  isRouteResultBody,
  DEFAULT_ROUTE_STATUS,
  DEFAULT_CONTENT_TYPE,
} from "./httpRoute.result.js";

export type {
  RouteResultBody,
  RouteResultValue,
  RouteResultInit,
  RouteResult,
  RouteResultContext,
  RouteResultOptions,
} from "./httpRoute.result.type.js";
