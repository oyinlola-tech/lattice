/**
 * Middleware conversion utilities.
 *
 * @module httpInterceptors/middleware
 */

import type { HttpInterceptorOptions } from "./httpInterceptor.type.js";

export interface HttpInterceptorMiddlewareContext {
  readonly request: unknown;
  readonly response?: unknown;
  readonly error?: unknown;
  readonly next: () => Promise<unknown>;
}

export type HttpInterceptorMiddleware<T = unknown> = (
  context: HttpInterceptorMiddlewareContext,
) => Promise<T>;

/**
 * Converts a middleware to a request interceptor.
 */
export function middlewareToRequestInterceptor<T>(
  middleware: HttpInterceptorMiddleware<T>,
  options: HttpInterceptorOptions = {},
) {
  return {
    phase: "request" as const,
    priority: options.priority ?? "normal",
    name: options.name ?? "middleware-request",
    handler: async (request: unknown) => {
      const context: HttpInterceptorMiddlewareContext = {
        request,
        next: async () => request,
      };
      return middleware(context);
    },
  };
}

/**
 * Converts a middleware to a response interceptor.
 */
export function middlewareToResponseInterceptor<T>(
  middleware: HttpInterceptorMiddleware<T>,
  options: HttpInterceptorOptions = {},
) {
  return {
    phase: "response" as const,
    priority: options.priority ?? "normal",
    name: options.name ?? "middleware-response",
    handler: async (response: unknown) => {
      const context: HttpInterceptorMiddlewareContext = {
        request: null,
        response,
        next: async () => response,
      };
      return middleware(context);
    },
  };
}

/**
 * Converts a middleware to an error interceptor.
 */
export function middlewareToErrorInterceptor<T>(
  middleware: HttpInterceptorMiddleware<T>,
  options: HttpInterceptorOptions = {},
) {
  return {
    phase: "error" as const,
    priority: options.priority ?? "normal",
    name: options.name ?? "middleware-error",
    handler: async (error: unknown) => {
      const context: HttpInterceptorMiddlewareContext = {
        request: null,
        error,
        next: async () => {
          throw error;
        },
      };
      return middleware(context);
    },
  };
}
