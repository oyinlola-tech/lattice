/**
 * Injectable Clock interface for deterministic time in tests.
 *
 * @module runtime/clock
 */

/**
 * Provides deterministic time for testing.
 */
export interface Clock {
  /**
   * Returns current timestamp in milliseconds.
   */
  now(): number;

  /**
   * Returns current Date.
   */
  Date(): Date;
}

/**
 * Default clock using real system time.
 */
export const systemClock: Clock = {
  now: () => Date.now(),
  Date: () => new Date(),
};

/**
 * Creates a mock clock with a fixed time.
 */
export function createMockClock(fixedTime: number = 0): Clock {
  let time = fixedTime;

  return {
    now: () => time,
    Date: () => new Date(time),
  };
}
