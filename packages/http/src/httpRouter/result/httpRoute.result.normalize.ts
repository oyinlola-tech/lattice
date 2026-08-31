/**
 * Lattice HTTP route result normalization.
 */

import {
  HttpRouteResult,
} from "./httpRoute.result.class.js";

import {
  isReadableStream,
} from "./httpRoute.result.util.js";

import {
  valueToJsonObject,
} from "./httpRoute.result.serialize.js";

import {
  DEFAULT_CONTENT_TYPE,
} from "./httpRoute.result.type.js";

import type {
  RouteResultValue,
  RouteResultOptions,
  RouteResultContext,
} from "./httpRoute.result.type.js";

/* -------------------------------------------------------------------------- */
/* Handler Result Normalization                                               */
/* -------------------------------------------------------------------------- */

export function normalizeRouteResult(
  value:
    | RouteResultValue,
  options:
    | RouteResultOptions = {},
):
  | HttpRouteResult {
  if (
    value instanceof HttpRouteResult
  ) {
    return value;
  }

  if (
    value === undefined ||
    value === null
  ) {
    return new HttpRouteResult({
      status:
        options.defaultStatus ?? 204,
      body: null,
    });
  }

  if (
    typeof value === "string"
  ) {
    return new HttpRouteResult({
      status:
        options.defaultStatus ?? 200,
      contentType:
        "text/plain; charset=utf-8",
      body: value,
    });
  }

  if (
    typeof value === "number" ||
    typeof value === "boolean" ||
    typeof value === "bigint"
  ) {
    return new HttpRouteResult({
      status:
        options.defaultStatus ?? 200,
      contentType:
        options.defaultContentType ??
        DEFAULT_CONTENT_TYPE,
      body:
        valueToJsonObject(value),
    });
  }

  if (
    value instanceof Uint8Array
  ) {
    return new HttpRouteResult({
      status:
        options.defaultStatus ?? 200,
      body: value,
      contentType:
        "application/octet-stream",
    });
  }

  if (
    value instanceof ArrayBuffer
  ) {
    return new HttpRouteResult({
      status:
        options.defaultStatus ?? 200,
      body:
        new Uint8Array(value),
      contentType:
        "application/octet-stream",
    });
  }

  if (
    isReadableStream(value)
  ) {
    return new HttpRouteResult({
      status:
        options.defaultStatus ?? 200,
      body: value,
    });
  }

  return new HttpRouteResult({
    status:
      options.defaultStatus ?? 200,
    contentType:
      options.defaultContentType ??
      DEFAULT_CONTENT_TYPE,
    body:
      value as Record<string, unknown>,
  });
}

/* -------------------------------------------------------------------------- */
/* Context Helpers                                                            */
/* -------------------------------------------------------------------------- */

export function resultFromContext(
  context:
    | RouteResultContext,
  value:
    | RouteResultValue,
):
  | HttpRouteResult {
  const result =
    normalizeRouteResult(value);

  if (
    context.method === "HEAD"
  ) {
    return result.withBody(null);
  }

  return result;
}
