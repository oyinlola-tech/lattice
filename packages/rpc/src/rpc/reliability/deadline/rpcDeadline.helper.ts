/**
 * @lattice/rpc/reliability/deadline
 *
 * Deadline utilities for RPC operations.
 */

/**
 * Calculates the remaining time until a deadline.
 */
export function getRemainingTime(deadline: number): number {
  const remaining = deadline - Date.now();
  return Math.max(0, remaining);
}

/**
 * Checks if a deadline has been exceeded.
 */
export function isDeadlineExceeded(deadline: number): boolean {
  return Date.now() >= deadline;
}

/**
 * Throws if the deadline has been exceeded.
 */
export function throwIfDeadlineExceeded(deadline: number): void {
  if (isDeadlineExceeded(deadline)) {
    throw new Error("Deadline exceeded.");
  }
}
