/**
 * @zudoliblib/core/logging/core
 *
 * Core logger types, levels, entries, context, and options.
 */

export { BaseLogger, type Logger, type LogContext } from "./logger.js";

export {
  LogLevel,
  LogLevelPriority,
  shouldLog,
  type LogLevel as LogLevelType,
} from "./logLevel.level.js";

export {
  createLoggerContext,
  type LoggerContext,
} from "./loggerContext.context.js";

export {
  serializeLogError,
  type LogEntry,
  type LogError,
} from "./logEntry.entry.js";

export {
  DEFAULT_LOGGER_OPTIONS,
  type LoggerOptions,
  type LogLevelOption,
} from "./loggerOptions.options.js";
