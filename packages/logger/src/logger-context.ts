/**
 * Logger context for Lattice.
 *
 * LoggerContext provides scoped metadata that automatically follows
 * log entries through requests, jobs, events, modules, and other
 * execution boundaries.
 *
 * The implementation intentionally avoids coupling the logger to
 * HTTP, Fastify, Express, Node.js, or any specific runtime.
 */

import type {
  LogMetadata,
} from "./logger-entry";

/**
 * Context values accepted by the logger.
 */
export type LoggerContextValue =
  | string
  | number
  | boolean
  | bigint
  | null
  | undefined
  | Date
  | Error
  | readonly unknown[]
  | {
      readonly [key: string]:
        unknown;
    };

/**
 * Logger context data.
 */
export type LoggerContextData =
  Readonly<
    Record<
      string,
      LoggerContextValue
    >
  >;

/**
 * Standard context identifiers.
 */
export interface LoggerContextIdentifiers {
  readonly correlationId?:
    string;

  readonly requestId?:
    string;

  readonly traceId?:
    string;

  readonly spanId?:
    string;

  readonly userId?:
    string;

  readonly tenantId?:
    string;

  readonly sessionId?:
    string;

  readonly jobId?:
    string;

  readonly moduleId?:
    string;

  readonly operationId?:
    string;
}

/**
 * Complete logger context.
 */
export interface LoggerContext {
  /**
   * Standard identifiers.
   */
  readonly identifiers:
    LoggerContextIdentifiers;

  /**
   * Arbitrary structured metadata.
   */
  readonly metadata:
    LoggerContextData;
}

/**
 * Options used to create a logger context.
 */
export interface LoggerContextOptions
  extends LoggerContextIdentifiers {
  readonly metadata?:
    LoggerContextData;

  /**
   * Optional parent context.
   *
   * Parent metadata is inherited and can be overridden
   * by the new context.
   */
  readonly parent?:
    LoggerContext;
}

/**
 * Generates a unique context identifier.
 */
export function createLoggerContextId():
  string {
  if (
    typeof crypto !==
      "undefined" &&
    typeof crypto.randomUUID ===
      "function"
  ) {
    return `ctx:${crypto.randomUUID()}`;
  }

  return [
    "ctx",
    Date.now().toString(36),
    Math.random()
      .toString(36)
      .slice(2),
  ].join(":");
}

/**
 * Creates a logger context.
 */
export function createLoggerContext(
  options:
    LoggerContextOptions = {},
):
  LoggerContext {
  const parent =
    options.parent;

  const identifiers:
    LoggerContextIdentifiers =
    Object.freeze({
      ...(parent?.identifiers ??
        {}),

      ...(options.correlationId !==
      undefined
        ? {
            correlationId:
              options.correlationId,
          }
        : {}),

      ...(options.requestId !==
      undefined
        ? {
            requestId:
              options.requestId,
          }
        : {}),

      ...(options.traceId !==
      undefined
        ? {
            traceId:
              options.traceId,
          }
        : {}),

      ...(options.spanId !==
      undefined
        ? {
            spanId:
              options.spanId,
          }
        : {}),

      ...(options.userId !==
      undefined
        ? {
            userId:
              options.userId,
          }
        : {}),

      ...(options.tenantId !==
      undefined
        ? {
            tenantId:
              options.tenantId,
          }
        : {}),

      ...(options.sessionId !==
      undefined
        ? {
            sessionId:
              options.sessionId,
          }
        : {}),

      ...(options.jobId !==
      undefined
        ? {
            jobId:
              options.jobId,
          }
        : {}),

      ...(options.moduleId !==
      undefined
        ? {
            moduleId:
              options.moduleId,
          }
        : {}),

      ...(options.operationId !==
      undefined
        ? {
            operationId:
              options.operationId,
          }
        : {}),
    });

  const metadata:
    LoggerContextData =
    Object.freeze({
      ...(parent?.metadata ??
        {}),
      ...(options.metadata ??
        {}),
    });

  return Object.freeze({
    identifiers,

    metadata,
  });
}

