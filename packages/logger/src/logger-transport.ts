/**
 * Logger transports for Lattice.
 *
 * A transport is responsible only for delivering an already-created
 * LoggerEntry to an output destination.
 *
 * Examples:
 *   console
 *   file
 *   remote logging service
 *   database
 *   monitoring system
 *
 * Transports must not create log entries or decide whether a message
 * should be logged. Those responsibilities belong to the Logger.
 */

import type {
  LoggerEntry,
} from "./logger-entry";

/**
 * Configuration passed to transports.
 */
export interface LoggerTransportContext {
  /**
   * Name of the logger that produced the entry.
   */
  readonly loggerName?:
    string;

  /**
   * Environment in which logging is occurring.
   */
  readonly environment?:
    string;

  /**
   * Abort signal for asynchronous transport operations.
   */
  readonly signal?:
    AbortSignal;
}

/**
 * Base transport contract.
 */
export interface LoggerTransport {
  /**
   * Unique transport identifier.
   */
  readonly name:
    string;

  /**
   * Whether the transport is currently enabled.
   */
  readonly enabled:
    boolean;

  /**
   * Writes a log entry.
   */
  write(
    entry:
      LoggerEntry,
    context?:
      LoggerTransportContext,
  ):
    void |
    Promise<void>;

  /**
   * Flushes buffered output.
   */
  flush?():
    void |
    Promise<void>;

  /**
   * Closes the transport.
   */
  close?():
    void |
    Promise<void>;
}

/**
 * Function-based transport.
 */
export type LoggerTransportFunction =
  (
    entry:
      LoggerEntry,
    context:
      LoggerTransportContext,
  ) =>
    void |
    Promise<void>;

/**
 * Transport object or function.
 */
export type LoggerTransportLike =
  | LoggerTransport
  | LoggerTransportFunction;

/**
 * Options for creating a transport.
 */
export interface LoggerTransportOptions {
  /**
   * Transport identifier.
   */
  readonly name?:
    string;

  /**
   * Whether the transport starts enabled.
   */
  readonly enabled?:
    boolean;
}

/**
 * Registered transport.
 */
export interface RegisteredLoggerTransport
  extends LoggerTransport {
  readonly name:
    string;

  readonly enabled:
    boolean;

  readonly transport:
    LoggerTransportLike;
}

/**
 * Creates a transport identifier.
 */
export function createLoggerTransportId():
  string {
  if (
    typeof crypto !==
      "undefined" &&
    typeof crypto.randomUUID ===
      "function"
  ) {
    return `transport:${crypto.randomUUID()}`;
  }

  return [
    "transport",
    Date.now().toString(36),
    Math.random()
      .toString(36)
      .slice(2),
  ].join(":");
}

/**
 * Determines whether a value is a function transport.
 */
export function isLoggerTransportFunction(
  value:
    unknown,
):
  value is LoggerTransportFunction {
  return (
    typeof value ===
    "function"
  );
}

/**
 * Determines whether a value is a transport object.
 */
export function isLoggerTransportObject(
  value:
    unknown,
):
  value is LoggerTransport {
  if (
    typeof value !==
      "object" ||
    value === null
  ) {
    return false;
  }

  const candidate =
    value as {
      name?:
        unknown;

      write?:
        unknown;
    };

  return (
    typeof candidate.name ===
      "string" &&
    candidate.name.length >
      0 &&
    typeof candidate.write ===
      "function"
  );
}

/**
 * Checks whether a value is a valid transport.
 */
export function isLoggerTransport(
  value:
    unknown,
):
  value is LoggerTransportLike {
  return (
    isLoggerTransportFunction(
      value,
    ) ||
    isLoggerTransportObject(
      value,
    )
  );
}

/**
 * Creates a registered transport.
 */
