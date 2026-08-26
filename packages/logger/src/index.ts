/**
 * @lattice/logger
 *
 * Structured logging infrastructure for the Lattice platform.
 *
 * Public API for logger creation, configuration, contexts,
 * formatters, transports, errors, and lifecycle management.
 */

// Logger
export {
  LatticeLogger,
  createLogger,
  createChildLogger,
  createDefaultLogger,
  logError,
  withLoggerContext,
} from "./logger";

export type {
  Logger,
} from "./logger";

// Logger levels
export {
  LoggerLevel,
  loggerLevelToName,
  loggerLevelFromName,
  isLoggerLevel,
  isLoggerLevelName,
  shouldLog,
  getLoggerLevels,
  getLoggerLevelNames,
} from "./logger-level";

export type {
  LoggerLevelName,
} from "./logger-level";

// Logger entries
export {
  createLoggerEntry,
  createLoggerEntryId,
  createErrorLoggerEntry,
  normalizeLogMetadata,
  serializeLoggerEntry,
  serializeLoggerError,
  serializeLoggerValue,
} from "./logger-entry";

export type {
  LogValue,
  LogMetadata,
  LoggerSource,
  LoggerEntryContext,
  LoggerEntry,
  LoggerEntryInput,
} from "./logger-entry";

// Logger context
export {
  createLoggerContext,
  createEmptyLoggerContext,
  mergeLoggerContexts,
  withLoggerContext as withLoggerContextData,
  withLoggerIdentifiers,
  contextToLogMetadata,
  serializeLoggerContext,
  isLoggerContext,
  createLoggerContextId,
  createLoggerContextStorage,
  getCurrentLoggerContextMetadata,
} from "./logger-context";

export type {
  LoggerContextValue,
  LoggerContextData,
  LoggerContextIdentifiers,
  LoggerContext,
  LoggerContextOptions,
  LoggerContextStorage,
} from "./logger-context";

// Logger formatters
export {
  createLoggerFormatter,
  formatLoggerEntry,
  isLoggerFormatter,
  isLoggerFormatterFunction,
  isLoggerFormatterObject,
  createJsonLoggerFormatter,
  createTextLoggerFormatter,
  createCompactLoggerFormatter,
  createDevelopmentLoggerFormatter,
  createProductionLoggerFormatter,
  createStructuredLoggerFormatter,
  createLoggerFormatterId,
} from "./logger-formatter";

export type {
  LoggerFormattedOutput,
  LoggerFormatterContext,
  LoggerFormatter,
  LoggerFormatterFunction,
  LoggerFormatterLike,
  LoggerFormatterOptions,
  JsonLoggerFormatterOptions,
  TextLoggerFormatterOptions,
} from "./logger-formatter";

// Logger transports
export {
  createLoggerTransport,
  writeLoggerTransport,
  isLoggerTransport,
  isLoggerTransportFunction,
  isLoggerTransportObject,
  createConsoleLoggerTransport,
  createConditionalLoggerTransport,
  createMultiLoggerTransport,
  createBufferedLoggerTransport,
  enableLoggerTransport,
  disableLoggerTransport,
  closeLoggerTransport,
  flushLoggerTransport,
  serializeTransportEntry,
  createLoggerTransportId,
} from "./logger-transport";

export type {
  LoggerTransport,
  LoggerTransportContext,
  LoggerTransportFunction,
  LoggerTransportLike,
  LoggerTransportOptions,
  RegisteredLoggerTransport,
  LoggerBufferedTransportOptions,
} from "./logger-transport";

// Logger options
export {
  DEFAULT_LOGGER_OPTIONS,
  validateLoggerOptions,
  resolveLoggerOptions,
  mergeLoggerOptions,
  createChildLoggerOptions,
} from "./logger-options";

export type {
  LoggerOptions,
  ChildLoggerOptions,
  LogOptions,
  LoggerConfiguration,
} from "./logger-options";

// Logger factory
export {
  LoggerFactory,
  createLoggerFactory,
  createFactoryLogger,
  getFactoryLogger,
} from "./logger-factory";

// Logger manager
export {
  LoggerManager,
  createLoggerManager,
  initializeLoggerManager,
  createManagedDefaultLogger,
  createLoggerManagerFromLogger,
  resolveManagedLogger,
} from "./logger-manager";

// Logger errors
export {
  LoggerError,
  LoggerConfigurationError,
  LoggerDisposedError,
  LoggerTransportError,
  LoggerFormatterError,
  InvalidLoggerEntryError,
  InvalidLoggerLevelError,
  LoggerTimeoutError,
  LoggerTransportClosedError,
  LoggerFormatterNotFoundError,
  LoggerTransportNotFoundError,
  toLoggerError,
  isLoggerError,
  getLoggerErrorCause,
  createLoggerTransportError,
  createLoggerFormatterError,
} from "./logger-error";