/**
 * Creates an empty logger context.
 */
export function createEmptyLoggerContext():
  LoggerContext {
  return createLoggerContext();
}

/**
 * Merges two logger contexts.
 *
 * Values in `override` take precedence.
 */
export function mergeLoggerContexts(
  base:
    LoggerContext,
  override:
    LoggerContext,
):
  LoggerContext {
  return createLoggerContext({
    parent:
      base,

    ...override.identifiers,

    metadata:
      override.metadata,
  });
}

/**
 * Extends a logger context with metadata.
 */
export function withLoggerContext(
  context:
    LoggerContext,
  metadata:
    LoggerContextData,
):
  LoggerContext {
  return createLoggerContext({
    parent:
      context,

    metadata,
  });
}

/**
 * Extends a logger context with identifiers.
 */
export function withLoggerIdentifiers(
  context:
    LoggerContext,
  identifiers:
    LoggerContextIdentifiers,
):
  LoggerContext {
  return createLoggerContext({
    parent:
      context,

    ...identifiers,
  });
}

/**
 * Converts logger context into log metadata.
 *
 * Identifiers are flattened using their conventional names.
 */
export function contextToLogMetadata(
  context:
    LoggerContext,
):
  LogMetadata {
  return {
    ...context.identifiers,

    ...context.metadata,
  };
}

/**
 * Converts logger context into a plain object.
 */
export function serializeLoggerContext(
  context:
    LoggerContext,
):
  Record<string, unknown> {
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
  value:
    unknown,
):
  value is LoggerContext {
  if (
    typeof value !==
      "object" ||
    value === null
  ) {
    return false;
  }

  const candidate =
    value as {
      identifiers?:
        unknown;

      metadata?:
        unknown;
    };

  return (
    typeof candidate.identifiers ===
      "object" &&
    candidate.identifiers !==
      null &&
    typeof candidate.metadata ===
      "object" &&
    candidate.metadata !==
      null
  );
}

/**
 * Logger context storage.
 *
 * AsyncLocalStorage is used when running under Node.js.
 * A fallback stack is provided for environments where
 * AsyncLocalStorage is unavailable.
 */
export interface LoggerContextStorage {
  /**
   * Returns the currently active context.
   */
  get():
    LoggerContext |
    undefined;

  /**
   * Runs a callback inside a context.
   */
  run<T>(
    context:
      LoggerContext,
    callback:
      () => T,
  ):
    T;

  /**
   * Runs a callback inside an extended context.
   */
  with<T>(
    context:
      LoggerContext,
    callback:
      () => T,
  ):
    T;

  /**
   * Clears the current context.
   */
  clear():
    void;
}

/**
 * Creates context storage.
 *
 * This implementation uses a lightweight fallback stack so the
 * logger package remains runtime-agnostic and does not require
 * Node-specific dependencies.
 */
export function createLoggerContextStorage():
  LoggerContextStorage {
  const stack:
    LoggerContext[] =
    [];

  return {
    get():
      LoggerContext |
      undefined {
      return stack[
        stack.length - 1
      ];
    },

    run<T>(
      context:
        LoggerContext,
      callback:
        () => T,
    ):
      T {
      stack.push(
        context,
      );

      try {
        return callback();
      } finally {
        stack.pop();
      }
    },

    with<T>(
      context:
        LoggerContext,
      callback:
        () => T,
    ):
      T {
      const current =
        stack[
          stack.length - 1
        ];

      const merged =
        current
          ? mergeLoggerContexts(
              current,
              context,
            )
          : context;

      return this.run(
        merged,
        callback,
      );
    },

    clear():
      void {
      stack.length =
        0;
    },
  };
}

/**
 * Creates a context-aware metadata object.
 */
export function getCurrentLoggerContextMetadata(
  storage:
    LoggerContextStorage,
):
  LogMetadata {
  const context =
    storage.get();

  if (
    !context
  ) {
    return {};
  }

  return contextToLogMetadata(
    context,
  );
}