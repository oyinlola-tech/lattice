import type { JobResult } from "../jobResult/jobResult.type.js";

import type { QueueMiddleware } from "./middleware.type.js";

import { JobTimeoutError } from "@oyinlola141/lattice-errors";

/**
 * Creates a middleware chain from an array of middleware.
 */
export function createMiddlewareChain(
  middleware: QueueMiddleware[],
): QueueMiddleware {
  return async (ctx) => {
    let index = -1;

    const dispatch = async (): Promise<JobResult | void> => {
      index++;
      if (index < middleware.length) {
        const current = middleware[index]!;
        return current({
          ...ctx,
          next: dispatch,
        });
      }
      return ctx.next();
    };

    return dispatch();
  };
}

/**
 * Logging middleware for queue processing.
 */
export function createLoggingMiddleware(logger?: {
  info: (message: string, data?: Record<string, unknown>) => void;
}): QueueMiddleware {
  return async (ctx) => {
    const startTime = Date.now();

    logger?.info("Job processing started", {
      jobId: ctx.job.id,
      jobName: ctx.job.name,
      queueName: ctx.job.queueName,
      attempt: ctx.job.attempt,
    });

    try {
      const result = await ctx.next();
      const duration = Date.now() - startTime;

      logger?.info("Job processing completed", {
        jobId: ctx.job.id,
        jobName: ctx.job.name,
        queueName: ctx.job.queueName,
        duration,
        success: result?.success ?? true,
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      logger?.info("Job processing failed", {
        jobId: ctx.job.id,
        jobName: ctx.job.name,
        queueName: ctx.job.queueName,
        duration,
        error: error instanceof Error ? error.message : String(error),
      });

      throw error;
    }
  };
}

/**
 * Timeout middleware for queue processing.
 */
export function createTimeoutMiddleware(timeoutMs: number): QueueMiddleware {
  return async (ctx) => {
    return Promise.race([
      ctx.next(),
      new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(
            new JobTimeoutError(ctx.job.id, timeoutMs, {
              queueName: ctx.job.queueName,
            }),
          );
        }, timeoutMs);
      }),
    ]);
  };
}