export function createLoggerTransport(
  transport:
    LoggerTransportLike,
  options:
    LoggerTransportOptions = {},
):
  RegisteredLoggerTransport {
  if (
    !isLoggerTransport(
      transport,
    )
  ) {
    throw new TypeError(
      "Invalid logger transport.",
    );
  }

  const name =
    options.name ??
    (
      isLoggerTransportObject(
        transport,
      )
        ? transport.name
        : createLoggerTransportId()
    );

  return Object.freeze({
    name,

    enabled:
      options.enabled ??
      (
        isLoggerTransportObject(
          transport,
        )
          ? transport.enabled
          : true
      ),

    transport,

    write(
      entry:
        LoggerEntry,
      context?:
        LoggerTransportContext,
    ):
      void |
      Promise<void> {
      return writeLoggerTransport(
        transport,
        entry,
        context,
      );
    },

    flush():
      void |
      Promise<void> {
      if (
        isLoggerTransportObject(
          transport,
        ) &&
        transport.flush
      ) {
        return transport.flush();
      }
    },

    close():
      void |
      Promise<void> {
      if (
        isLoggerTransportObject(
          transport,
        ) &&
        transport.close
      ) {
        return transport.close();
      }
    },
  });
}

/**
 * Writes an entry through a transport.
 */
export async function writeLoggerTransport(
  transport:
    LoggerTransportLike,
  entry:
    LoggerEntry,
  context:
    LoggerTransportContext = {},
):
  Promise<void> {
  if (
    isLoggerTransportFunction(
      transport,
    )
  ) {
    await transport(
      entry,
      context,
    );

    return;
  }

  await transport.write(
    entry,
    context,
  );
}

/**
 * Enables a transport.
 */
export function enableLoggerTransport(
  transport:
    RegisteredLoggerTransport,
):
  RegisteredLoggerTransport {
  return createLoggerTransport(
    transport.transport,
    {
      name:
        transport.name,

      enabled:
        true,
    },
  );
}

/**
 * Disables a transport.
 */
export function disableLoggerTransport(
  transport:
    RegisteredLoggerTransport,
):
  RegisteredLoggerTransport {
  return createLoggerTransport(
    transport.transport,
    {
      name:
        transport.name,

      enabled:
        false,
    },
  );
}

/**
 * Creates a simple console transport.
 *
 * Uses the standard console methods rather than depending on
 * Node.js-specific APIs.
 */
export function createConsoleLoggerTransport(
  options:
    LoggerTransportOptions = {},
):
  RegisteredLoggerTransport {
  const transport:
    LoggerTransport = {
    name:
      options.name ??
      "console",

    enabled:
      options.enabled ??
      true,

    write(
      entry,
    ):
      void {
      const payload =
        serializeTransportEntry(
          entry,
        );

      switch (
        entry.levelName
      ) {
        case "fatal":
        case "error":
          console.error(
            payload,
          );
          break;

        case "warn":
          console.warn(
            payload,
          );
          break;

        case "debug":
        case "trace":
          console.debug(
            payload,
          );
          break;

        case "info":
        default:
          console.info(
            payload,
          );
          break;
      }
    },
  };

  return createLoggerTransport(
    transport,
    options,
  );
}

/**
 * Creates a transport that forwards entries to another
 * transport only when a predicate passes.
 */
export function createConditionalLoggerTransport(
  transport:
    LoggerTransportLike,
  predicate:
    (
      entry:
        LoggerEntry,
    ) =>
      boolean |
      Promise<boolean>,
  options:
    LoggerTransportOptions = {},
):
  RegisteredLoggerTransport {
  return createLoggerTransport(
    async (
      entry,
      context,
    ) => {
      if (
        await predicate(
          entry,
        )
      ) {
        await writeLoggerTransport(
          transport,
          entry,
          context,
        );
      }
    },
    options,
  );
}

/**
 * Creates a transport that forwards entries to multiple
 * transports.
 */
