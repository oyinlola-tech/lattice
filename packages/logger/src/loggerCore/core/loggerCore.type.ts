/**
 * Logger core types and interfaces.
 */

import type {
  LoggerLevel,
} from "../../loggerLevel/loggerLevel.type.js";

import type {
  LogMetadata,
} from "../../loggerEntry/loggerEntry.type.js";

import type {
  LoggerContext,
} from "../../loggerContext/loggerContext.core.js";

import type {
  ChildLoggerOptions,
  LogOptions,
} from "../../loggerOptions/loggerOptions.type.js";

/**
 * Main Lattice logger contract.
 */
export interface Logger {
  readonly name: string;
  readonly level: LoggerLevel;
  readonly enabled: boolean;

  fatal(
    message: string,
    metadata?: LogMetadata,
  ): void;

  error(
    message: string,
    metadata?: LogMetadata,
  ): void;

  warn(
    message: string,
    metadata?: LogMetadata,
  ): void;

  info(
    message: string,
    metadata?: LogMetadata,
  ): void;

  debug(
    message: string,
    metadata?: LogMetadata,
  ): void;

  trace(
    message: string,
    metadata?: LogMetadata,
  ): void;

  log(
    level: LoggerLevel,
    message: string,
    options?: LogOptions,
  ): void;

  child(
    options?: ChildLoggerOptions,
  ): Logger;

  withContext(
    context: LoggerContext,
  ): Logger;

  setLevel(
    level: LoggerLevel,
  ): void;

  enable(): void;

  disable(): void;

  flush(): Promise<void>;

  close(): Promise<void>;
}
