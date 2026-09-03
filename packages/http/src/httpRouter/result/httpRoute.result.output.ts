/**
 * Zudo HTTP route result output methods.
 *
 * Extends HttpRouteResult with serialization methods via prototype.
 */

import { HttpRouteResult } from "./httpRoute.result.class.js";

import { serializeBody } from "./httpRoute.result.serialize.js";

import { isJsonSerializable } from "./httpRoute.result.serialize.js";

import type { RouteResultOptions } from "./httpRoute.result.type.js";

/* -------------------------------------------------------------------------- */
/* Serialization Methods                                                      */
/* -------------------------------------------------------------------------- */

HttpRouteResult.prototype.toResponse = function (
  options: RouteResultOptions = {},
): Response {
  const headers = new Headers(this.headers);

  if (this.contentType && !headers.has("content-type")) {
    headers.set("content-type", this.contentType);
  }

  const body = serializeBody(this.body, this.contentType);

  return new Response(body, {
    status: this.status,
    statusText: this.statusText,
    headers,
  });
};

HttpRouteResult.prototype.toJSON = function (): Record<string, unknown> {
  return {
    status: this.status,
    statusText: this.statusText,
    headers: this.headers,
    body: isJsonSerializable(this.body) ? this.body : undefined,
    contentType: this.contentType,
    metadata: this.metadata,
  };
};
