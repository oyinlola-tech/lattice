/**
 * @lattice/logger
 *
 * Structured logging with transports, formatters, and context for the Lattice framework.
 */

// Core logger
export * from "./loggerCore/index.js";

// Formatter
export * from "./loggerFormatter/index.js";

// Transport
export * from "./loggerTransport/index.js";

// Entry types
export * from "./loggerEntry/index.js";

// Context (withLoggerContext is re-exported from loggerCore)
export {
  type LoggerContext,
  type LoggerContextData,
  type LoggerContextIdentifiers,
  type LoggerContextOptions,
  createLoggerContext,
  isLoggerContext,
  mergeLoggerContexts,
} from "./loggerContext/index.js";

// Options
export * from "./loggerOptions/index.js";

// Errors
export * from "./loggerErrors/index.js";

// Manager
export * from "./loggerManager/index.js";

// Factory
export * from "./loggerFactory/index.js";

// Level
export * from "./loggerLevel/index.js";
