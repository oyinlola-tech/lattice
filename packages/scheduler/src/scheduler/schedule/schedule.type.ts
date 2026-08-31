import type { ScheduleOptions } from "./scheduleOptions.type.js";

import type { ScheduleState } from "../types/schedulerTypes.core.js";

/**
 * Schedule definition.
 */
export interface Schedule {
  readonly id: string;

  readonly jobId: string;

  readonly type: ScheduleType;

  readonly expression?: string;

  readonly nextRunAt: Date;

  readonly lastRunAt?: Date;

  readonly state: ScheduleState;

  readonly options?: ScheduleOptions;
}

/**
 * Type of schedule.
 */
export type ScheduleType = "once" | "delay" | "interval" | "cron";

/**
 * Creates a schedule.
 */
export function createSchedule(
  id: string,
  jobId: string,
  type: ScheduleType,
  nextRunAt: Date,
  options: ScheduleOptions = {},
): Schedule {
  return Object.freeze({
    id,
    jobId,
    type,
    nextRunAt,
    state: "active",
    options: Object.freeze(options),
  });
}
