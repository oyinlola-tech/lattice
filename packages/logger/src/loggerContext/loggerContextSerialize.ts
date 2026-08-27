/**
 * Logger context serialization and type guards.
 */

import type {
  LogMetadata,
} from "../loggerEntry/loggerEntry.type.js";

import type {
  LoggerContext,
  LoggerContextStorage,
} from "./loggerContext.type.js";

/**
 * Converts logger context into log metadata.
 *
 * Identifiers are flattened using their conventional names.
 */
export function contextToLogMetadata(
  context: LoggerContext,
): LogMetadata {
  return {
    ...context.identifiers,
    ...context.metadata,
  };
}

/**
 * Converts logger context into a plain object.
 */
export function serializeLoggerContext(
  context: LoggerContext,
): Record<string, unknown> {
  return {
    identifiers: {
      ...context.identifiers,
    },
    metadata: {
      ...context.metadata,
    },
  };
}

/**
 * Checks whether a value is a LoggerContext.
 */
export function isLoggerContext(
  value: unknown,
): value is LoggerContext {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as {
    identifiers?: unknown;
    metadata?: unknown;
  };

  return (
    typeof candidate.identifiers === "object" &&
    candidate.identifiers !== null &&
    typeof candidate.metadata === "object" &&
    candidate.metadata !== null
  );
}

/**
 * Creates a context-aware metadata object.
 */
export function getCurrentLoggerContextMetadata(
  storage: LoggerContextStorage,
): LogMetadata {
  const context = storage.get();

  if (!context) {
    return {};
  }

  return contextToLogMetadata(context);
}
