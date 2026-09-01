/**
 * @oyinlola141/lattice-scheduler/errors
 *
 * Scheduler-specific error classes for the Lattice framework.
 *
 * Re-exported from @oyinlola141/lattice-errors for convenience.
 */

export {
  SchedulerError,
  SchedulerNotStartedError,
  SchedulerAlreadyStartedError,
  SchedulerStoppedError,
  SchedulerJobNotFoundError,
  SchedulerJobAlreadyExistsError,
  InvalidJobError,
  ScheduleNotFoundError,
  ScheduleAlreadyExistsError,
  InvalidScheduleError,
  CronParseError,
  InvalidDurationError,
  SchedulerJobExecutionError,
  SchedulerJobTimeoutError,
  SchedulerJobCancelledError,
  SchedulerStoreError,
  SchedulerLockError,
  createSchedulerError,
  isSchedulerError,
} from "@oyinlola141/lattice-errors";

export type { SchedulerErrorOptions } from "@oyinlola141/lattice-errors";
