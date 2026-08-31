import { InvalidDurationError } from "../errors/scheduler.errors.js";

/**
 * Parses a human-readable duration string into milliseconds.
 *
 * Supported formats:
 * - "5s" - 5 seconds
 * - "10m" - 10 minutes
 * - "2h" - 2 hours
 * - "3d" - 3 days
 */
export function parseDuration(duration: string): number {
  const match = duration.match(/^(\d+)(s|m|h|d)$/);
  if (!match) {
    throw new InvalidDurationError(duration);
  }

  const value = Number(match[1]);
  const unit = match[2];

  switch (unit) {
    case "s":
      return value * 1000;
    case "m":
      return value * 60 * 1000;
    case "h":
      return value * 60 * 60 * 1000;
    case "d":
      return value * 24 * 60 * 60 * 1000;
    default:
      throw new InvalidDurationError(duration);
  }
}
