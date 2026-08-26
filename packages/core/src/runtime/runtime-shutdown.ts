import type {
  Logger,
} from "../logging/logger.js";

import {
  Context,
  createContext,
} from "../context/context.js";

import type {
  ApplicationContext,
} from "../application/application-context.js";

import type {
  ModuleLifecycleManager,
} from "../modules/module-lifecycle.js";

import type {
  ModuleRegistry,
} from "../modules/module-registry.js";

import type {
  RuntimeContext,
} from "./runtime-context.js";

import type {
  RuntimeEnvironment,
} from "./runtime-environment.js";

import type {
  ResolvedRuntimeOptions,
} from "./runtime-options.js";

/**
 * Dependencies required by RuntimeShutdown.
 */
export interface RuntimeShutdownDependencies {
  /**
   * Runtime context.
   */
  readonly context:
    RuntimeContext;

  /**
   * Runtime environment.
   */
  readonly environment:
    RuntimeEnvironment;

  /**
   * Application context.
   */
  readonly application:
    ApplicationContext;

  /**
   * Module registry.
   */
  readonly moduleRegistry:
    ModuleRegistry;

  /**
   * Module lifecycle manager.
   */
  readonly moduleLifecycle:
    ModuleLifecycleManager;

  /**
   * Logger.
   */
  readonly logger:
    Logger;
}

/**
 * Options for a shutdown operation.
 */
export interface RuntimeShutdownConfig {
  /**
   * Whether modules should be stopped.
   *
   * Defaults to the runtime shutdown configuration.
   */
  readonly stopModules?:
    boolean;

  /**
   * Whether modules should be destroyed.
   *
   * Defaults to the runtime shutdown configuration.
   */
  readonly destroyModules?:
    boolean;

  /**
   * Continue destroying modules when a stop operation fails.
   */
  readonly continueOnStopError?:
    boolean;

  /**
   * Continue destroying modules when another destruction
   * operation fails.
   */
  readonly continueOnDestroyError?:
    boolean;

  /**
   * Maximum shutdown duration in milliseconds.
   *
   * Zero disables the timeout.
   */
  readonly timeoutMs?:
    number;
}

/**
 * Individual shutdown phase.
 */
export type RuntimeShutdownPhase =
  | "created"
  | "stopping"
  | "stopped"
  | "destroying"
  | "destroyed"
  | "completed"
  | "failed";

/**
 * Error captured during shutdown.
 */
export interface RuntimeShutdownErrorInfo {
  /**
   * Shutdown phase where the error occurred.
   */
  readonly phase:
    RuntimeShutdownPhase;

  /**
   * Error instance.
   */
  readonly error:
    unknown;

  /**
   * Optional module name.
   */
  readonly moduleName?:
    string;
}

/**
 * Result of a shutdown operation.
 */
export interface RuntimeShutdownResult {
  /**
   * Whether shutdown completed successfully.
   */
  readonly success:
    boolean;

  /**
   * Final shutdown phase.
   */
  readonly phase:
    RuntimeShutdownPhase;

  /**
   * Number of modules stopped.
   */
  readonly stoppedModules:
    number;

  /**
   * Number of modules destroyed.
   */
  readonly destroyedModules:
    number;

  /**
   * Errors encountered during shutdown.
   */
  readonly errors:
    readonly RuntimeShutdownErrorInfo[];

  /**
   * Shutdown start time.
   */
  readonly startedAt:
    Date;

  /**
   * Shutdown completion time.
   */
  readonly completedAt:
    Date;

  /**
   * Total shutdown duration.
   */
  readonly durationMs:
    number;
}

/**
 * Runtime shutdown contract.
 */
export interface RuntimeShutdown {
  /**
   * Whether shutdown is currently running.
   */
  readonly running:
    boolean;

  /**
   * Current shutdown phase.
   */
  readonly phase:
    RuntimeShutdownPhase;

  /**
   * Performs the complete shutdown pipeline.
   */
  shutdown(
    options?:
      RuntimeShutdownConfig,
  ):
    Promise<RuntimeShutdownResult>;

  /**
   * Returns the most recent shutdown result.
   */
  getLastResult():
    RuntimeShutdownResult | undefined;

  /**
   * Returns the execution context for the current shutdown operation.
   */
  getShutdownContext():
    Context | undefined;

  /**
   * Resets shutdown state.
   */
  reset():
    void;
}

/**
 * Default RuntimeShutdown implementation.
 */
