/**
 * @lattice/observability — Log Level
 *
 * Utility functions for converting between log levels and names,
 * and checking whether a message should be logged.
 */

import { LogLevel, type LogLevelName } from "../types.js";

const LEVEL_NAMES: readonly LogLevelName[] = [
  "trace", "debug", "info", "warn", "error", "fatal", "off",
];

const NAME_TO_LEVEL: ReadonlyMap<LogLevelName, LogLevel> = new Map([
  ["trace", LogLevel.TRACE],
  ["debug", LogLevel.DEBUG],
  ["info", LogLevel.INFO],
  ["warn", LogLevel.WARN],
  ["error", LogLevel.ERROR],
  ["fatal", LogLevel.FATAL],
  ["off", LogLevel.OFF],
]);

/** Converts a numeric level to its name. */
export function logLevelToName(level: LogLevel): LogLevelName {
  return LEVEL_NAMES[level] ?? "off";
}

/** Converts a level name to its numeric value. */
export function logLevelFromName(name: LogLevelName): LogLevel {
  return NAME_TO_LEVEL.get(name) ?? LogLevel.OFF;
}

/** Returns true if a message at `messageLevel` should pass the `threshold`. */
export function shouldLog(threshold: LogLevel, messageLevel: LogLevel): boolean {
  return messageLevel >= threshold;
}

/** Returns all log level names. */
export function getLogLevelNames(): readonly LogLevelName[] {
  return LEVEL_NAMES;
}
