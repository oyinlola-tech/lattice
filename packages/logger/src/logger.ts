import {
  LoggerLevel,
  shouldLog,
} from "./logger-level";

import type {
  LoggerEntry,
  LoggerEntryInput,
  LogMetadata,
} from "./logger-entry";

import {
  createLoggerEntry,
  createErrorLoggerEntry,
} from "./logger-entry";

import type {
  LoggerContext,
  LoggerContextStorage,
} from "./logger-context";

import {
  contextToLogMetadata,
  createLoggerContext,
  createLoggerContextStorage,
} from "./logger-context";

import type {
  LoggerFormatterLike,
} from "./logger-formatter";

import {
  createTextLoggerFormatter,
  formatLoggerEntry,
  isLoggerFormatter,
} from "./logger-formatter";

import type {
  LoggerTransportLike,
  LoggerTransportContext,
} from "./logger-transport";

import {
  createConsoleLoggerTransport,
  createLoggerTransport,
  isLoggerTransport,
  writeLoggerTransport,
} from "./logger-transport";

import {
  LoggerConfigurationError,
  LoggerDisposedError,
  LoggerFormatterError,
  LoggerTransportError,
  toLoggerError,
} from "./logger-error";

import type {
  ChildLoggerOptions,
  LoggerConfiguration,
  LoggerOptions,
  LogOptions,
} from "./logger-options";

import {
  resolveLoggerOptions,
  createChildLoggerOptions,
} from "./logger-options";

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

/**
 * Logger implementation.
 */
