/**
 * @zudojs/testing — Spy logger types.
 *
 * Types for the spy logger used in testing.
 */

import type { Logger, LoggerLevel, LogMetadata } from "@zudojs/logger";

/** A recorded log call. */
export interface LogCall {
  readonly method: string;
  readonly level: LoggerLevel;
  readonly message: string;
  readonly metadata?: LogMetadata;
  readonly timestamp: Date;
}

/** A spy logger that records all log calls. */
export interface SpyLogger extends Logger {
  readonly calls: readonly LogCall[];
  clear: () => void;
  findByMethod: (method: string) => readonly LogCall[];
  findByMessage: (substring: string) => readonly LogCall[];
  findByMetadata: (key: string, value: unknown) => readonly LogCall[];
}
