/**
 * Zudo HTTP route result builder methods.
 *
 * Extends HttpRouteResult with immutable builder methods via prototype.
 */

import { HttpRouteResult } from "./httpRoute.result.class.js";

import { normalizeHeaders } from "./httpRoute.result.util.js";

import type { RouteResultBody } from "./httpRoute.result.type.js";

/* -------------------------------------------------------------------------- */
/* Builder Methods                                                            */
/* -------------------------------------------------------------------------- */

HttpRouteResult.prototype.withHeader = function (
  name: string,
  value: string,
): HttpRouteResult {
  return new HttpRouteResult({
    status: this.status,
    statusText: this.statusText,
    headers: {
      ...this.headers,
      [name]: value,
    },
    body: this.body,
    contentType: this.contentType,
    metadata: this.metadata,
  });
};

HttpRouteResult.prototype.withHeaders = function (
  headers: HeadersInit,
): HttpRouteResult {
  return new HttpRouteResult({
    status: this.status,
    statusText: this.statusText,
    headers: {
      ...this.headers,
      ...normalizeHeaders(headers),
    },
    body: this.body,
    contentType: this.contentType,
    metadata: this.metadata,
  });
};

HttpRouteResult.prototype.withBody = function (
  body: RouteResultBody,
): HttpRouteResult {
  return new HttpRouteResult({
    status: this.status,
    statusText: this.statusText,
    headers: this.headers,
    body,
    contentType: this.contentType,
    metadata: this.metadata,
  });
};

HttpRouteResult.prototype.withStatus = function (
  status: number,
  statusText?: string,
): HttpRouteResult {
  return new HttpRouteResult({
    status,
    statusText: statusText ?? this.statusText,
    headers: this.headers,
    body: this.body,
    contentType: this.contentType,
    metadata: this.metadata,
  });
};

HttpRouteResult.prototype.withMetadata = function (
  metadata: Readonly<Record<string, unknown>>,
): HttpRouteResult {
  return new HttpRouteResult({
    status: this.status,
    statusText: this.statusText,
    headers: this.headers,
    body: this.body,
    contentType: this.contentType,
    metadata: {
      ...this.metadata,
      ...metadata,
    },
  });
};
