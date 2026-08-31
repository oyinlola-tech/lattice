/**
 * Built-in middleware for common concerns.
 *
 * @module middlewareUtils/middlewareUtils
 */

import type { Middleware, NamedMiddleware } from "../middlewareTypes/middlewareDefinition.type.js";

export interface LoggingContext {
  readonly requestId?: string;
  readonly path?: string;
  readonly method?: string;
}

/**
 * Create a logging middleware.
 *
 * Logs request start, completion, and errors.
 */
export function loggingMiddleware(
  logger?: (msg: string) => void,
): NamedMiddleware<LoggingContext> {
  const log = logger ?? console.log;
  return {
    name: "logging",
    handler: async (ctx, next) => {
      const start = performance.now();
      log(`[middleware] → ${ctx.method ?? "UNKNOWN"} ${ctx.path ?? "/"}`);
      try {
        await next();
        const ms = (performance.now() - start).toFixed(1);
        log(`[middleware] ✓ completed in ${ms}ms`);
      } catch (error) {
        const ms = (performance.now() - start).toFixed(1);
        log(`[middleware] ✗ failed in ${ms}ms: ${error}`);
        throw error;
      }
    },
  };
}

/**
 * Create an error-handling middleware.
 *
 * Catches errors and wraps them with context.
 */
export function errorMiddleware(
  onError?: (error: unknown, ctx: unknown) => void,
): NamedMiddleware<unknown> {
  return {
    name: "error-handler",
    priority: 0,
    handler: async (ctx, next) => {
      try {
        return await next();
      } catch (error) {
        onError?.(error, ctx);
        throw error;
      }
    },
  };
}

/**
 * Create a timeout middleware.
 *
 * Rejects if the pipeline takes too long.
 */
export function timeoutMiddleware<TContext>(
  timeoutMs: number,
): NamedMiddleware<TContext> {
  return {
    name: "timeout",
    handler: async (ctx, next) => {
      return Promise.race([
        next(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Middleware timeout after ${timeoutMs}ms`)), timeoutMs),
        ),
      ]);
    },
  };
}

/**
 * Create a rate-limiting middleware.
 *
 * Uses a sliding window counter per key.
 */
export function rateLimitMiddleware<TContext extends { readonly key?: string }>(
  maxRequests: number,
  windowMs: number,
): NamedMiddleware<TContext> {
  const counts = new Map<string, { count: number; resetAt: number }>();

  return {
    name: "rate-limit",
    handler: async (ctx, next) => {
      const key = ctx.key ?? "global";
      const now = Date.now();
      const entry = counts.get(key);

      if (!entry || now > entry.resetAt) {
        counts.set(key, { count: 1, resetAt: now + windowMs });
        return next();
      }

      if (entry.count >= maxRequests) {
        throw new Error(`Rate limit exceeded: ${maxRequests} requests per ${windowMs}ms`);
      }

      entry.count++;
      return next();
    },
  };
}
