/**
 * Context creation helpers for builtin middleware.
 *
 * @module httpMiddleware/builtin/helpers/context
 */

import type {
  HttpMiddlewareContext,
  HttpMiddlewareState,
} from "../../httpMiddleware.type.js";

import type {
  HttpRequestContext as RequestContext,
} from "../../../httpRequest/httpRequest.context.js";

import type {
  HttpResponseContext as ResponseContext,
} from "../../../httpResponse/httpResponse.context.js";

import type { HttpMiddleware } from "../../httpMiddleware.type.js";

import {
  getContextSignal,
  createNeverAbortedSignal,
} from "./httpMiddleware.accessor.js";

export function createMiddlewareContext(
  request:
    | RequestContext,
  response:
    | ResponseContext,
  options:
    | {
        readonly state?:
          | HttpMiddlewareState;

        readonly signal?:
          | AbortSignal;

        readonly metadata?:
          | Readonly<
              Record<string, unknown>
            >;
      } = {},
):
  | HttpMiddlewareContext {
  const state =
    options.state ??
    new Map() as unknown as HttpMiddlewareState;

  const signal =
    options.signal ??
    getContextSignal(
      request,
    );

  return {
    request,
    response,
    state,
    signal:
      signal ??
      createNeverAbortedSignal(),
    metadata:
      Object.freeze({
        ...(options.metadata ??
          {}),
      }),
  };
}

export function isHttpMiddleware(
  value:
    | unknown,
):
  value is HttpMiddleware {
  return (
    typeof value ===
    "function"
  );
}
