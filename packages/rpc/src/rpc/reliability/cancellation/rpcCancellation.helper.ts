/**
 * @oyinlola141/lattice-rpc/reliability/cancellation
 *
 * Cancellation utilities for RPC operations.
 */

/**
 * Creates an AbortSignal that can be triggered manually.
 */
export function createCancellableSignal(): AbortSignal {
  const controller = new AbortController();
  return controller.signal;
}

/**
 * Cancels an AbortSignal by aborting its controller.
 */
export function cancelSignal(signal: AbortSignal): void {
  if (!signal.aborted) {
    (signal as unknown as { abort(): void }).abort();
  }
}
