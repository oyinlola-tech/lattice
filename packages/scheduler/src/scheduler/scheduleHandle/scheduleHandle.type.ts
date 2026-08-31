import type { ScheduleState } from "../types/schedulerTypes.core.js";

/**
 * Handle for controlling a schedule.
 */
export interface ScheduleHandle {
  readonly id: string;

  state: ScheduleState;

  pause(): Promise<void>;

  resume(): Promise<void>;

  cancel(): Promise<void>;

  nextRun(): Date | undefined;
}

/**
 * Implementation of ScheduleHandle.
 */
export class ScheduleHandleImpl implements ScheduleHandle {
  readonly id: string;

  state: ScheduleState;

  private cancelled = false;

  constructor(id: string, state: ScheduleState) {
    this.id = id;
    this.state = state;
  }

  pause(): Promise<void> {
    this.state = "paused";
    return Promise.resolve();
  }

  resume(): Promise<void> {
    this.state = "active";
    return Promise.resolve();
  }

  cancel(): Promise<void> {
    this.cancelled = true;
    this.state = "cancelled";
    return Promise.resolve();
  }

  nextRun(): Date | undefined {
    return undefined;
  }
}
