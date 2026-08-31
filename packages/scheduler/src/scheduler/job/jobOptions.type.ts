import type { OverlapPolicy } from "../types/schedulerTypes.core.js";

/**
 * Options for a scheduled job.
 */
export interface JobOptions {
  readonly timeout?: number;

  readonly retry?: RetryPolicy;

  readonly concurrency?: number;

  readonly overlap?: OverlapPolicy;
}

/**
 * Retry policy for job executions.
 */
export interface RetryPolicy {
  readonly attempts: number;

  readonly strategy: RetryStrategy;

  readonly delay: number;

  readonly maxDelay?: number;

  readonly jitter?: boolean;
}

/**
 * Retry strategy.
 */
export type RetryStrategy = "fixed" | "linear" | "exponential";
