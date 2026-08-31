/**
 * @lattice/rpc/reliability/retry
 *
 * Retry utilities for RPC operations.
 */

/**
 * Retry backoff strategies.
 */
export type RPCBackoff = "fixed" | "linear" | "exponential";

/**
 * Retry options.
 */
export interface RPCRetryOptions {
  readonly attempts: number;

  readonly delay: number;

  readonly maxDelay?: number;

  readonly backoff?: RPCBackoff;

  readonly retryIf?: (error: unknown) => boolean;
}

/**
 * Default retry options.
 */
export const DEFAULT_RETRY_OPTIONS: RPCRetryOptions = {
  attempts: 1,
  delay: 0,
};

/**
 * Calculates the delay for a retry attempt.
 */
export function calculateRetryDelay(
  attempt: number,
  options: RPCRetryOptions,
): number {
  const backoff = options.backoff ?? "fixed";
  const maxDelay = options.maxDelay ?? 30_000;

  let delay = options.delay;

  if (backoff === "linear") {
    delay = options.delay * attempt;
  } else if (backoff === "exponential") {
    delay = options.delay * 2 ** (attempt - 1);
  }

  return Math.min(delay, maxDelay);
}

/**
 * Retries an asynchronous operation.
 */
export async function retry<T>(
  operation: () => Promise<T>,
  options: RPCRetryOptions,
): Promise<T> {
  const attempts = Math.max(1, options.attempts);

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      if (attempt >= attempts - 1) {
        throw error;
      }

      if (options.retryIf && !options.retryIf(error)) {
        throw error;
      }

      const delay = calculateRetryDelay(attempt + 1, options);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error("Retry loop exited unexpectedly.");
}
