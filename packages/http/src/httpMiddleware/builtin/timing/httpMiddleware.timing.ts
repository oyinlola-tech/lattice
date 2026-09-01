/**
 * Timing middleware factory.
 *
 * @module httpMiddleware/builtin/timing
 */

import type { HttpMiddleware } from "../../httpMiddleware.type.js";

import type { HttpResponseContext as ResponseContext } from "../../../httpResponse/httpResponse.context.js";

import { performanceNow } from "../helpers/index.js";

export function createTimingMiddleware(): HttpMiddleware {
  return async (context, next) => {
    const start = performanceNow();

    const response = await next();

    const duration = performanceNow() - start;

    const headers = new Headers(response.headers as Record<string, string>);

    headers.set("server-timing", `total;dur=${duration.toFixed(2)}`);

    headers.set("x-response-time", `${duration.toFixed(2)}ms`);

    return {
      ...response,
      headers,
    } as unknown as ResponseContext;
  };
}
