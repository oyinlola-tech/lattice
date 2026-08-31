/**
 * Middleware context and pipeline result types.
 *
 * @module middlewareTypes/middlewareContext
 */

/**
 * Result of executing a middleware pipeline.
 */
export interface PipelineResult<TResult> {
  /** Whether the pipeline completed successfully */
  readonly success: boolean;
  /** The result value (if successful) */
  readonly result?: TResult;
  /** Error that occurred (if failed) */
  readonly error?: unknown;
  /** Execution time in milliseconds */
  readonly durationMs: number;
  /** Names of middleware that executed */
  readonly executedMiddleware: readonly string[];
}

/**
 * Options for creating a middleware pipeline.
 */
export interface PipelineOptions {
  /** Maximum number of middleware allowed */
  readonly maxMiddleware?: number;
  /** Whether to stop on first error (default: true) */
  readonly stopOnError?: boolean;
}
