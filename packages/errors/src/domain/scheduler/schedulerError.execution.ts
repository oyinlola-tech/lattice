/**
 * Scheduler execution error classes — job execution, timeout, cancellation, store, lock.
 */

import type { ErrorMetadataValue } from "../../base/core/errorMetadata.type.js";
import { ErrorCode } from "../../base/types/errorCode.type.js";
import { SchedulerError } from "./schedulerError.base.js";

/** Error thrown when a job execution fails. */
export class SchedulerJobExecutionError extends SchedulerError {
  constructor(message: string, jobId?: string, scheduleId?: string) {
    super(message, {
      code: ErrorCode.SCHEDULER_JOB_EXECUTION_ERROR, jobId, scheduleId, statusCode: 500, expose: false,
    });
    this.name = "SchedulerJobExecutionError";
  }
}

/** Error thrown when a job times out. */
export class SchedulerJobTimeoutError extends SchedulerError {
  constructor(timeout: number, jobId?: string) {
    super(`Job timed out after ${timeout}ms.`, {
      code: ErrorCode.SCHEDULER_JOB_TIMEOUT, jobId,
      metadata: { timeout } as Record<string, ErrorMetadataValue>,
      statusCode: 504, expose: false,
    });
    this.name = "SchedulerJobTimeoutError";
  }
}

/** Error thrown when a job is cancelled. */
export class SchedulerJobCancelledError extends SchedulerError {
  constructor(message = "Job was cancelled.", jobId?: string) {
    super(message, {
      code: ErrorCode.SCHEDULER_JOB_CANCELLED, jobId, statusCode: 499, expose: false,
    });
    this.name = "SchedulerJobCancelledError";
  }
}

/** Error thrown when the scheduler store encounters an error. */
export class SchedulerStoreError extends SchedulerError {
  constructor(message: string, scheduleId?: string) {
    super(message, {
      code: ErrorCode.SCHEDULER_STORE_ERROR, scheduleId, statusCode: 500, expose: false,
    });
    this.name = "SchedulerStoreError";
  }
}

/** Error thrown when the scheduler lock encounters an error. */
export class SchedulerLockError extends SchedulerError {
  constructor(message: string, scheduleId?: string) {
    super(message, {
      code: ErrorCode.SCHEDULER_LOCK_ERROR, scheduleId, statusCode: 409, expose: false,
    });
    this.name = "SchedulerLockError";
  }
}
