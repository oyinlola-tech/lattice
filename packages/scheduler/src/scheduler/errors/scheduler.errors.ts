/**
 * @zudolib/scheduler/errors
 *
 * Scheduler-specific error classes for the Zudolib framework.
 *
 * Re-exported from @zudolib/errors for convenience.
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
} from "@zudolib/errors";

export type { SchedulerErrorOptions } from "@zudolib/errors";
