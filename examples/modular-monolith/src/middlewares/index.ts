import type { Logger } from "@lattice/logger";

export interface MiddlewareContext {
  readonly method: string;
  readonly path: string;
  readonly requestId: string;
  readonly startTime: number;
}

export type NextFunction = () => Promise<void>;
export type Middleware = (ctx: MiddlewareContext & { logger?: Logger }, next: NextFunction) => Promise<void>;

export function createLoggingMiddleware(logger: Logger): Middleware {
  return async (ctx, next) => {
    logger.info(`${ctx.method} ${ctx.path}`, { requestId: ctx.requestId });
    await next();
    const duration = Date.now() - ctx.startTime;
    logger.info(`${ctx.method} ${ctx.path} completed`, { requestId: ctx.requestId, duration });
  };
}

export function createErrorMiddleware(logger: Logger): Middleware {
  return async (ctx, next) => {
    try {
      await next();
    } catch (error) {
      const err = error as Error;
      logger.error(`${ctx.method} ${ctx.path} failed`, {
        requestId: ctx.requestId,
        error: err.message,
        stack: err.stack,
      });
      throw error;
    }
  };
}

export function createRequestIdMiddleware(): Middleware {
  return async (ctx, next) => {
    (ctx as any).requestId = `req:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;
    await next();
  };
}
