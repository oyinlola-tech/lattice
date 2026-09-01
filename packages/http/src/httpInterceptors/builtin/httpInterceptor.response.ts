/**
 * Response interceptors.
 *
 * @module httpInterceptors/builtin/response
 */

import type { HttpInterceptorOptions } from "../httpInterceptor.type.js";

export interface ResponseHeaderInterceptorOptions extends HttpInterceptorOptions {
  readonly headers: Record<string, string>;
  readonly override?: boolean;
}

export function createResponseHeaderInterceptor(
  options: ResponseHeaderInterceptorOptions,
) {
  return {
    phase: "response" as const,
    priority: options.priority ?? "normal",
    name: options.name ?? "response-headers",
    handler: (response: {
      readonly headers: Record<string, string | undefined>;
    }) => {
      const headers = { ...response.headers };

      if (options.override) {
        Object.assign(headers, options.headers);
      } else {
        for (const [key, value] of Object.entries(options.headers)) {
          if (!headers[key]) {
            headers[key] = value;
          }
        }
      }

      return {
        ...response,
        headers,
      };
    },
  };
}

export function createStatusErrorInterceptor(
  options: HttpInterceptorOptions = {},
) {
  return {
    phase: "response" as const,
    priority: options.priority ?? "normal",
    name: options.name ?? "status-error",
    handler: (response: { readonly status: number }) => {
      if (response.status >= 400) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      return response;
    },
  };
}
