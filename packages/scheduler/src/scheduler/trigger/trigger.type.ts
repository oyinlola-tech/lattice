/**
 * @zudolib/scheduler/trigger
 *
 * Trigger types for the scheduler package.
 */

/**
 * Trigger interface for calculating next execution time.
 */
export interface Trigger {
  next(after: Date): Date | null;
}