export function createMultiLoggerTransport(
  transports:
    readonly LoggerTransportLike[],
  options:
    LoggerTransportOptions = {},
):
  RegisteredLoggerTransport {
  return createLoggerTransport(
    async (
      entry,
      context,
    ) => {
      for (
        const transport of
        transports
      ) {
        await writeLoggerTransport(
          transport,
          entry,
          context,
        );
      }
    },
    options,
  );
}

/**
 * Creates a transport that buffers entries before forwarding
 * them to another transport.
 */
export function createBufferedLoggerTransport(
  transport:
    LoggerTransportLike,
  options:
    LoggerBufferedTransportOptions = {},
):
  RegisteredLoggerTransport {
  const buffer:
    LoggerEntry[] =
    [];

  const maxSize =
    options.maxSize ??
    100;

  const flushInterval =
    options.flushInterval ??
    0;

  let timer:
    ReturnType<typeof setTimeout> |
    undefined;

  const flush =
    async (): Promise<void> => {
      if (
        buffer.length ===
        0
      ) {
        return;
      }

      const entries =
        buffer.splice(
          0,
          buffer.length,
        );

      for (
        const entry of
        entries
      ) {
        await writeLoggerTransport(
          transport,
          entry,
        );
      }
    };

  const scheduleFlush =
    (): void => {
      if (
        flushInterval <=
        0 ||
        timer
      ) {
        return;
      }

      timer =
        setTimeout(
          async () => {
            timer =
              undefined;

            try {
              await flush();
            } catch {
              /**
               * Transport failures are deliberately not
               * rethrown from a timer callback.
               */
            }
          },
          flushInterval,
        );
    };

  const buffered:
    LoggerTransport = {
    name:
      options.name ??
      "buffered",

    enabled:
      options.enabled ??
      true,

    async write(
      entry,
    ) {
      buffer.push(
        entry,
      );

      if (
        buffer.length >=
        maxSize
      ) {
        await flush();
      } else {
        scheduleFlush();
      }
    },

    flush,

    async close() {
      if (
        timer
      ) {
        clearTimeout(
          timer,
        );

        timer =
          undefined;
      }

      await flush();

      if (
        isLoggerTransportObject(
          transport,
        ) &&
        transport.close
      ) {
        await transport.close();
      }
    },
  };

  return createLoggerTransport(
    buffered,
    options,
  );
}

/**
 * Options for buffered logging.
 */
export interface LoggerBufferedTransportOptions
  extends LoggerTransportOptions {
  /**
   * Maximum number of entries held in memory.
   */
  readonly maxSize?:
    number;

  /**
   * Automatic flush interval in milliseconds.
   */
  readonly flushInterval?:
    number;
}

/**
 * Converts a LoggerEntry into a console-friendly object.
 */
export function serializeTransportEntry(
  entry:
    LoggerEntry,
):
  Record<string, unknown> {
  return {
    timestamp:
      entry.timestamp.toISOString(),

    level:
      entry.levelName,

    message:
      entry.message,

    ...(entry.logger
      ? {
          logger:
            entry.logger,
        }
      : {}),

    ...(entry.context
      ? {
          context:
            entry.context,
        }
      : {}),

    ...(entry.metadata
      ? {
          metadata:
            entry.metadata,
        }
      : {}),

    ...(entry.source
      ? {
          source:
            entry.source,
        }
      : {}),

    ...(entry.error
      ? {
          error: {
            name:
              entry.error.name,

            message:
              entry.error.message,

            stack:
              entry.error.stack,
          },
        }
      : {}),
  };
}

/**
 * Safely closes a transport.
 */
export async function closeLoggerTransport(
  transport:
    LoggerTransportLike,
):
  Promise<void> {
  if (
    isLoggerTransportObject(
      transport,
    ) &&
    transport.close
  ) {
    await transport.close();
  }
}

/**
 * Flushes a transport.
 */
export async function flushLoggerTransport(
  transport:
    LoggerTransportLike,
):
  Promise<void> {
  if (
    isLoggerTransportObject(
      transport,
    ) &&
    transport.flush
  ) {
    await transport.flush();
  }
}