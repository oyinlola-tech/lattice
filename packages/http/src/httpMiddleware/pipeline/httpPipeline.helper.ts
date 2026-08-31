/**
 * Internal helper functions for the middleware pipeline.
 *
 * @module httpMiddleware/pipeline/helpers
 */

import type {
  HttpMiddlewareContext,
  RegisteredMiddleware,
} from "../httpMiddleware.type.js";

import type {
  HttpRequestContext as RequestContext,
} from "../../httpRequest/httpRequest.context.js";

import type {
  HttpResponseContext as ResponseContext,
} from "../../httpResponse/httpResponse.context.js";

import { HttpMiddlewareError } from "../httpMiddleware.error.js";

export async function nextResult(
  context:
    | HttpMiddlewareContext,
  dispatch:
    ((
        index:
          | number,
      ) =>
        Promise<
          ResponseContext
        >),
  index:
    | number,
):
  Promise<
    ResponseContext
  > {
  return dispatch(
    index + 1,
  );
}

export function normalizeResult(
  result:
    | void
    | Response
    | RequestContext
    | ResponseContext
    | undefined,
  fallback?:
    | ResponseContext,
):
  | ResponseContext {
  if (
    isResponseContext(
      result,
    )
  ) {
    return result;
  }

  if (
    typeof Response !==
      "undefined" &&
    result instanceof
      Response
  ) {
    return {
      response:
        result,
    } as unknown as ResponseContext;
  }

  if (
    isRequestContext(
      result,
    )
  ) {
    return (
      fallback ??
      ({
        request:
          result,
      } as unknown as ResponseContext)
    );
  }

  if (
    fallback
  ) {
    return fallback;
  }

  throw new HttpMiddlewareError(
    "Middleware completed without producing a response context.",
  );
}

export function isResponseContext(
  value:
    | unknown,
):
  value is ResponseContext {
  return (
    value !==
      null &&
    typeof value ===
      "object" &&
    (
      "response" in
        value ||
      "status" in
        value ||
      "headers" in
        value
    )
  );
}

export function isRequestContext(
  value:
    | unknown,
):
  value is RequestContext {
  return (
    value !==
      null &&
    typeof value ===
      "object" &&
    (
      "request" in
        value ||
      "method" in
        value ||
      "url" in
        value
    )
  );
}

export function isRegisteredMiddleware(
  value:
    | unknown,
):
  value is RegisteredMiddleware {
  return (
    typeof value ===
      "object" &&
    value !==
      null &&
    "middleware" in
      value &&
    "id" in
      value
  );
}

export function normalizePriority(
  priority?:
    | number,
):
  | number {
  if (
    priority ===
      undefined ||
    !Number.isFinite(
      priority,
    )
  ) {
    return 0;
  }

  return priority;
}

export function sanitizeName(
  name:
    | string,
):
  | string {
  return (
    name
      .trim()
      .replace(
        /[^a-zA-Z0-9_-]+/g,
        "-",
      ) ||
    "middleware"
  );
}


