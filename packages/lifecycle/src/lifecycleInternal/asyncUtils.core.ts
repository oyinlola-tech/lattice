/**
 * @zudojs/lifecycle/internal/async-utils
 *
 * Async utilities for timeout, abort, and concurrency control.
 */

import { LifecycleTimeoutError } from "@zudojs/errors";

/**
 * Executes an async operation with a timeout.
 * Throws LifecycleTimeoutError if the timeout is exceeded.
 */
export async function withTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number,
  componentId: string,
  phase: string,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new LifecycleTimeoutError(componentId, phase, timeoutMs));
    }, timeoutMs);

    fn()
      .then((result) => {
        clearTimeout(timer);
        resolve(result);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

/**
 * Executes an async operation with abort signal support.
 */
export async function withAbort<T>(
  fn: (signal: AbortSignal) => Promise<T>,
  signal: AbortSignal,
): Promise<T> {
  if (signal.aborted) {
    throw new Error("Operation aborted");
  }

  return new Promise<T>((resolve, reject) => {
    const onAbort = () => {
      reject(new Error("Operation aborted"));
    };

    signal.addEventListener("abort", onAbort, { once: true });

    fn(signal)
      .then((result) => {
        signal.removeEventListener("abort", onAbort);
        resolve(result);
      })
      .catch((error) => {
        signal.removeEventListener("abort", onAbort);
        reject(error);
      });
  });
}

/**
 * Executes async operations with a concurrency limit.
 */
export async function withConcurrency<T>(
  items: readonly T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<void>,
): Promise<void> {
  const executing = new Set<Promise<void>>();
  const results: Promise<void>[] = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const p = fn(item!, i).then(() => {
      executing.delete(p);
    });
    executing.add(p);
    results.push(p);

    if (executing.size >= concurrency) {
      await Promise.race(executing);
    }
  }

  await Promise.all(results);
}