export class LatticeLogger
  implements Logger {
  private configuration: LoggerConfiguration;

  private readonly contextStorage: LoggerContextStorage;

  private disposed = false;

  constructor(
    options: LoggerOptions = {},
    contextStorage?: LoggerContextStorage,
  ) {
    this.configuration =
      resolveLoggerOptions(
        options,
      );

    this.contextStorage =
      contextStorage ??
      createLoggerContextStorage();

    this.configuration =
      this.normalizeConfiguration(
        this.configuration,
      );
  }

  get name(): string {
    this.assertActive();

    return this.configuration.name;
  }

  get level(): LoggerLevel {
    this.assertActive();

    return this.configuration.level;
  }

  get enabled(): boolean {
    return (
      !this.disposed &&
      this.configuration.enabled
    );
  }

  fatal(
    message: string,
    metadata?: LogMetadata,
  ): void {
    this.log(
      LoggerLevel.FATAL,
      message,
      {
        metadata,
      },
    );
  }

  error(
    message: string,
    metadata?: LogMetadata,
  ): void {
    this.log(
      LoggerLevel.ERROR,
      message,
      {
        metadata,
      },
    );
  }

  warn(
    message: string,
    metadata?: LogMetadata,
  ): void {
    this.log(
      LoggerLevel.WARN,
      message,
      {
        metadata,
      },
    );
  }

  info(
    message: string,
    metadata?: LogMetadata,
  ): void {
    this.log(
      LoggerLevel.INFO,
      message,
      {
        metadata,
      },
    );
  }

  debug(
    message: string,
    metadata?: LogMetadata,
  ): void {
    this.log(
      LoggerLevel.DEBUG,
      message,
      {
        metadata,
      },
    );
  }

  trace(
    message: string,
    metadata?: LogMetadata,
  ): void {
    this.log(
      LoggerLevel.TRACE,
      message,
      {
        metadata,
      },
    );
  }

  log(
    level: LoggerLevel,
    message: string,
    options: LogOptions = {},
  ): void {
    this.assertActive();

    if (
      !this.configuration.enabled ||
      !shouldLog(
        this.configuration.level,
        level,
      )
    ) {
      return;
    }

    if (
      typeof message !==
        "string"
    ) {
      throw new LoggerConfigurationError(
        "Logger message must be a string.",
      );
    }

    const entry =
      this.createEntry(
        level,
        message,
        options,
      );

    void this.dispatch(
      entry,
    );
  }

  child(
    options: ChildLoggerOptions = {},
  ): Logger {
    this.assertActive();

    const childOptions =
      createChildLoggerOptions(
        this.configuration,
        options,
      );

    return new LatticeLogger(
      childOptions,
      this.contextStorage,
    );
  }

  withContext(
    context: LoggerContext,
  ): Logger {
    this.assertActive();

    const child =
      this.child();

    return new ContextLogger(
      child,
      context,
    );
  }

  setLevel(
    level: LoggerLevel,
  ): void {
    this.assertActive();

    if (
      !Number.isInteger(level) ||
      level < LoggerLevel.FATAL ||
      level > LoggerLevel.TRACE
    ) {
      throw new LoggerConfigurationError(
        `Invalid logger level: ${String(level)}.`,
      );
    }

    this.assertMutable();

    this.configuration =
      Object.freeze({
        ...this.configuration,
        level,
      });
  }

  enable(): void {
    this.assertActive();
    this.assertMutable();

    this.configuration =
      Object.freeze({
        ...this.configuration,
        enabled: true,
      });
  }

  disable(): void {
    this.assertActive();
    this.assertMutable();

    this.configuration =
      Object.freeze({
        ...this.configuration,
        enabled: false,
      });
  }

  async flush(): Promise<void> {
    this.assertActive();

    const transports =
      this.configuration.transports;

    for (
      const transport of transports
    ) {
      if (
        !isLoggerTransport(
          transport,
        )
      ) {
        continue;
      }

      const registered =
        createLoggerTransport(
          transport,
        );

      if (
        !registered.enabled
      ) {
        continue;
      }

      if (
        registered.flush
      ) {
        await registered.flush();
      }
    }
  }

  async close(): Promise<void> {
    if (
      this.disposed
    ) {
      return;
    }

    for (
      const transport of
      this.configuration.transports
    ) {
      if (
        !isLoggerTransport(
          transport,
        )
      ) {
        continue;
      }

      const registered =
        createLoggerTransport(
          transport,
        );

      if (
        registered.close
      ) {
        await registered.close();
      }
    }

    this.disposed = true;
  }

  /**
   * Creates a normalized log entry.
   */
  private createEntry(
    level: LoggerLevel,
    message: string,
    options: LogOptions,
  ): LoggerEntry {
    const activeContext =
      this.configuration.inheritContext
        ? this.contextStorage.get()
        : undefined;

    const contextMetadata =
      activeContext
        ? contextToLogMetadata(
            activeContext,
          )
        : {};

    const metadata: LogMetadata = {
      ...this.configuration.metadata,
      ...contextMetadata,
      ...(options.metadata ?? {}),
    };

    const context =
      options.context
        ? createLoggerContext({
            parent:
              activeContext,
            metadata:
              options.context,
          })
        : activeContext;

    const input: LoggerEntryInput =
      {
        level,
        message,
        metadata,
        context: context
          ? {
              metadata:
                context.metadata,
            }
          : undefined,
        source:
          options.source,
        error:
          options.error,
        logger:
          options.logger ??
          this.configuration.name,
        timestamp:
          options.timestamp,
        environment:
          this.configuration.environment,
      };

    return createLoggerEntry(
      input,
    );
  }

  /**
   * Dispatches an entry to the configured transports.
   */
  private async dispatch(
    entry: LoggerEntry,
  ): Promise<void> {
    const formatter =
      this.configuration.formatter;

    let formatted:
      unknown;

    try {
      if (
        typeof formatter ===
          "string"
      ) {
        formatted =
          this.defaultFormat(
            entry,
          );
      } else {
        formatted =
          formatLoggerEntry(
            formatter,
            entry,
            {
              loggerName:
                this.configuration.name,
              environment:
                this.configuration.environment,
            },
          );
      }
    } catch (
      error
    ) {
      const formatterError =
        new LoggerFormatterError(
          `Failed to format log entry: ${
            toLoggerError(error).message
          }`,
          {
            cause: error,
          },
        );

      this.handleInfrastructureError(
        formatterError,
      );

      return;
    }

    const transports =
      this.configuration.transports;

    for (
      const transport of
      transports
    ) {
      try {
        if (
          !isLoggerTransport(
            transport,
          )
        ) {
          continue;
        }

        const registered =
          createLoggerTransport(
            transport,
          );

        if (
          !registered.enabled
        ) {
          continue;
        }

        await this.writeTransport(
          registered,
          entry,
          formatted,
        );
      } catch (
        error
      ) {
        const transportError =
          new LoggerTransportError(
            `Failed to write log entry: ${
              toLoggerError(error).message
            }`,
            {
              cause: error,
            },
          );

        this.handleInfrastructureError(
          transportError,
        );
      }
    }
  }

  /**
   * Writes to a transport.
   */
  private async writeTransport(
    transport: ReturnType<
      typeof createLoggerTransport
    >,
    entry: LoggerEntry,
    formatted: unknown,
  ): Promise<void> {
    const transportContext:
      LoggerTransportContext =
      {
        loggerName:
          this.configuration.name,
        environment:
          this.configuration.environment,
      };

    if (
      typeof formatted ===
        "string"
    ) {
      const formattedEntry =
        {
          ...entry,
          message:
            formatted,
        };

      await writeLoggerTransport(
        transport.transport,
        formattedEntry,
        transportContext,
      );

      return;
    }

    await writeLoggerTransport(
      transport.transport,
      entry,
      transportContext,
    );
  }

  /**
   * Default formatter used when no formatter is configured.
   */
  private defaultFormat(
    entry: LoggerEntry,
  ): string {
    return createTextLoggerFormatter({
      name: "default",
    }).format(
      entry,
      {
        loggerName:
          this.configuration.name,
        environment:
          this.configuration.environment,
      },
    );
  }

  private normalizeConfiguration(
    configuration: LoggerConfiguration,
  ): LoggerConfiguration {
    let formatter =
      configuration.formatter;

    if (
      typeof formatter ===
        "string"
    ) {
      formatter =
        createTextLoggerFormatter();
    } else if (
      !isLoggerFormatter(
        formatter,
      )
    ) {
      formatter =
        createTextLoggerFormatter();
    }

    let transports =
      configuration.transports;

    if (
      transports.length ===
      0
    ) {
      transports = [
        createConsoleLoggerTransport(),
      ];
    }

    return Object.freeze({
      ...configuration,
      formatter,
      transports,
    });
  }

  private handleInfrastructureError(
    error: Error,
  ): void {
    if (
      this.configuration.throwTransportErrors
    ) {
      throw error;
    }
  }

  private assertActive(): void {
    if (
      this.disposed
    ) {
      throw new LoggerDisposedError(
        this.configuration.name,
      );
    }
  }

  private assertMutable(): void {
    if (
      !this.configuration.mutable
    ) {
      throw new LoggerConfigurationError(
        "Logger configuration is immutable.",
      );
    }
  }
}

