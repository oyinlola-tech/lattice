/**
 * Supported logging severity levels in Zudojs.
 *
 * Levels are ordered from least severe to most severe.
 */
export const LogLevel = {
  TRACE: "trace",
  DEBUG: "debug",
  INFO: "info",
  WARN: "warn",
  ERROR: "error",
  FATAL: "fatal",
} as const;

/**
 * Union of all supported Zudojs log levels.
 */
export type LogLevel = (typeof LogLevel)[keyof typeof LogLevel];

/**
 * Numeric severity used when comparing log levels.
 *
 * Higher values represent more severe events.
 */
export const LogLevelPriority: Record<LogLevel, number> = {
  trace: 10,
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  fatal: 60,
};

/**
 * Determines whether a log level should be emitted when
 * the configured minimum level is applied.
 */
export function shouldLog(level: LogLevel, minimumLevel: LogLevel): boolean {
  return LogLevelPriority[level] >= LogLevelPriority[minimumLevel];
}
