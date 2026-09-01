import { BackoffType } from "../jobTypes/jobTypes.type.js";

import type { BackoffOptions } from "../jobOptions/jobOptions.type.js";

/**
 * Calculates the delay for the next retry attempt.
 */
export function calculateRetryDelay(
  attempt: number,
  backoff?: BackoffOptions,
): number {
  if (!backoff) {
    return 0;
  }

  const { type, delay, maxDelay, multiplier } = backoff;

  switch (type) {
    case BackoffType.FIXED:
      return delay;

    case BackoffType.EXPONENTIAL: {
      const multiplierValue = multiplier ?? 2;
      const calculatedDelay = delay * Math.pow(multiplierValue, attempt - 1);
      return maxDelay ? Math.min(calculatedDelay, maxDelay) : calculatedDelay;
    }

    default:
      return delay;
  }
}

/**
 * Checks if a job should be retried based on its state.
 */
export function shouldRetry(attempt: number, maxAttempts: number): boolean {
  return attempt < maxAttempts;
}

/**
 * Creates a backoff options object.
 */
export function createBackoffOptions(
  type: BackoffType,
  delay: number,
  options?: {
    maxDelay?: number;
    multiplier?: number;
  },
): BackoffOptions {
  return {
    type,
    delay,
    maxDelay: options?.maxDelay,
    multiplier: options?.multiplier,
  };
}

/**
 * Creates a fixed backoff options.
 */
export function createFixedBackoff(delay: number): BackoffOptions {
  return createBackoffOptions(BackoffType.FIXED, delay);
}

/**
 * Creates an exponential backoff options.
 */
export function createExponentialBackoff(
  delay: number,
  options?: {
    maxDelay?: number;
    multiplier?: number;
  },
): BackoffOptions {
  return createBackoffOptions(BackoffType.EXPONENTIAL, delay, options);
}
