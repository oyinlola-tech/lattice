import type {
  ApplicationContext,
} from "../application/application-context.js";

import type {
  ConfigurationManager,
} from "../configuration/configuration-manager.js";

import type {
  Logger,
} from "../logging/logger.js";

import type {
  ModuleLoader,
} from "../modules/module-loader.js";

import type {
  ModuleLifecycleManager,
} from "../modules/module-lifecycle.js";

import type {
  ModuleRegistry,
} from "../modules/module-registry.js";

/**
 * Runtime execution mode.
 *
 * This describes how the application is expected to run.
 */
export type RuntimeMode =
  | "development"
  | "test"
  | "production";

/**
 * Runtime role.
 *
 * A runtime can represent an API server, worker, CLI process,
 * scheduler, or a generic application process.
 */
export type RuntimeRole =
  | "application"
  | "api"
  | "worker"
  | "scheduler"
  | "cli";

/**
 * Options controlling runtime startup behavior.
 */
export interface RuntimeStartupOptions {
  /**
   * Automatically load modules marked for auto loading.
   *
   * Defaults to true.
   */
  readonly autoLoadModules?: boolean;

  /**
   * Automatically initialize loaded modules.
   *
   * Defaults to true.
   */
  readonly autoInitializeModules?: boolean;

  /**
   * Automatically start initialized modules.
   *
   * Defaults to true.
   */
  readonly autoStartModules?: boolean;

  /**
   * Continue initialization if a module fails.
   *
   * Defaults to false.
   */
  readonly continueOnInitializeError?: boolean;

  /**
   * Continue startup if a module fails.
   *
   * Defaults to false.
   */
  readonly continueOnStartError?: boolean;

  /**
   * Maximum time allowed for startup.
   *
   * A value of 0 disables the timeout.
   *
   * Defaults to 0.
   */
  readonly timeoutMs?: number;
}

/**
 * Options controlling runtime shutdown.
 */
export interface RuntimeShutdownOptions {
  /**
   * Automatically stop modules during shutdown.
   *
   * Defaults to true.
   */
  readonly autoStopModules?: boolean;

  /**
   * Automatically destroy modules during shutdown.
   *
   * Defaults to true.
   */
  readonly autoDestroyModules?: boolean;

  /**
   * Continue stopping modules if one module fails.
   *
   * Defaults to true.
   */
  readonly continueOnStopError?: boolean;

  /**
   * Continue destroying modules if one module fails.
   *
   * Defaults to true.
   */
  readonly continueOnDestroyError?: boolean;

  /**
   * Maximum time allowed for graceful shutdown.
   *
   * A value of 0 disables the timeout.
   *
   * Defaults to 30_000 ms.
   */
  readonly timeoutMs?: number;
}

/**
 * Options related to runtime process signals.
 */
export interface RuntimeSignalOptions {
  /**
   * Handle SIGINT.
   *
   * Defaults to true.
   */
  readonly handleSigint?: boolean;

  /**
   * Handle SIGTERM.
   *
   * Defaults to true.
   */
  readonly handleSigterm?: boolean;

  /**
   * Handle SIGHUP.
   *
   * Defaults to false.
   */
  readonly handleSighup?: boolean;

  /**
   * Handle uncaught exceptions.
   *
   * Defaults to true.
   */
  readonly handleUncaughtException?: boolean;

  /**
   * Handle unhandled promise rejections.
   *
   * Defaults to true.
   */
  readonly handleUnhandledRejection?: boolean;
}

/**
 * Options controlling runtime diagnostics.
 */
export interface RuntimeDiagnosticsOptions {
  /**
   * Enable runtime startup diagnostics.
   *
   * Defaults to true.
   */
  readonly startupLogging?: boolean;

  /**
   * Enable runtime shutdown diagnostics.
   *
   * Defaults to true.
   */
  readonly shutdownLogging?: boolean;

  /**
   * Include runtime state information in diagnostic output.
   *
   * Defaults to true.
   */
  readonly includeState?: boolean;

  /**
   * Include loaded module information in diagnostics.
   *
   * Defaults to true.
   */
  readonly includeModules?: boolean;
}

/**
 * Dependencies that can be supplied to the runtime.
 *
 * Keeping these injectable makes the runtime easy to test and
 * prevents it from constructing global infrastructure itself.
 */
export interface RuntimeInfrastructure {
  /**
   * Application context.
   */
  readonly application:
    ApplicationContext;

  /**
   * Configuration manager.
   */
  readonly configuration:
    ConfigurationManager;

  /**
   * Logger.
   */
  readonly logger:
    Logger;

  /**
   * Module registry.
   */
  readonly moduleRegistry:
    ModuleRegistry;

  /**
   * Module loader.
   */
  readonly moduleLoader:
    ModuleLoader;

  /**
   * Module lifecycle manager.
   */
  readonly moduleLifecycle:
    ModuleLifecycleManager;
}

/**
 * Complete runtime options.
 */
export interface RuntimeOptions {
  /**
   * Human readable runtime name.
   *
   * Defaults to "application".
   */
  readonly name?: string;

