/**
 * @zudojs/rpc/reliability/timeout
 *
 * Timeout utilities for RPC operations.
 */

/**
 * Creates a timeout promise that rejects after the given duration.
 */
export function createTimeout(duration: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Operation timed out after ${duration}ms.`));
    }, duration);
  });
}

/**
 * Wraps a promise with a timeout.
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  duration: number,
): Promise<T> {
  return Promise.race([promise, createTimeout(duration)]);
}
