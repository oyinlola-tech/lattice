/**
 * Logger context storage implementation.
 */

import type {
  LoggerContext,
  LoggerContextStorage,
} from "./loggerContext.core.js";

import {
  mergeLoggerContexts,
} from "./loggerContext.core.js";

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

    set(
      context:
        LoggerContext,
    ):
      void {
      if (
        stack.length > 0
      ) {
        stack[
          stack.length - 1
        ] = context;
      } else {
        stack.push(
          context,
        );
      }
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
