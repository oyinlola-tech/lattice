/**
 * Middleware pipeline with execution tracking and result reporting.
 *
 * @module middlewarePipeline/middlewarePipeline
 */

import type {
  Middleware,
  NamedMiddleware,
} from "../middlewareTypes/middlewareDefinition.type.js";
import type {
  PipelineResult,
  PipelineOptions,
} from "../middlewareTypes/middlewareContext.type.js";
import { resolveMiddleware } from "../middlewareCore/middlewareCore.compose.js";

const DEFAULT_MAX = 50;

/**
 * Create a middleware pipeline that tracks execution.
 *
 * @param middlewareList - Named middleware to include
 * @param handler - Final handler function
 * @param options - Pipeline configuration
 * @returns Pipeline execution function
 */
export function createPipeline<TContext, TResult>(
  middlewareList: readonly NamedMiddleware<TContext, TResult>[],
  handler: (context: TContext) => Promise<TResult>,
  options?: PipelineOptions,
): (context: TContext) => Promise<PipelineResult<TResult>> {
  const resolved = resolveMiddleware(middlewareList);
  const maxMiddleware = options?.maxMiddleware ?? DEFAULT_MAX;
  const stopOnError = options?.stopOnError ?? true;

  if (resolved.length > maxMiddleware) {
    throw new Error(
      `Pipeline has ${resolved.length} middleware, exceeding maximum of ${maxMiddleware}`,
    );
  }

  const enabledNames = middlewareList
    .filter((mw) => mw.enabled !== false)
    .sort((a, b) => (a.priority ?? 100) - (b.priority ?? 100))
    .map((mw) => mw.name);

  return async (context: TContext): Promise<PipelineResult<TResult>> => {
    const startTime = performance.now();
    const executed: string[] = [];
    let index = -1;

    async function dispatch(i: number): Promise<TResult> {
      if (i <= index) {
        throw new Error("next() called multiple times");
      }
      index = i;

      if (i < resolved.length) {
        executed.push(enabledNames[i] ?? `middleware-${i}`);
        const mw = resolved[i]!;
        return mw(context, () => dispatch(i + 1));
      }
      return handler(context);
    }

    try {
      const result = await dispatch(0);
      return {
        success: true,
        result,
        durationMs: performance.now() - startTime,
        executedMiddleware: executed,
      };
    } catch (error) {
      if (stopOnError) {
        return {
          success: false,
          error,
          durationMs: performance.now() - startTime,
          executedMiddleware: executed,
        };
      }
      throw error;
    }
  };
}
