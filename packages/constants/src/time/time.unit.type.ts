/**
 * Time unit constants.
 *
 * @module time/timeUnit
 */

/** Type-safe time unit string. */
export type TimeUnit =
  "milliseconds" | "seconds" | "minutes" | "hours" | "days";

/**
 * All supported time units as an object map.
 */
export const TimeUnits = Object.freeze({
  MILLISECONDS: "milliseconds",
  SECONDS: "seconds",
  MINUTES: "minutes",
  HOURS: "hours",
  DAYS: "days",
} as const);
