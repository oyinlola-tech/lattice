import type { MisfirePolicy } from "../types/schedulerTypes.core.js";

/**
 * Options for a schedule.
 */
export interface ScheduleOptions {
  readonly timezone?: string;

  readonly misfire?: MisfirePolicy;

  readonly priority?: number;
}
