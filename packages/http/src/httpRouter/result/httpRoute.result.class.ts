/**
 * Lattice HTTP route result class.
 */

import type {
  RouteResultInit,
  RouteResultBody,
  RouteResultOptions,
} from "./httpRoute.result.type.js";

import { DEFAULT_ROUTE_STATUS } from "./httpRoute.result.type.js";

import {
  validateStatus,
  normalizeHeaders,
  getHeader,
} from "./httpRoute.result.util.js";

/* -------------------------------------------------------------------------- */
/* Route Result Class                                                         */
/* -------------------------------------------------------------------------- */

export class HttpRouteResult {
  readonly status: number;
  readonly statusText: string | undefined;
  readonly headers: Readonly<Record<string, string>>;
  readonly body: RouteResultBody;
  readonly contentType: string | undefined;
  readonly metadata: Readonly<Record<string, unknown>>;

  constructor(init: RouteResultInit = {}) {
    const status = init.status ?? DEFAULT_ROUTE_STATUS;
    validateStatus(status);
    const headers = normalizeHeaders(init.headers);
    const contentType = init.contentType ?? getHeader(headers, "content-type");
    this.status = status;
    this.statusText = init.statusText;
    this.headers = Object.freeze({
      ...headers,
    });
    this.body = init.body ?? null;
    this.contentType = contentType;
    this.metadata = Object.freeze({
      ...(init.metadata ?? {}),
    });
  }

  /* ---------------------------------------------------------------------- */
  /* Builder Methods (implemented via prototype in builder module)           */
  /* ---------------------------------------------------------------------- */

  declare withHeader: (name: string, value: string) => HttpRouteResult;
  declare withHeaders: (headers: HeadersInit) => HttpRouteResult;
  declare withBody: (body: RouteResultBody) => HttpRouteResult;
  declare withStatus: (status: number, statusText?: string) => HttpRouteResult;
  declare withMetadata: (
    metadata: Readonly<Record<string, unknown>>,
  ) => HttpRouteResult;

  /* ---------------------------------------------------------------------- */
  /* Serialization (implemented via prototype in output module)              */
  /* ---------------------------------------------------------------------- */

  declare toResponse: (options?: RouteResultOptions) => Response;
  declare toJSON: () => Record<string, unknown>;
}