/**
 * Logger wrapper that provides scoped context.
 */
class ContextLogger
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

  fatal(
    message: string,
    metadata?: LogMetadata,
  ): void {
    this.run(
      () =>
        this.logger.fatal(
          message,
          metadata,
        ),
    );
  }

  error(
    message: string,
    metadata?: LogMetadata,
  ): void {
    this.run(
      () =>
        this.logger.error(
          message,
          metadata,
        ),
    );
  }

  warn(
    message: string,
    metadata?: LogMetadata,
  ): void {
    this.run(
      () =>
        this.logger.warn(
          message,
          metadata,
        ),
    );
  }

  info(
    message: string,
    metadata?: LogMetadata,
  ): void {
    this.run(
      () =>
        this.logger.info(
          message,
          metadata,
        ),
    );
  }

  debug(
    message: string,
    metadata?: LogMetadata,
  ): void {
    this.run(
      () =>
        this.logger.debug(
          message,
          metadata,
        ),
    );
  }

  trace(
    message: string,
    metadata?: LogMetadata,
  ): void {
    this.run(
      () =>
        this.logger.trace(
          message,
          metadata,
        ),
    );
  }

  log(
    level: LoggerLevel,
    message: string,
    options?: LogOptions,
  ): void {
    this.run(
      () =>
        this.logger.log(
          level,
          message,
          options,
        ),
    );
  }

  child(
    options?: ChildLoggerOptions,
  ): Logger {
    return new ContextLogger(
      this.logger.child(
        options,
      ),
      this.context,
    );
  }

  withContext(
    context: LoggerContext,
  ): Logger {
    return new ContextLogger(
      this.logger,
      createLoggerContext({
        parent:
          this.context,
        ...context.identifiers,
        metadata:
          context.metadata,
      }),
    );
  }

  setLevel(
    level: LoggerLevel,
  ): void {
    this.logger.setLevel(
      level,
    );
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

  private run(
    callback: () => void,
  ): void {
    const storage =
      createLoggerContextStorage();

    storage.run(
      this.context,
      callback,
    );
  }
}

/**
 * Creates a Lattice logger.
 */
export function createLogger(
  options: LoggerOptions = {},
): Logger {
  return new LatticeLogger(
    options,
  );
}

/**
 * Creates a child logger.
 */
export function createChildLogger(
  parent: Logger,
  options: ChildLoggerOptions = {},
): Logger {
  return parent.child(
    options,
  );
}

/**
 * Creates a logger specifically for an error.
 */
export function logError(
  logger: Logger,
  error: Error,
  message?: string,
  metadata?: LogMetadata,
): void {
  if (
    !logger.enabled
  ) {
    return;
  }

  logger.log(
    LoggerLevel.ERROR,
    message ??
      error.message,
    {
      metadata,
      error,
    },
  );
}

/**
 * Creates a logger context and executes a callback inside it.
 */
export function withLoggerContext<T>(
  logger: Logger,
  context: LoggerContext,
  callback: () => T,
): T {
  const scoped =
    logger.withContext(
      context,
    );

  if (
    scoped instanceof ContextLogger
  ) {
    return callback();
  }

  return callback();
}

/**
 * Creates a default application logger.
 */
export function createDefaultLogger(
  name = "lattice",
): Logger {
  return createLogger({
    name,
    level:
      LoggerLevel.INFO,
    formatter:
      createTextLoggerFormatter(),
    transports: [
      createConsoleLoggerTransport(),
    ],
  });
}