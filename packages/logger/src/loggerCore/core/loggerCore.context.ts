/**
 * ContextLogger wrapper implementation.
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

import {
  createLoggerContext,
} from "../../loggerContext/loggerContext.core.js";

import {
  createLoggerContextStorage,
} from "../../loggerContext/loggerContextStorage.js";

import type {
  ChildLoggerOptions,
  LogOptions,
} from "../../loggerOptions/loggerOptions.type.js";

import type {
  Logger,
} from "./loggerCore.type.js";

/**
 * Logger wrapper that provides scoped context.
 */
export class ContextLogger
  implements Logger {
  constructor(
    private readonly logger: Logger,
    private readonly context: LoggerContext,
  ) {}

  get name(): string {
    return this.logger.name;
  }

  get level(): LoggerLevel {
    return this.logger.level;
  }

  get enabled(): boolean {
    return this.logger.enabled;
  }

  fatal(message: string, metadata?: LogMetadata): void {
    this.run(() => this.logger.fatal(message, metadata));
  }

  error(message: string, metadata?: LogMetadata): void {
    this.run(() => this.logger.error(message, metadata));
  }

  warn(message: string, metadata?: LogMetadata): void {
    this.run(() => this.logger.warn(message, metadata));
  }

  info(message: string, metadata?: LogMetadata): void {
    this.run(() => this.logger.info(message, metadata));
  }

  debug(message: string, metadata?: LogMetadata): void {
    this.run(() => this.logger.debug(message, metadata));
  }

  trace(message: string, metadata?: LogMetadata): void {
    this.run(() => this.logger.trace(message, metadata));
  }

  log(level: LoggerLevel, message: string, options?: LogOptions): void {
    this.run(() => this.logger.log(level, message, options));
  }

  child(options?: ChildLoggerOptions): Logger {
    return new ContextLogger(this.logger.child(options), this.context);
  }

  withContext(context: LoggerContext): Logger {
    return new ContextLogger(
      this.logger,
      createLoggerContext({
        parent: this.context,
        ...context.identifiers,
        metadata: context.metadata,
      }),
    );
  }

  setLevel(level: LoggerLevel): void {
    this.logger.setLevel(level);
  }

  enable(): void {
    this.logger.enable();
  }

  disable(): void {
    this.logger.disable();
  }

  flush(): Promise<void> {
    return this.logger.flush();
  }

  close(): Promise<void> {
    return this.logger.close();
  }

  private run(callback: () => void): void {
    const storage = createLoggerContextStorage();
    storage.run(this.context, callback);
  }
}
