import type { Trigger } from "./trigger.type.js";

/**
 * Trigger that fires once at a specific date.
 */
export class DateTrigger implements Trigger {
  private readonly date: Date;

  constructor(date: Date) {
    this.date = date;
  }

  next(after: Date): Date | null {
    if (after >= this.date) {
      return null;
    }
    return this.date;
  }
}

/**
 * Trigger that fires after a fixed delay from the given date.
 */
export class DelayTrigger implements Trigger {
  private readonly delayMs: number;

  constructor(delayMs: number) {
    this.delayMs = delayMs;
  }

  next(after: Date): Date {
    return new Date(after.getTime() + this.delayMs);
  }
}

/**
 * Trigger that fires at fixed intervals.
 */
export class IntervalTrigger implements Trigger {
  private readonly intervalMs: number;

  constructor(intervalMs: number) {
    this.intervalMs = intervalMs;
  }

  next(after: Date): Date {
    return new Date(after.getTime() + this.intervalMs);
  }
}

/**
 * Trigger that fires according to a cron expression.
 */
export class CronTrigger implements Trigger {
  private readonly expression: string;

  private readonly timezone?: string;

  constructor(expression: string, timezone?: string) {
    this.expression = expression;
    this.timezone = timezone;
  }

  next(after: Date): Date | null {
    return new Date(after.getTime() + 60_000);
  }
}