export class DefaultRuntimeShutdown
  implements RuntimeShutdown {
  private readonly _context:
    RuntimeContext;

  private readonly _environment:
    RuntimeEnvironment;

  private readonly _application:
    ApplicationContext;

  private readonly _moduleRegistry:
    ModuleRegistry;

  private readonly _moduleLifecycle:
    ModuleLifecycleManager;

  private readonly _logger:
    Logger;

  private readonly _runtimeOptions:
    ResolvedRuntimeOptions;

  private _running:
    boolean = false;

  private _phase:
    RuntimeShutdownPhase =
      "created";

  private _lastResult:
    RuntimeShutdownResult |
    undefined;

  /**
   * Execution context for the shutdown operation.
   */
  private _shutdownContext?: Context;

  public constructor(
    dependencies:
      RuntimeShutdownDependencies,
    runtimeOptions:
      ResolvedRuntimeOptions,
  ) {
    this._context =
      dependencies.context;

    this._environment =
      dependencies.environment;

    this._application =
      dependencies.application;

    this._moduleRegistry =
      dependencies.moduleRegistry;

    this._moduleLifecycle =
      dependencies.moduleLifecycle;

    this._logger =
      dependencies.logger;

    this._runtimeOptions =
      runtimeOptions;
  }

  /**
   * Whether shutdown is currently running.
   */
  public get running():
    boolean {
    return this._running;
  }

  /**
   * Current shutdown phase.
   */
  public get phase():
    RuntimeShutdownPhase {
    return this._phase;
  }

  /**
   * Performs runtime shutdown.
   */
  public async shutdown(
    options:
      RuntimeShutdownConfig = {},
  ):
    Promise<RuntimeShutdownResult> {
    if (
      this._running
    ) {
      throw new RuntimeShutdownError(
        "Runtime shutdown is already running.",
        "SHUTDOWN_ALREADY_RUNNING",
      );
    }

    if (
      this._phase ===
      "completed"
    ) {
      throw new RuntimeShutdownError(
        "Runtime has already been shut down.",
        "SHUTDOWN_ALREADY_COMPLETED",
      );
    }

    this._running =
      true;

    this._phase =
      "created";

    const startedAt =
      new Date();

    const errors:
      RuntimeShutdownErrorInfo[] =
      [];

    let stoppedModules =
      0;

    let destroyedModules =
      0;

    const configuration =
      this.resolveOptions(
        options,
      );

    /**
     * Create an execution context for this shutdown operation.
     */
    this._shutdownContext = createContext({
      application: this._application,
      type: "worker",
      id: `${this._context.identity.id}-shutdown`,
    });

    try {
      this.log(
        "info",
        "Runtime shutdown started.",
      );

      const operation =
        this.executeShutdown(
          configuration,
          errors,
          {
            incrementStopped: () => {
              stoppedModules += 1;
            },

            incrementDestroyed: () => {
              destroyedModules += 1;
            },
          },
        );

      await this.withTimeout(
        operation,
        configuration.timeoutMs,
      );

      this._phase =
        "completed";

      const completedAt =
        new Date();

      const result =
        this.createResult(
          true,
          "completed",
          stoppedModules,
          destroyedModules,
          errors,
          startedAt,
          completedAt,
        );

      this._lastResult =
        result;

      this.log(
        "info",
        "Runtime shutdown completed.",
        {
          durationMs:
            result.durationMs,

          stoppedModules,

          destroyedModules,
        },
      );

      return result;
    } catch (error) {
      this._phase =
        "failed";

      const shutdownError =
        error instanceof
          RuntimeShutdownError
          ? error
          : new RuntimeShutdownError(
              "Runtime shutdown failed.",
              "SHUTDOWN_FAILED",
              error,
            );

      errors.push({
        phase:
          this._phase,

        error:
          shutdownError,
      });

      const completedAt =
        new Date();

      const result =
        this.createResult(
          false,
          "failed",
          stoppedModules,
          destroyedModules,
          errors,
          startedAt,
          completedAt,
        );

      this._lastResult =
        result;

      this.log(
        "error",
        "Runtime shutdown failed.",
        {
          error:
            shutdownError,
        },
      );

      throw shutdownError;
    } finally {
      this._running =
        false;
    }
  }

  /**
   * Executes the shutdown pipeline.
   */
  private async executeShutdown(
    options:
      ResolvedShutdownOptions,
    errors:
      RuntimeShutdownErrorInfo[],
    counters: {
      incrementStopped():
        void;

      incrementDestroyed():
        void;
    },
  ):
    Promise<void> {
    /*
     * Shutdown intentionally performs destruction after stopping.
     *
     * This ensures active module resources are given an
     * opportunity to close before their instances are destroyed.
     */

    if (
      options.stopModules
    ) {
      await this.stopModules(
        errors,
        counters,
        options.continueOnStopError,
      );
    }

    if (
      options.destroyModules
    ) {
      await this.destroyModules(
        errors,
        counters,
        options.continueOnDestroyError,
      );
    }

    if (
      errors.length > 0 &&
      !options.continueOnStopError &&
      !options.continueOnDestroyError
    ) {
      throw new RuntimeShutdownError(
        "Runtime shutdown completed with module errors.",
        "SHUTDOWN_MODULE_ERRORS",
        errors,
      );
    }
  }

  /**
   * Stops all active modules.
   */
  private async stopModules(
    errors:
      RuntimeShutdownErrorInfo[],
    counters: {
      incrementStopped():
        void;
    },
    continueOnError:
      boolean,
  ):
    Promise<void> {
    this._phase =
      "stopping";

    this.log(
      "debug",
      "Stopping runtime modules.",
    );

    try {
      await this.invokeStopModules();

      this._phase =
        "stopped";

      counters.incrementStopped();

      this.log(
        "debug",
        "Runtime modules stopped.",
      );
    } catch (error) {
      errors.push({
        phase:
          "stopping",

        error,
      });

      if (
        !continueOnError
      ) {
        throw new RuntimeShutdownError(
          "Failed to stop runtime modules.",
          "MODULE_STOP_FAILED",
          error,
        );
      }

      this.log(
        "warn",
        "Runtime module shutdown reported an error. Continuing.",
        {
          error,
        },
      );
    }
  }

  /**
   * Destroys module instances and releases their resources.
   */
  private async destroyModules(
    errors:
      RuntimeShutdownErrorInfo[],
    counters: {
      incrementDestroyed():
        void;
    },
    continueOnError:
      boolean,
  ):
    Promise<void> {
    this._phase =
      "destroying";

    this.log(
      "debug",
      "Destroying runtime modules.",
    );

    try {
      await this.invokeDestroyModules();

      this._phase =
        "destroyed";

      counters.incrementDestroyed();

      this.log(
        "debug",
        "Runtime modules destroyed.",
      );
    } catch (error) {
      errors.push({
        phase:
          "destroying",

        error,
      });

      if (
        !continueOnError
      ) {
        throw new RuntimeShutdownError(
          "Failed to destroy runtime modules.",
          "MODULE_DESTROY_FAILED",
          error,
        );
      }

      this.log(
        "warn",
        "Runtime module destruction reported an error. Continuing.",
        {
          error,
        },
      );
    }
  }

  /**
   * Invokes the module lifecycle stop operation.
   *
   * The adapter supports the lifecycle API variants that may
   * be exposed by ModuleLifecycleManager.
   */
  private async invokeStopModules():
    Promise<void> {
    const lifecycle =
      this._moduleLifecycle as unknown as {
        stopAll?:
          () =>
            | Promise<unknown>
            | unknown;

        stop?:
          () =>
            | Promise<unknown>
            | unknown;
      };

    if (
      typeof lifecycle.stopAll ===
      "function"
    ) {
      await lifecycle.stopAll();
      return;
    }

    if (
      typeof lifecycle.stop ===
      "function"
    ) {
      await lifecycle.stop();
      return;
    }

    throw new RuntimeShutdownError(
      "ModuleLifecycleManager does not expose a supported stop method.",
      "MODULE_STOP_METHOD_NOT_FOUND",
    );
  }

  /**
   * Invokes the module lifecycle destroy operation.
   */
  private async invokeDestroyModules():
    Promise<void> {
    const lifecycle =
      this._moduleLifecycle as unknown as {
        destroyAll?:
          () =>
            | Promise<unknown>
            | unknown;

        destroy?:
          () =>
            | Promise<unknown>
            | unknown;

        disposeAll?:
          () =>
            | Promise<unknown>
            | unknown;

        dispose?:
          () =>
            | Promise<unknown>
            | unknown;
      };

    if (
      typeof lifecycle.destroyAll ===
      "function"
    ) {
      await lifecycle.destroyAll();
      return;
    }

    if (
      typeof lifecycle.destroy ===
      "function"
    ) {
      await lifecycle.destroy();
      return;
    }

    if (
      typeof lifecycle.disposeAll ===
      "function"
    ) {
      await lifecycle.disposeAll();
      return;
    }

    if (
      typeof lifecycle.dispose ===
      "function"
    ) {
      await lifecycle.dispose();
      return;
    }

    throw new RuntimeShutdownError(
      "ModuleLifecycleManager does not expose a supported destroy or dispose method.",
      "MODULE_DESTROY_METHOD_NOT_FOUND",
    );
  }

  /**
   * Resolves shutdown options against runtime defaults.
   */
  private resolveOptions(
    options:
      RuntimeShutdownConfig,
  ):
    ResolvedShutdownOptions {
    return {
      stopModules:
        options.stopModules ??
        this._runtimeOptions
          .shutdown
          .autoStopModules,

      destroyModules:
        options.destroyModules ??
        this._runtimeOptions
          .shutdown
          .autoDestroyModules,

      continueOnStopError:
        options.continueOnStopError ??
        this._runtimeOptions
          .shutdown
          .continueOnStopError,

      continueOnDestroyError:
        options.continueOnDestroyError ??
        this._runtimeOptions
          .shutdown
          .continueOnDestroyError,

      timeoutMs:
        options.timeoutMs ??
        this._runtimeOptions
          .shutdown
          .timeoutMs,
    };
  }

  /**
   * Applies a shutdown timeout.
   */
  private async withTimeout(
    operation:
      Promise<void>,
    timeoutMs:
      number,
  ):
    Promise<void> {
    if (
      timeoutMs <= 0
    ) {
      await operation;
      return;
    }

    let timer:
      ReturnType<
        typeof setTimeout
      >;

    const timeout =
      new Promise<never>(
        (
          _resolve,
          reject,
        ) => {
          timer =
            setTimeout(
              () => {
                reject(
                  new RuntimeShutdownError(
                    `Runtime shutdown exceeded the configured timeout of ${timeoutMs}ms.`,
                    "SHUTDOWN_TIMEOUT",
                  ),
                );
              },
              timeoutMs,
            );
        },
      );

    try {
      await Promise.race([
        operation,
        timeout,
      ]);
    } finally {
      clearTimeout(
        timer!,
      );
    }
  }

  /**
   * Creates a shutdown result.
   */
  private createResult(
    success:
      boolean,
    phase:
      RuntimeShutdownPhase,
    stoppedModules:
      number,
    destroyedModules:
      number,
    errors:
      readonly RuntimeShutdownErrorInfo[],
    startedAt:
      Date,
    completedAt:
      Date,
  ):
    RuntimeShutdownResult {
    return Object.freeze({
      success,

      phase,

      stoppedModules,

      destroyedModules,

      errors:
        Object.freeze([
          ...errors,
        ]),

      startedAt,

      completedAt,

      durationMs:
        completedAt.getTime() -
        startedAt.getTime(),
    });
  }

  /**
   * Returns the latest shutdown result.
   */
  public getLastResult():
    RuntimeShutdownResult |
    undefined {
    return this._lastResult;
  }

  /**
   * Returns the execution context for the current shutdown operation.
   *
   * This is available after shutdown() is called and provides
   * access to execution metadata and the application context.
   */
  public getShutdownContext():
    Context |
    undefined {
    return this._shutdownContext;
  }

  /**
   * Resets shutdown state.
   */
  public reset():
    void {
    if (
      this._running
    ) {
      throw new RuntimeShutdownError(
        "Cannot reset runtime shutdown while it is running.",
        "SHUTDOWN_RESET_WHILE_RUNNING",
      );
    }

    this._phase =
      "created";

    this._lastResult =
      undefined;
  }

  /**
   * Writes shutdown diagnostics.
   */
  private log(
    level:
      "debug" |
      "info" |
      "warn" |
      "error",
    message:
      string,
    metadata?:
      Record<
        string,
        unknown
      >,
  ):
    void {
    try {
      const logger =
        this._logger as unknown as Record<
          string,
          unknown
        >;

      const method =
        logger[level];

      if (
        typeof method ===
        "function"
      ) {
        (
          method as (
            message:
              string,
            metadata?:
              Record<
                string,
                unknown
              >,
          ) => void
        ).call(
          this._logger,
          message,
          {
            runtimeId:
              this._context
                .identity
                .id,

            runtimeName:
              this._context
                .identity
                .name,

            environment:
              this._environment
                .engine,

            ...metadata,
          },
        );
      }
    } catch {
      /*
       * Logging must never prevent shutdown.
       */
    }
  }
}

/**
 * Internal resolved shutdown configuration.
 */
interface ResolvedShutdownOptions {
  readonly stopModules:
    boolean;

  readonly destroyModules:
    boolean;

  readonly continueOnStopError:
    boolean;

  readonly continueOnDestroyError:
    boolean;

  readonly timeoutMs:
    number;
}

/**
 * Runtime shutdown error.
 */
export class RuntimeShutdownError
  extends Error {
  public readonly code:
    string;


  public constructor(
    message:
      string,
    code:
      string,
    cause?:
      unknown,
  ) {
    super(message);


    this.code =
      code;

    this.cause =
      cause;

    Object.setPrototypeOf(
      this,
      new.target.prototype,
    );
  }
}

/**
 * Creates a RuntimeShutdown instance.
 */
export function createRuntimeShutdown(
  dependencies:
    RuntimeShutdownDependencies,
  runtimeOptions:
    ResolvedRuntimeOptions,
):
  RuntimeShutdown {
  return new DefaultRuntimeShutdown(
    dependencies,
    runtimeOptions,
  );
}