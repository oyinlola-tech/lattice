/**
 * Schedule-related error classes — schedule lifecycle, cron parsing.
 */

import type { ErrorMetadataValue } from "../../base/core/errorMetadata.type.js";
import { ErrorCode } from "../../base/types/errorCode.type.js";
import { SchedulerError } from "./schedulerError.base.js";

/** Error thrown when a schedule is not found. */
export class ScheduleNotFoundError extends SchedulerError {
  constructor(scheduleId: string) {
    super(`Schedule "${scheduleId}" is not found.`, {
      code: ErrorCode.SCHEDULE_NOT_FOUND, scheduleId, statusCode: 404, expose: true,
    });
    this.name = "ScheduleNotFoundError";
  }
}

/** Error thrown when a schedule already exists. */
export class ScheduleAlreadyExistsError extends SchedulerError {
  constructor(scheduleId: string) {
    super(`Schedule "${scheduleId}" already exists.`, {
      code: ErrorCode.SCHEDULE_ALREADY_EXISTS, scheduleId, statusCode: 409, expose: true,
    });
    this.name = "ScheduleAlreadyExistsError";
  }
}

/** Error thrown when a schedule is invalid. */
export class InvalidScheduleError extends SchedulerError {
  constructor(message: string, scheduleId?: string) {
    super(message, {
      code: ErrorCode.INVALID_SCHEDULE, scheduleId, statusCode: 400, expose: true,
    });
    this.name = "InvalidScheduleError";
  }
}

/** Error thrown when a cron expression cannot be parsed. */
export class CronParseError extends SchedulerError {
  constructor(expression: string, reason: string) {
    super(`Invalid cron expression "${expression}": ${reason}.`, {
      code: ErrorCode.CRON_PARSE_ERROR,
      metadata: { expression, reason } as Record<string, ErrorMetadataValue>,
      statusCode: 400,
      expose: true,
    });
    this.name = "CronParseError";
  }
}

/** Error thrown when a duration string is invalid. */
export class InvalidDurationError extends SchedulerError {
  constructor(duration: string) {
    super(`Invalid duration "${duration}".`, {
      code: ErrorCode.INVALID_DURATION,
      metadata: { duration } as Record<string, ErrorMetadataValue>,
      statusCode: 400,
      expose: true,
    });
    this.name = "InvalidDurationError";
  }
}
