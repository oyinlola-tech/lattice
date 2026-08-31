/**
 * Scheduler error classes — re-exports from focused files.
 */

export {
  SchedulerError,
  createSchedulerError,
  isSchedulerError,
  SchedulerNotStartedError,
  SchedulerAlreadyStartedError,
  SchedulerStoppedError,
  SchedulerJobNotFoundError,
  SchedulerJobAlreadyExistsError,
  InvalidJobError,
} from "./schedulerError.base.js";
export type { SchedulerErrorOptions } from "./schedulerError.base.js";

export {
  ScheduleNotFoundError,
  ScheduleAlreadyExistsError,
  InvalidScheduleError,
  CronParseError,
  InvalidDurationError,
} from "./schedulerError.schedule.js";

export {
  SchedulerJobExecutionError,
  SchedulerJobTimeoutError,
  SchedulerJobCancelledError,
  SchedulerStoreError,
  SchedulerLockError,
} from "./schedulerError.execution.js";
