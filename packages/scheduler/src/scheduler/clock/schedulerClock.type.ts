/**
 * Clock abstraction for time operations.
 *
 * Allows deterministic testing and clock manipulation.
 */
export interface Clock {
  now(): Date;

  nowMs(): number;
}

/**
 * System clock that uses the actual system time.
 */
export class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }

  nowMs(): number {
    return Date.now();
  }
}

/**
 * Creates a new system clock.
 */
export function createSystemClock(): SystemClock {
  return new SystemClock();
}
