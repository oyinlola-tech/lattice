/**
 * CORS middleware factory.
 *
 * @module httpMiddleware/builtin/cors
 */

import type {
  HttpMiddleware,
  HttpMiddlewareContext,
} from "../../httpMiddleware.type.js";

import type { HttpResponseContext as ResponseContext } from "../../../httpResponse/httpResponse.context.js";

export interface CorsMiddlewareOptions {
  readonly allowOrigin?: string | ((context: HttpMiddlewareContext) => string);

  readonly allowMethods?: string;

  readonly allowHeaders?: string;

  readonly exposeHeaders?: string;

  readonly credentials?: boolean;

  readonly maxAge?: number;
}

export function createCorsMiddleware(
  options: CorsMiddlewareOptions = {},
): HttpMiddleware {
  return async (context, next) => {
    const response = await next();

    const headers = new Headers(response.headers as Record<string, string>);

    const origin =
      typeof options.allowOrigin === "function"
        ? options.allowOrigin(context)
        : (options.allowOrigin ?? "*");

    headers.set("access-control-allow-origin", origin);

    if (options.allowMethods) {
      headers.set("access-control-allow-methods", options.allowMethods);
    }

    if (options.allowHeaders) {
      headers.set("access-control-allow-headers", options.allowHeaders);
    }

    if (options.exposeHeaders) {
      headers.set("access-control-expose-headers", options.exposeHeaders);
    }

    if (options.credentials) {
      headers.set("access-control-allow-credentials", "true");
    }

    if (options.maxAge !== undefined) {
      headers.set("access-control-max-age", String(options.maxAge));
    }

    return {
      ...response,
      headers,
    } as unknown as ResponseContext;
  };
}
