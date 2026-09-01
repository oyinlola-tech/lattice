/**
 * Compose multiple middleware functions into a single handler.
 *
 * @module middlewareCore/middlewareCore
 *
 * Middleware executes in order (first added = first executed).
 * Each middleware calls `next()` to proceed to the next one.
 */

import type {
  Middleware,
  NamedMiddleware,
} from "../middlewareTypes/middlewareDefinition.type.js";

const MAX_DEPTH = 100;

/**
 * Compose an array of middleware into a single function.
 *
 * The returned function executes middleware in order.
 * If no middleware is provided, the handler is called directly.
 *
 * @param middlewareList - Array of middleware functions
 * @param handler - The final handler to execute after all middleware
 * @returns Composed function
 */
export function compose<TContext, TResult>(
  middlewareList: readonly Middleware<TContext, TResult>[],
  handler: (context: TContext) => Promise<TResult>,
): (context: TContext) => Promise<TResult> {
  if (middlewareList.length === 0) {
    return handler;
  }

  return async (context: TContext): Promise<TResult> => {
    let index = -1;

    async function dispatch(i: number): Promise<TResult> {
      if (i <= index) {
        throw new Error("next() called multiple times");
      }
      index = i;

      if (i < middlewareList.length) {
        const mw = middlewareList[i]!;
        return mw(context, () => dispatch(i + 1));
      }
      return handler(context);
    }

    return dispatch(0);
  };
}

/**
 * Sort and filter named middleware by priority.
 *
 * @param middlewareList - Array of named middleware
 * @returns Sorted and filtered array of middleware handler functions
 */
export function resolveMiddleware<TContext, TResult>(
  middlewareList: readonly NamedMiddleware<TContext, TResult>[],
): Middleware<TContext, TResult>[] {
  return middlewareList
    .filter((mw) => mw.enabled !== false)
    .sort((a, b) => (a.priority ?? 100) - (b.priority ?? 100))
    .map((mw) => mw.handler);
}

/**
 * Create a middleware that wraps another with timing.
 */
export function withTiming<TContext>(
  name: string,
  middleware: Middleware<TContext, void>,
): NamedMiddleware<TContext, void> {
  return {
    name,
    handler: async (ctx, next) => {
      const start = performance.now();
      await middleware(ctx, next);
      const duration = performance.now() - start;
      if (duration > 100) {
        console.warn(`[middleware] ${name} took ${duration.toFixed(1)}ms`);
      }
    },
  };
}
