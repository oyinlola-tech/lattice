/**
 * @zudo/scheduler/errors
 *
 * Scheduler-specific error classes for the Lattice framework.
 *
 * Re-exported from @zudo/errors for convenience.
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
} from "@zudo/errors";

export type { SchedulerErrorOptions } from "@zudo/errors";
