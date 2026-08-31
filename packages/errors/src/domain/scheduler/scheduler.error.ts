import { BaseError } from "../../base/core/baseError.core.js";
import type { BaseErrorOptions } from "../../base/types/baseError.type.js";

import type { ErrorMetadataValue } from "../../base/core/errorMetadata.core.js";

import {
  ErrorCategory,
} from "../../base/types/errorCategory.type.js";

import {
  ErrorCode,
} from "../../base/types/errorCode.type.js";

import {
  ErrorSeverity,
} from "../../base/types/errorSeverity.type.js";

/**
 * Options for creating a scheduler error.
 */
export interface SchedulerErrorOptions
  extends Omit<BaseErrorOptions, "category"> {
  readonly category?: ErrorCategory;
  readonly jobId?: string;
  readonly scheduleId?: string;
}

/**
 * Base error for all scheduler failures.
 */
export class SchedulerError extends BaseError {
  public readonly jobId?: string;

  public readonly scheduleId?: string;

  constructor(
    message: string,
    options: SchedulerErrorOptions = {},
  ) {
    super(
      message,
      {
        ...options,
        code: options.code ?? ErrorCode.SCHEDULER_ERROR,
        category: options.category ?? ErrorCategory.SCHEDULER,
        severity: options.severity ?? ErrorSeverity.ERROR,
        statusCode: options.statusCode ?? 500,
        expose: options.expose ?? false,
        isOperational: options.isOperational ?? true,
      },
    );

    this.jobId = options.jobId;
    this.scheduleId = options.scheduleId;
  }

  public override toJSON() {
    return {
      ...super.toJSON(),
      ...(this.jobId !== undefined ? { jobId: this.jobId } : {}),
      ...(this.scheduleId !== undefined ? { scheduleId: this.scheduleId } : {}),
    };
  }
}

/**
 * Creates a scheduler error.
 */
export function createSchedulerError(
  message: string,
  options: SchedulerErrorOptions = {},
): SchedulerError {
  return new SchedulerError(message, options);
}

/**
 * Determines whether an unknown value is a SchedulerError.
 */
export function isSchedulerError(
  value: unknown,
): value is SchedulerError {
  return value instanceof SchedulerError;
}

/**
 * Error thrown when the scheduler has not been started.
 */
export class SchedulerNotStartedError extends SchedulerError {
  constructor() {
    super(
      "Scheduler has not been started.",
      {
        code: ErrorCode.SCHEDULER_NOT_STARTED,
        statusCode: 400,
        expose: true,
      },
    );

    this.name = "SchedulerNotStartedError";
  }
}

/**
 * Error thrown when the scheduler is already started.
 */
export class SchedulerAlreadyStartedError extends SchedulerError {
  constructor() {
    super(
      "Scheduler is already started.",
      {
        code: ErrorCode.SCHEDULER_ALREADY_STARTED,
        statusCode: 400,
        expose: true,
      },
    );

    this.name = "SchedulerAlreadyStartedError";
  }
}

/**
 * Error thrown when the scheduler is stopped.
 */
export class SchedulerStoppedError extends SchedulerError {
  constructor() {
    super(
      "Scheduler is stopped.",
      {
        code: ErrorCode.SCHEDULER_STOPPED,
        statusCode: 400,
        expose: true,
      },
    );

    this.name = "SchedulerStoppedError";
  }
}

/**
 * Error thrown when a job is not found.
 */
export class SchedulerJobNotFoundError extends SchedulerError {
  constructor(jobId: string) {
    super(
      `Job "${jobId}" is not registered.`,
      {
        code: ErrorCode.SCHEDULER_JOB_NOT_FOUND,
        jobId,
        statusCode: 404,
        expose: true,
      },
    );

    this.name = "SchedulerJobNotFoundError";
  }
}

/**
 * Error thrown when a job already exists.
 */
export class SchedulerJobAlreadyExistsError extends SchedulerError {
  constructor(jobId: string) {
    super(
      `Job "${jobId}" already exists.`,
      {
        code: ErrorCode.SCHEDULER_JOB_ALREADY_EXISTS,
        jobId,
        statusCode: 409,
        expose: true,
      },
    );

    this.name = "SchedulerJobAlreadyExistsError";
  }
}

/**
 * Error thrown when a job definition is invalid.
 */
export class InvalidJobError extends SchedulerError {
  constructor(message: string, jobId?: string) {
    super(
      message,
      {
        code: ErrorCode.INVALID_JOB,
        jobId,
        statusCode: 400,
        expose: true,
      },
    );

    this.name = "InvalidJobError";
  }
}

