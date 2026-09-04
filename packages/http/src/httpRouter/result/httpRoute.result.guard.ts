/**
 * Zudojs HTTP route result type guards.
 */

import { HttpRouteResult } from "./httpRoute.result.class.js";

import { isReadableStream } from "./httpRoute.result.util.js";

import type {
  RouteResultInit,
  RouteResultBody,
} from "./httpRoute.result.type.js";

/* -------------------------------------------------------------------------- */
/* Type Guards                                                                */
/* -------------------------------------------------------------------------- */

export function isRouteResult(value: unknown): value is HttpRouteResult {
  return value instanceof HttpRouteResult;
}

export function isRouteResultInit(value: unknown): value is RouteResultInit {
  if (!value || typeof value !== "object") {
    return false;
  }

  return (
    "status" in value ||
    "headers" in value ||
    "body" in value ||
    "contentType" in value
  );
}

export function isRouteResultBody(value: unknown): value is RouteResultBody {
  if (value === null || typeof value === "string") {
    return true;
  }

  if (value instanceof Uint8Array || value instanceof ArrayBuffer) {
    return true;
  }

  if (isReadableStream(value)) {
    return true;
  }

  return typeof value === "object" && value !== null;
}
