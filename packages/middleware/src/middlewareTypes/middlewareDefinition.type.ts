/**
 * Core middleware type definitions.
 *
 * @module middlewareTypes/middlewareDefinition
 */

/**
 * A middleware function that processes a context and calls the next middleware.
 *
 * @typeParam TContext - The context type flowing through the pipeline
 * @typeParam TResult - The result type returned by the pipeline
 */
export type Middleware<TContext, TResult = void> = (
  context: TContext,
  next: () => Promise<TResult>,
) => Promise<TResult>;

/**
 * A middleware function with metadata.
 */
export interface NamedMiddleware<TContext, TResult = void> {
  /** Human-readable name for debugging */
  readonly name: string;
  /** The middleware function */
  readonly handler: Middleware<TContext, TResult>;
  /** Execution priority (lower = earlier). Default: 100 */
  readonly priority?: number;
  /** Whether this middleware is enabled */
  readonly enabled?: boolean;
}

/**
 * Middleware factory function.
 */
export type MiddlewareFactory<TContext, TResult = void> = (
  options?: Record<string, unknown>,
) => NamedMiddleware<TContext, TResult>;
