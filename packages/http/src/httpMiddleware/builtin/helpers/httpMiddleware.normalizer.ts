/**
 * Middleware result normalizer for builtin middleware.
 *
 * @module httpMiddleware/builtin/helpers/normalizers
 */

import type {
  HttpRequestContext as RequestContext,
} from "../../../httpRequest/httpRequest.context.js";

import type {
  HttpResponseContext as ResponseContext,
} from "../../../httpResponse/httpResponse.context.js";

export function normalizeMiddlewareResult(
  result:
    | Response
    | RequestContext
    | ResponseContext
    | undefined,
  fallback?:
    | ResponseContext,
):
  | ResponseContext {
  if (
    result !==
      null &&
    typeof result ===
      "object" &&
    (
      "response" in
        result ||
      "status" in
        result ||
      "headers" in
        result
    )
  ) {
    return result as ResponseContext;
  }

  if (
    typeof result ===
      "object" &&
    result !==
      null &&
    typeof Response !==
      "undefined" &&
    (result as object) instanceof
      Response
  ) {
    return {
      response:
        result as Response,
    } as unknown as ResponseContext;
  }

  if (
    result !==
      null &&
    typeof result ===
      "object" &&
    (
      "request" in
        result ||
      "method" in
        result ||
      "url" in
        result
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

  throw new Error(
    "Middleware completed without producing a response context.",
  );
}