  /**
   * Runtime mode.
   *
   * Defaults to "development".
   */
  readonly mode?: RuntimeMode;

  /**
   * Runtime role.
   *
   * Defaults to "application".
   */
  readonly role?: RuntimeRole;

  /**
   * Runtime startup behavior.
   */
  readonly startup?:
    RuntimeStartupOptions;

  /**
   * Runtime shutdown behavior.
   */
  readonly shutdown?:
    RuntimeShutdownOptions;

  /**
   * Operating system signal behavior.
   */
  readonly signals?:
    RuntimeSignalOptions;

  /**
   * Runtime diagnostic behavior.
   */
  readonly diagnostics?:
    RuntimeDiagnosticsOptions;

  /**
   * Infrastructure dependencies.
   *
   * These can be provided by the application bootstrap layer.
   */
  readonly infrastructure?:
    Partial<RuntimeInfrastructure>;

  /**
   * Arbitrary runtime metadata.
   */
  readonly metadata?:
    Readonly<
      Record<string, unknown>
    >;
}

/**
 * Fully normalized runtime options.
 */
export interface ResolvedRuntimeOptions {
  readonly name:
    string;

  readonly mode:
    RuntimeMode;

  readonly role:
    RuntimeRole;

  readonly startup:
    Required<RuntimeStartupOptions>;

  readonly shutdown:
    Required<RuntimeShutdownOptions>;

  readonly signals:
    Required<RuntimeSignalOptions>;

  readonly diagnostics:
    Required<RuntimeDiagnosticsOptions>;

  readonly infrastructure:
    Partial<RuntimeInfrastructure>;

  readonly metadata:
    Readonly<
      Record<string, unknown>
    >;
}

/**
 * Default runtime configuration.
 */
export const DEFAULT_RUNTIME_OPTIONS:
  Readonly<
    Omit<
      ResolvedRuntimeOptions,
      "infrastructure" |
        "metadata"
    >
  > = Object.freeze({
    name:
      "application",

    mode:
      "development",

    role:
      "application",

    startup: {
      autoLoadModules:
        true,

      autoInitializeModules:
        true,

      autoStartModules:
        true,

      continueOnInitializeError:
        false,

      continueOnStartError:
        false,

      timeoutMs:
        0,
    },

    shutdown: {
      autoStopModules:
        true,

      autoDestroyModules:
        true,

      continueOnStopError:
        true,

      continueOnDestroyError:
        true,

      timeoutMs:
        30_000,
    },

    signals: {
      handleSigint:
        true,

      handleSigterm:
        true,

      handleSighup:
        false,

      handleUncaughtException:
        true,

      handleUnhandledRejection:
        true,
    },

    diagnostics: {
      startupLogging:
        true,

      shutdownLogging:
        true,

      includeState:
        true,

      includeModules:
        true,
    },
  });

/**
 * Resolves partial runtime options into a complete immutable
 * runtime configuration.
 */
