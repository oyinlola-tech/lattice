/**
 * Logger context for Lattice.
 */

import type { LogMetadata } from "../loggerEntry/loggerEntry.type.js";

import type {
  LoggerContext,
  LoggerContextData,
  LoggerContextIdentifiers,
  LoggerContextOptions,
  LoggerContextStorage,
} from "./loggerContext.type.js";

export type {
  LoggerContextValue,
  LoggerContextData,
  LoggerContextIdentifiers,
  LoggerContext,
  LoggerContextOptions,
  LoggerContextStorage,
} from "./loggerContext.type.js";

export { createLoggerContextStorage } from "./loggerContextStorage.js";

export {
  createLoggerContextId,
  createLoggerContext,
  createEmptyLoggerContext,
  mergeLoggerContexts,
  withLoggerContext,
  withLoggerIdentifiers,
} from "./loggerContextCreate.js";

export {
  contextToLogMetadata,
  serializeLoggerContext,
  isLoggerContext,
  getCurrentLoggerContextMetadata,
} from "./loggerContextSerialize.js";
