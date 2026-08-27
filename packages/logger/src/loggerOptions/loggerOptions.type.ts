import type { LoggerLevel } from "../loggerLevel/loggerLevel.type.js";
import type { LoggerContextData } from "../loggerContext/loggerContext.core.js";
import type { LoggerFormatterLike } from "../loggerFormatter/loggerFormatter.type.js";
import type {
  LoggerTransportLike,
} from "../loggerTransport/loggerTransport.type.js";

/**
 * Options used to configure a Lattice logger.
 */
export interface LoggerOptions {
  /**
   * Logger name.
   */
  readonly name?:
    string;

  /**
   * Minimum level that will be emitted.
   */
  readonly level?:
    LoggerLevel;

  /**
   * Default environment name.
   */
  readonly environment?:
    string;

  /**
   * Default metadata attached to every log entry.
   */
  readonly metadata?:
    LoggerContextData;

  /**
   * Formatter used to transform log entries.
   */
  readonly formatter?:
    LoggerFormatterLike;

  /**
   * Transports receiving formatted log entries.
   */
  readonly transports?:
    readonly LoggerTransportLike[];

  /**
   * Whether logging starts enabled.
   */
  readonly enabled?:
    boolean;

  /**
   * Whether errors from transports should be propagated.
   */
  readonly throwTransportErrors?:
    boolean;

  /**
   * Whether transport writes should happen asynchronously.
   */
  readonly asynchronous?:
    boolean;

  /**
   * Maximum time allowed for a transport operation.
   */
  readonly transportTimeout?:
    number;

  /**
   * Whether metadata should be inherited from the active context.
   */
  readonly inheritContext?:
    boolean;

  /**
   * Whether logger configuration can be changed after creation.
   */
  readonly mutable?:
    boolean;
}

/**
 * Options used when creating a child logger.
 */
export interface ChildLoggerOptions {
  /**
   * Name for the child logger.
   */
  readonly name?:
    string;

  /**
   * Metadata inherited by the child logger.
   */
  readonly metadata?:
    LoggerContextData;

  /**
   * Logger level override.
   */
  readonly level?:
    LoggerLevel;
}

/**
 * Options for a single log operation.
 */
export interface LogOptions {
  /**
   * Metadata specific to this log entry.
   */
  readonly metadata?:
    LoggerContextData;

  /**
   * Context specific to this log entry.
   */
  readonly context?:
    LoggerContextData;

  /**
   * Error associated with the log.
   */
  readonly error?:
    Error;

  /**
   * Source information.
   */
  readonly source?:
    {
      readonly service?:
        string;

      readonly component?:
        string;

      readonly module?:
        string;

      readonly file?:
        string;

      readonly function?:
        string;

      readonly line?:
        number;
    };

  /**
   * Override the logger name for this entry.
   */
  readonly logger?:
    string;

  /**
   * Override the timestamp.
   */
  readonly timestamp?:
    Date;
}

/**
 * Runtime logger configuration.
 */
export interface LoggerConfiguration {
  readonly name:
    string;

  readonly level:
    LoggerLevel;

  readonly environment?:
    string;

  readonly metadata:
    LoggerContextData;

  readonly formatter:
    LoggerFormatterLike;

  readonly transports:
    readonly LoggerTransportLike[];

  readonly enabled:
    boolean;

  readonly throwTransportErrors:
    boolean;

  readonly asynchronous:
    boolean;

  readonly transportTimeout:
    number;

  readonly inheritContext:
    boolean;

  readonly mutable:
    boolean;
}

/**
 * Default logger configuration values.
 */
export const DEFAULT_LOGGER_OPTIONS:
  Required<
    Pick<
      LoggerOptions,
      | "enabled"
      | "throwTransportErrors"
      | "asynchronous"
      | "transportTimeout"
      | "inheritContext"
      | "mutable"
    >
  > = {
  enabled:
    true,

  throwTransportErrors:
    false,

  asynchronous:
    false,

  transportTimeout:
    10_000,

  inheritContext:
    true,

  mutable:
    true,
};

/**
 * Validates logger options.
 */
export function validateLoggerOptions(
  options:
    LoggerOptions,
):
  void {
  if (
    options.name !==
      undefined &&
    (
      typeof options.name !==
        "string" ||
      options.name.trim()
        .length ===
        0
    )
  ) {
    throw new TypeError(
      "Logger name must be a non-empty string.",
    );
  }

  if (
    options.environment !==
      undefined &&
    (
      typeof options.environment !==
        "string" ||
      options.environment.trim()
        .length ===
        0
    )
  ) {
    throw new TypeError(
      "Logger environment must be a non-empty string.",
    );
  }

  if (
    options.transportTimeout !==
      undefined &&
    (
      !Number.isFinite(
        options.transportTimeout,
      ) ||
      options.transportTimeout <
        0
    )
  ) {
    throw new RangeError(
      "Logger transport timeout must be a non-negative finite number.",
    );
  }
}

/**
 * Resolves partial logger options into a normalized configuration.
 */
export function resolveLoggerOptions(
  options:
    LoggerOptions = {},
):
  LoggerConfiguration {
  validateLoggerOptions(
    options,
  );

  return Object.freeze({
    name:
      options.name ??
      "lattice",

    level:
      options.level ??
      3,

    environment:
      options.environment,

    metadata:
      Object.freeze({
        ...(options.metadata ??
          {}),
      }),

    formatter:
      options.formatter ??
      "text",

    transports:
      Object.freeze([
        ...(options.transports ??
          []),
      ]),

    enabled:
      options.enabled ??
      DEFAULT_LOGGER_OPTIONS.enabled,

    throwTransportErrors:
      options.throwTransportErrors ??
      DEFAULT_LOGGER_OPTIONS.throwTransportErrors,

    asynchronous:
      options.asynchronous ??
      DEFAULT_LOGGER_OPTIONS.asynchronous,

    transportTimeout:
      options.transportTimeout ??
      DEFAULT_LOGGER_OPTIONS.transportTimeout,

    inheritContext:
      options.inheritContext ??
      DEFAULT_LOGGER_OPTIONS.inheritContext,

    mutable:
      options.mutable ??
      DEFAULT_LOGGER_OPTIONS.mutable,
  });
}

/**
 * Merges two logger option objects.
 *
 * Values from `override` take precedence.
 */
export function mergeLoggerOptions(
  base:
    LoggerOptions,
  override:
    LoggerOptions,
):
  LoggerOptions {
  return {
    ...base,
    ...override,

    metadata: {
      ...(base.metadata ??
        {}),
      ...(override.metadata ??
        {}),
    },

    transports:
      override.transports ??
      base.transports,
  };
}

/**
 * Creates options for a child logger.
 */
export function createChildLoggerOptions(
  parent:
    LoggerConfiguration,
  options:
    ChildLoggerOptions = {},
):
  LoggerOptions {
  return {
    name:
      options.name ??
      parent.name,

    level:
      options.level ??
      parent.level,

    environment:
      parent.environment,

    metadata: {
      ...parent.metadata,
      ...(options.metadata ??
        {}),
    },

    formatter:
      parent.formatter,

    transports:
      parent.transports,

    enabled:
      parent.enabled,

    throwTransportErrors:
      parent.throwTransportErrors,

    asynchronous:
      parent.asynchronous,

    transportTimeout:
      parent.transportTimeout,

    inheritContext:
      parent.inheritContext,

    mutable:
      parent.mutable,
  };
}