export function resolveRuntimeOptions(
  options:
    RuntimeOptions = {},
): ResolvedRuntimeOptions {
  const startup =
    options.startup ?? {};

  const shutdown =
    options.shutdown ?? {};

  const signals =
    options.signals ?? {};

  const diagnostics =
    options.diagnostics ?? {};

  validateRuntimeName(
    options.name,
  );

  validateRuntimeTimeout(
    startup.timeoutMs,
    "startup",
  );

  validateRuntimeTimeout(
    shutdown.timeoutMs,
    "shutdown",
  );

  const resolved:
    ResolvedRuntimeOptions =
    {
      name:
        options.name ??
        DEFAULT_RUNTIME_OPTIONS.name,

      mode:
        options.mode ??
        DEFAULT_RUNTIME_OPTIONS.mode,

      role:
        options.role ??
        DEFAULT_RUNTIME_OPTIONS.role,

      startup: {
        autoLoadModules:
          startup.autoLoadModules ??
          DEFAULT_RUNTIME_OPTIONS
            .startup
            .autoLoadModules,

        autoInitializeModules:
          startup.autoInitializeModules ??
          DEFAULT_RUNTIME_OPTIONS
            .startup
            .autoInitializeModules,

        autoStartModules:
          startup.autoStartModules ??
          DEFAULT_RUNTIME_OPTIONS
            .startup
            .autoStartModules,

        continueOnInitializeError:
          startup.continueOnInitializeError ??
          DEFAULT_RUNTIME_OPTIONS
            .startup
            .continueOnInitializeError,

        continueOnStartError:
          startup.continueOnStartError ??
          DEFAULT_RUNTIME_OPTIONS
            .startup
            .continueOnStartError,

        timeoutMs:
          startup.timeoutMs ??
          DEFAULT_RUNTIME_OPTIONS
            .startup
            .timeoutMs,
      },

      shutdown: {
        autoStopModules:
          shutdown.autoStopModules ??
          DEFAULT_RUNTIME_OPTIONS
            .shutdown
            .autoStopModules,

        autoDestroyModules:
          shutdown.autoDestroyModules ??
          DEFAULT_RUNTIME_OPTIONS
            .shutdown
            .autoDestroyModules,

        continueOnStopError:
          shutdown.continueOnStopError ??
          DEFAULT_RUNTIME_OPTIONS
            .shutdown
            .continueOnStopError,

        continueOnDestroyError:
          shutdown.continueOnDestroyError ??
          DEFAULT_RUNTIME_OPTIONS
            .shutdown
            .continueOnDestroyError,

        timeoutMs:
          shutdown.timeoutMs ??
          DEFAULT_RUNTIME_OPTIONS
            .shutdown
            .timeoutMs,
      },

      signals: {
        handleSigint:
          signals.handleSigint ??
          DEFAULT_RUNTIME_OPTIONS
            .signals
            .handleSigint,

        handleSigterm:
          signals.handleSigterm ??
          DEFAULT_RUNTIME_OPTIONS
            .signals
            .handleSigterm,

        handleSighup:
          signals.handleSighup ??
          DEFAULT_RUNTIME_OPTIONS
            .signals
            .handleSighup,

        handleUncaughtException:
          signals.handleUncaughtException ??
          DEFAULT_RUNTIME_OPTIONS
            .signals
            .handleUncaughtException,

        handleUnhandledRejection:
          signals.handleUnhandledRejection ??
          DEFAULT_RUNTIME_OPTIONS
            .signals
            .handleUnhandledRejection,
      },

      diagnostics: {
        startupLogging:
          diagnostics.startupLogging ??
          DEFAULT_RUNTIME_OPTIONS
            .diagnostics
            .startupLogging,

        shutdownLogging:
          diagnostics.shutdownLogging ??
          DEFAULT_RUNTIME_OPTIONS
            .diagnostics
            .shutdownLogging,

        includeState:
          diagnostics.includeState ??
          DEFAULT_RUNTIME_OPTIONS
            .diagnostics
            .includeState,

        includeModules:
          diagnostics.includeModules ??
          DEFAULT_RUNTIME_OPTIONS
            .diagnostics
            .includeModules,
      },

      infrastructure:
        Object.freeze({
          ...options.infrastructure,
        }),

      metadata:
        Object.freeze({
          ...options.metadata,
        }),
    };

  return Object.freeze(
    resolved,
  );
}

/**
 * Checks whether a runtime mode is valid.
 */
export function isRuntimeMode(
  value: unknown,
): value is RuntimeMode {
  return (
    value ===
      "development" ||
    value ===
      "test" ||
    value ===
      "production"
  );
}

/**
 * Checks whether a runtime role is valid.
 */
export function isRuntimeRole(
  value: unknown,
): value is RuntimeRole {
  return (
    value ===
      "application" ||
    value ===
      "api" ||
    value ===
      "worker" ||
    value ===
      "scheduler" ||
    value ===
      "cli"
  );
}

/**
 * Validates a runtime mode.
 */
export function assertRuntimeMode(
  value: unknown,
): asserts value is RuntimeMode {
  if (
    !isRuntimeMode(value)
  ) {
    throw new TypeError(
      `Invalid runtime mode "${String(value)}". Expected development, test, or production.`,
    );
  }
}

/**
 * Validates a runtime role.
 */
export function assertRuntimeRole(
  value: unknown,
): asserts value is RuntimeRole {
  if (
    !isRuntimeRole(value)
  ) {
    throw new TypeError(
      `Invalid runtime role "${String(value)}".`,
    );
  }
}

/**
 * Validates runtime options.
 */
export function validateRuntimeOptions(
  options:
    RuntimeOptions,
): void {
  assertRuntimeMode(
    options.mode ??
      DEFAULT_RUNTIME_OPTIONS.mode,
  );

  assertRuntimeRole(
    options.role ??
      DEFAULT_RUNTIME_OPTIONS.role,
  );

  validateRuntimeName(
    options.name,
  );

  validateRuntimeTimeout(
    options.startup?.timeoutMs,
    "startup",
  );

  validateRuntimeTimeout(
    options.shutdown?.timeoutMs,
    "shutdown",
  );
}

/**
 * Validates the runtime name.
 */
function validateRuntimeName(
  name:
    | string
    | undefined,
): void {
  if (
    name === undefined
  ) {
    return;
  }

  if (
    typeof name !==
    "string"
  ) {
    throw new TypeError(
      "Runtime name must be a string.",
    );
  }

  if (
    name.trim().length ===
    0
  ) {
    throw new TypeError(
      "Runtime name cannot be empty.",
    );
  }
}

/**
 * Validates a runtime timeout.
 */
function validateRuntimeTimeout(
  timeout:
    | number
    | undefined,
  field:
    | "startup"
    | "shutdown",
): void {
  if (
    timeout === undefined
  ) {
    return;
  }

  if (
    !Number.isFinite(
      timeout,
    ) ||
    timeout < 0
  ) {
    throw new TypeError(
      `${field} timeout must be a finite number greater than or equal to 0.`,
    );
  }
}