/**
 * Error thrown when a schedule is not found.
 */
export class ScheduleNotFoundError extends SchedulerError {
  constructor(scheduleId: string) {
    super(
      `Schedule "${scheduleId}" is not found.`,
      {
        code: ErrorCode.SCHEDULE_NOT_FOUND,
        scheduleId,
        statusCode: 404,
        expose: true,
      },
    );

    this.name = "ScheduleNotFoundError";
  }
}

/**
 * Error thrown when a schedule already exists.
 */
export class ScheduleAlreadyExistsError extends SchedulerError {
  constructor(scheduleId: string) {
    super(
      `Schedule "${scheduleId}" already exists.`,
      {
        code: ErrorCode.SCHEDULE_ALREADY_EXISTS,
        scheduleId,
        statusCode: 409,
        expose: true,
      },
    );

    this.name = "ScheduleAlreadyExistsError";
  }
}

/**
 * Error thrown when a schedule is invalid.
 */
export class InvalidScheduleError extends SchedulerError {
  constructor(message: string, scheduleId?: string) {
    super(
      message,
      {
        code: ErrorCode.INVALID_SCHEDULE,
        scheduleId,
        statusCode: 400,
        expose: true,
      },
    );

    this.name = "InvalidScheduleError";
  }
}

/**
 * Error thrown when a cron expression cannot be parsed.
 */
export class CronParseError extends SchedulerError {
  constructor(
    expression: string,
    reason: string,
  ) {
    super(
      `Invalid cron expression "${expression}": ${reason}.`,
      {
        code: ErrorCode.CRON_PARSE_ERROR,
        metadata: { expression, reason } as Record<string, ErrorMetadataValue>,
        statusCode: 400,
        expose: true,
      },
    );

    this.name = "CronParseError";
  }
}

/**
 * Error thrown when a duration string is invalid.
 */
export class InvalidDurationError extends SchedulerError {
  constructor(duration: string) {
    super(
      `Invalid duration "${duration}".`,
      {
        code: ErrorCode.INVALID_DURATION,
        metadata: { duration } as Record<string, ErrorMetadataValue>,
        statusCode: 400,
        expose: true,
      },
    );

    this.name = "InvalidDurationError";
  }
}

/**
 * Error thrown when a job execution fails.
 */
export class SchedulerJobExecutionError extends SchedulerError {
  constructor(
    message: string,
    jobId?: string,
    scheduleId?: string,
  ) {
    super(
      message,
      {
        code: ErrorCode.SCHEDULER_JOB_EXECUTION_ERROR,
        jobId,
        scheduleId,
        statusCode: 500,
        expose: false,
      },
    );

    this.name = "SchedulerJobExecutionError";
  }
}

/**
 * Error thrown when a job times out.
 */
export class SchedulerJobTimeoutError extends SchedulerError {
  constructor(
    timeout: number,
    jobId?: string,
  ) {
    super(
      `Job timed out after ${timeout}ms.`,
      {
        code: ErrorCode.SCHEDULER_JOB_TIMEOUT,
        jobId,
        metadata: { timeout } as Record<string, ErrorMetadataValue>,
        statusCode: 504,
        expose: false,
      },
    );

    this.name = "SchedulerJobTimeoutError";
  }
}

/**
 * Error thrown when a job is cancelled.
 */
export class SchedulerJobCancelledError extends SchedulerError {
  constructor(
    message = "Job was cancelled.",
    jobId?: string,
  ) {
    super(
      message,
      {
        code: ErrorCode.SCHEDULER_JOB_CANCELLED,
        jobId,
        statusCode: 499,
        expose: false,
      },
    );

    this.name = "SchedulerJobCancelledError";
  }
}

/**
 * Error thrown when the scheduler store encounters an error.
 */
export class SchedulerStoreError extends SchedulerError {
  constructor(
    message: string,
    scheduleId?: string,
  ) {
    super(
      message,
      {
        code: ErrorCode.SCHEDULER_STORE_ERROR,
        scheduleId,
        statusCode: 500,
        expose: false,
      },
    );

    this.name = "SchedulerStoreError";
  }
}

/**
 * Error thrown when the scheduler lock encounters an error.
 */
export class SchedulerLockError extends SchedulerError {
  constructor(
    message: string,
    scheduleId?: string,
  ) {
    super(
      message,
      {
        code: ErrorCode.SCHEDULER_LOCK_ERROR,
        scheduleId,
        statusCode: 409,
        expose: false,
      },
    );

    this.name = "SchedulerLockError";
  }
}
