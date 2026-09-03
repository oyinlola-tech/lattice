/**
 * @zudo/testing — Spy logger for testing.
 *
 * Records all log calls for assertion without side effects.
 */

import type {
  LoggerLevel,
  LogMetadata,
  ChildLoggerOptions,
  LoggerContext,
} from "@zudo/logger";
import type { LogCall, SpyLogger } from "./spyLogger.type.js";

function recordCall(
  calls: LogCall[],
  method: string,
  level: LoggerLevel,
  message: string,
  metadata?: LogMetadata,
): void {
  calls.push({ method, level, message, metadata, timestamp: new Date() });
}

/**
 * Creates a spy logger that records all log calls.
 *
 * @param name - Logger name.
 * @param level - Optional minimum level (defaults to TRACE = all).
 * @returns A SpyLogger instance.
 */
export function createSpyLogger(
  name = "test",
  level: LoggerLevel = 5 as LoggerLevel,
): SpyLogger {
  const calls: LogCall[] = [];

  return {
    get name(): string {
      return name;
    },
    get level(): LoggerLevel {
      return level;
    },
    get enabled(): boolean {
      return true;
    },
    get calls(): readonly LogCall[] {
      return calls;
    },

    fatal: (message: string, metadata?: LogMetadata) => {
      recordCall(calls, "fatal", 0 as LoggerLevel, message, metadata);
    },
    error: (message: string, metadata?: LogMetadata) => {
      recordCall(calls, "error", 1 as LoggerLevel, message, metadata);
    },
    warn: (message: string, metadata?: LogMetadata) => {
      recordCall(calls, "warn", 2 as LoggerLevel, message, metadata);
    },
    info: (message: string, metadata?: LogMetadata) => {
      recordCall(calls, "info", 3 as LoggerLevel, message, metadata);
    },
    debug: (message: string, metadata?: LogMetadata) => {
      recordCall(calls, "debug", 4 as LoggerLevel, message, metadata);
    },
    trace: (message: string, metadata?: LogMetadata) => {
      recordCall(calls, "trace", 5 as LoggerLevel, message, metadata);
    },

    log: (
      logLevel: LoggerLevel,
      message: string,
      options?: { metadata?: LogMetadata },
    ) => {
      recordCall(calls, "log", logLevel, message, options?.metadata);
    },

    child: (_options?: ChildLoggerOptions) =>
      createSpyLogger(`${name}.child`, level),
    withContext: (_context: LoggerContext) => createSpyLogger(name, level),
    setLevel: (newLevel: LoggerLevel) => {
      level = newLevel;
    },
    enable: () => {},
    disable: () => {},
    flush: async () => {},
    close: async () => {},

    clear: () => {
      calls.length = 0;
    },
    findByMethod: (method: string) => calls.filter((c) => c.method === method),
    findByMessage: (substring: string) =>
      calls.filter((c) => c.message.includes(substring)),
    findByMetadata: (key: string, value: unknown) =>
      calls.filter(
        (c) => c.metadata !== undefined && c.metadata[key] === value,
      ),
  };
}
