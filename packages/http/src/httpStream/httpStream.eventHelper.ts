/**
 * @zudolib/http/httpStream — Shared settle-once guard, cleanup, and abort patterns.
 */

import { destroyStream } from "./httpStream.destroy.js";

import { normalizeStreamError } from "./httpStream.error.js";

export interface StreamSettleGuard {
  readonly settled: () => boolean;
  readonly mark: () => void;
}

export function createSettleGuard(): StreamSettleGuard {
  let settled = false;

  return {
    settled: () => settled,
    mark: () => {
      settled = true;
    },
  };
}

export function cleanupListeners(
  target: NodeJS.ReadableStream | NodeJS.WritableStream,
  listeners: ReadonlyArray<
    readonly [string, (...args: readonly unknown[]) => void]
  >,
): void {
  for (const [event, handler] of listeners) {
    target.removeListener(event, handler);
  }
}

export function createFinishHandler(
  guard: StreamSettleGuard,
  cleanup: () => void,
  resolve: (value: void | PromiseLike<void>) => void,
  reject: (reason: unknown) => void,
): (error?: unknown) => void {
  return (error?: unknown) => {
    if (guard.settled()) return;

    guard.mark();

    cleanup();

    if (error) {
      reject(normalizeStreamError(error));
    } else {
      resolve();
    }
  };
}

export function createAbortHandler(
  guard: StreamSettleGuard,
  cleanup: () => void,
  finish: (error?: unknown) => void,
  streams: ReadonlyArray<NodeJS.ReadableStream | NodeJS.WritableStream>,
): () => void {
  return () => {
    for (const s of streams) {
      destroyStream(s);
    }

    finish();
  };
}

export function wireAbortSignal(
  signal: AbortSignal | undefined,
  onAbort: () => void,
): () => void {
  if (signal) {
    signal.addEventListener("abort", onAbort, { once: true });
  }

  return () => {
    signal?.removeEventListener("abort", onAbort);
  };
}
