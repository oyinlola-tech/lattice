import type {
  Logger,
} from "../logging/logger.js";

import {
  Context,
  createContext,
  type ContextType,
} from "../context/context.js";

import type {
  ApplicationContext,
} from "../application/application-context.js";

import type {
  ModuleLoader,
} from "../modules/module-loader.js";

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
 * Dependencies required by RuntimeBootstrap.
 */
export interface RuntimeBootstrapDependencies {
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
   * Module loader.
   */
  readonly moduleLoader:
    ModuleLoader;

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
 * Options for a bootstrap operation.
 */
export interface RuntimeBootstrapOptions {
  /**
   * Whether modules should be loaded.
   *
   * Defaults to the runtime startup configuration.
   */
  readonly loadModules?:
    boolean;

  /**
   * Whether modules should be initialized.
   *
   * Defaults to the runtime startup configuration.
   */
  readonly initializeModules?:
    boolean;

  /**
   * Whether modules should be started.
   *
   * Defaults to the runtime startup configuration.
   */
  readonly startModules?:
    boolean;

  /**
   * Whether errors during module initialization should
   * prevent subsequent modules from initializing.
   */
  readonly continueOnInitializeError?:
    boolean;

  /**
   * Whether errors during module startup should prevent
   * subsequent modules from starting.
   */
  readonly continueOnStartError?:
    boolean;

  /**
   * Maximum bootstrap duration in milliseconds.
   *
   * Zero disables the timeout.
   */
  readonly timeoutMs?:
    number;
}

/**
 * Individual bootstrap phase.
 */
export type RuntimeBootstrapPhase =
  | "created"
  | "loading"
  | "loaded"
  | "initializing"
  | "initialized"
  | "starting"
  | "started"
  | "completed"
  | "failed";

/**
 * Result of a bootstrap operation.
 */
export interface RuntimeBootstrapResult {
  /**
   * Whether bootstrap completed successfully.
   */
  readonly success:
    boolean;

  /**
   * Final bootstrap phase.
   */
  readonly phase:
    RuntimeBootstrapPhase;

  /**
   * Number of modules loaded.
   */
  readonly loadedModules:
    number;

  /**
   * Number of modules initialized.
   */
  readonly initializedModules:
    number;

  /**
   * Number of modules started.
   */
  readonly startedModules:
    number;

  /**
   * Errors encountered during bootstrap.
   */
  readonly errors:
    readonly RuntimeBootstrapError[];

  /**
   * Bootstrap start time.
   */
  readonly startedAt:
    Date;

  /**
   * Bootstrap completion time.
   */
  readonly completedAt:
    Date;

  /**
   * Total bootstrap duration.
   */
  readonly durationMs:
    number;
}

/**
 * Represents an error produced by a bootstrap phase.
 */
export interface RuntimeBootstrapError {
  /**
   * Bootstrap phase in which the error occurred.
   */
  readonly phase:
    RuntimeBootstrapPhase;

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
 * Runtime bootstrap contract.
 */
export interface RuntimeBootstrap {
  /**
   * Whether bootstrap is currently running.
   */
  readonly running:
    boolean;

  /**
   * Current bootstrap phase.
   */
  readonly phase:
    RuntimeBootstrapPhase;

  /**
   * Performs the complete startup pipeline.
   */
  bootstrap(
    options?:
      RuntimeBootstrapOptions,
  ):
    Promise<RuntimeBootstrapResult>;

  /**
   * Returns the most recent bootstrap result.
   */
  getLastResult():
    RuntimeBootstrapResult | undefined;

  /**
   * Resets the bootstrap state.
   *
   * This is intended primarily for controlled lifecycle
   * management and testing.
   */
  reset():
    void;
}

/**
 * Default runtime bootstrap implementation.
 */
export class DefaultRuntimeBootstrap
  implements RuntimeBootstrap {
  private readonly _context:
    RuntimeContext;

  private readonly _environment:
    RuntimeEnvironment;

  private readonly _application:
    ApplicationContext;

  private readonly _moduleLoader:
    ModuleLoader;

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
    RuntimeBootstrapPhase =
      "created";

  private _lastResult:
    RuntimeBootstrapResult |
    undefined;

  /**
   * Execution context for the bootstrap operation.
   * Created when bootstrap starts and available throughout.
   */
  private _bootstrapContext?: Context;

  public constructor(
    dependencies:
      RuntimeBootstrapDependencies,
    runtimeOptions:
      ResolvedRuntimeOptions,
  ) {
    this._context =
      dependencies.context;

    this._environment =
      dependencies.environment;

    this._application =
      dependencies.application;

    this._moduleLoader =
      dependencies.moduleLoader;

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
   * Whether bootstrap is currently running.
   */
  public get running():
    boolean {
    return this._running;
  }

  /**
   * Current bootstrap phase.
   */
  public get phase():
    RuntimeBootstrapPhase {
    return this._phase;
  }

  /**
   * Performs runtime bootstrap.
   */
  public async bootstrap(
    options:
      RuntimeBootstrapOptions = {},
  ):
    Promise<RuntimeBootstrapResult> {
    if (
      this._running
    ) {
      throw new RuntimeBootstrapError(
        "Runtime bootstrap is already running.",
        "BOOTSTRAP_ALREADY_RUNNING",
      );
    }

    if (
      this._phase ===
      "completed"
    ) {
      throw new RuntimeBootstrapError(
        "Runtime has already been bootstrapped.",
        "BOOTSTRAP_ALREADY_COMPLETED",
      );
    }

    this._running =
      true;

    this._phase =
      "created";

    const startedAt =
      new Date();

    const errors:
      RuntimeBootstrapError[] =
      [];

    let loadedModules =
      0;

    let initializedModules =
      0;

    let startedModules =
      0;

    const configuration =
      this.resolveOptions(
        options,
      );

    /**
     * Create an execution context for this bootstrap operation.
     * This context is available throughout bootstrap and can be
     * used to track execution metadata and store values.
     */
    this._bootstrapContext = createContext({
      application: this._application,
      type: "worker",
      id: this._context.identity.id,
    });

    try {
      this.log(
        "info",
        "Runtime bootstrap started.",
      );

      const operation =
        this.executeBootstrap(
          configuration,
          errors,
          {
            incrementLoaded: () => {
              loadedModules += 1;
            },

            incrementInitialized: () => {
              initializedModules += 1;
            },

            incrementStarted: () => {
              startedModules += 1;
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
          loadedModules,
          initializedModules,
          startedModules,
          errors,
          startedAt,
          completedAt,
        );

      this._lastResult =
        result;

      this.log(
        "info",
        "Runtime bootstrap completed.",
        {
          durationMs:
            result.durationMs,

          loadedModules,

          initializedModules,

          startedModules,
        },
      );

      return result;
    } catch (error) {
      this._phase =
        "failed";

      const bootstrapError =
        error instanceof
          RuntimeBootstrapError
          ? error
          : new RuntimeBootstrapError(
              "Runtime bootstrap failed.",
              "BOOTSTRAP_FAILED",
              error,
            );

      errors.push({
        phase:
          this._phase,

        error:
          bootstrapError,
      });

      const completedAt =
        new Date();

      const result =
        this.createResult(
          false,
          "failed",
          loadedModules,
          initializedModules,
          startedModules,
          errors,
          startedAt,
          completedAt,
        );

      this._lastResult =
        result;

      this.log(
        "error",
        "Runtime bootstrap failed.",
        {
          error:
            bootstrapError,
        },
      );

      throw bootstrapError;
    } finally {
      this._running =
        false;
    }
  }

  /**
   * Executes the individual bootstrap stages.
   */
  private async executeBootstrap(
    options:
      ResolvedBootstrapOptions,
    errors:
      RuntimeBootstrapError[],
    counters: {
      incrementLoaded():
        void;

      incrementInitialized():
        void;

      incrementStarted():
        void;
    },
  ):
    Promise<void> {
    if (
      options.loadModules
    ) {
      await this.loadModules(
        errors,
        counters,
      );
    }

    if (
      options.initializeModules
    ) {
      await this.initializeModules(
        errors,
        counters,
        options.continueOnInitializeError,
      );
    }

    if (
      options.startModules
    ) {
      await this.startModules(
        errors,
        counters,
        options.continueOnStartError,
      );
    }

    if (
      errors.length > 0 &&
      !options.continueOnInitializeError &&
      !options.continueOnStartError
    ) {
      throw new RuntimeBootstrapError(
        "Runtime bootstrap completed with module errors.",
        "BOOTSTRAP_MODULE_ERRORS",
        errors,
      );
    }
  }

  /**
   * Loads modules through ModuleLoader.
   */
  private async loadModules(
    errors:
      RuntimeBootstrapError[],
    counters: {
      incrementLoaded():
        void;
    },
  ):
    Promise<void> {
    this._phase =
      "loading";

    this.log(
      "debug",
      "Loading runtime modules.",
    );

    try {
      await this.invokeModuleLoader();

      this._phase =
        "loaded";

      counters.incrementLoaded();

      this.log(
        "debug",
        "Runtime modules loaded.",
      );
    } catch (error) {
      const bootstrapError:
        RuntimeBootstrapError =
        {
          phase:
            "loading",

          error,
        };

      errors.push(
        bootstrapError,
      );

      throw new RuntimeBootstrapError(
        "Failed to load runtime modules.",
        "MODULE_LOAD_FAILED",
        error,
      );
    }
  }

  /**
   * Initializes modules through ModuleLifecycleManager.
   */
  private async initializeModules(
    errors:
      RuntimeBootstrapError[],
    counters: {
      incrementInitialized():
        void;
    },
    continueOnError:
      boolean,
  ):
    Promise<void> {
    this._phase =
      "initializing";

    this.log(
      "debug",
      "Initializing runtime modules.",
    );

    try {
      await this.invokeInitializeModules();

      this._phase =
        "initialized";

      counters.incrementInitialized();

      this.log(
        "debug",
        "Runtime modules initialized.",
      );
    } catch (error) {
      errors.push({
        phase:
          "initializing",

        error,
      });

      if (
        !continueOnError
      ) {
        throw new RuntimeBootstrapError(
          "Failed to initialize runtime modules.",
          "MODULE_INITIALIZATION_FAILED",
          error,
        );
      }

      this.log(
        "warn",
        "Runtime module initialization reported an error. Continuing.",
        {
          error,
        },
      );
    }
  }

  /**
   * Starts modules through ModuleLifecycleManager.
   */
  private async startModules(
    errors:
      RuntimeBootstrapError[],
    counters: {
      incrementStarted():
        void;
    },
    continueOnError:
      boolean,
  ):
    Promise<void> {
    this._phase =
      "starting";

    this.log(
      "debug",
      "Starting runtime modules.",
    );

    try {
      await this.invokeStartModules();

      this._phase =
        "started";

      counters.incrementStarted();

      this.log(
        "debug",
        "Runtime modules started.",
      );
    } catch (error) {
      errors.push({
        phase:
          "starting",

        error,
      });

      if (
        !continueOnError
      ) {
        throw new RuntimeBootstrapError(
          "Failed to start runtime modules.",
          "MODULE_START_FAILED",
          error,
        );
      }

      this.log(
        "warn",
        "Runtime module startup reported an error. Continuing.",
        {
          error,
        },
      );
    }
  }

  /**
   * Invokes the module loader.
   *
   * This adapter keeps RuntimeBootstrap decoupled from the
   * exact method naming implementation of ModuleLoader.
   */
  private async invokeModuleLoader():
    Promise<void> {
    const loader =
      this._moduleLoader as unknown as {
        loadAll?:
          () =>
            | Promise<unknown>
            | unknown;

        load?:
          () =>
            | Promise<unknown>
            | unknown;
      };

    if (
      typeof loader.loadAll ===
      "function"
    ) {
      await loader.loadAll();
      return;
    }

    if (
      typeof loader.load ===
      "function"
    ) {
      await loader.load();
      return;
    }

    throw new RuntimeBootstrapError(
      "ModuleLoader does not expose a supported load method.",
      "MODULE_LOADER_METHOD_NOT_FOUND",
    );
  }

  /**
   * Invokes module initialization.
   */
  private async invokeInitializeModules():
    Promise<void> {
    const lifecycle =
      this._moduleLifecycle as unknown as {
        initializeAll?:
          () =>
            | Promise<unknown>
            | unknown;

        initialize?:
          () =>
            | Promise<unknown>
            | unknown;
      };

    if (
      typeof lifecycle.initializeAll ===
      "function"
    ) {
      await lifecycle.initializeAll();
      return;
    }

    if (
      typeof lifecycle.initialize ===
      "function"
    ) {
      await lifecycle.initialize();
      return;
    }

    throw new RuntimeBootstrapError(
      "ModuleLifecycleManager does not expose a supported initialize method.",
      "MODULE_INITIALIZE_METHOD_NOT_FOUND",
    );
  }

  /**
   * Invokes module startup.
   */
  private async invokeStartModules():
    Promise<void> {
    const lifecycle =
      this._moduleLifecycle as unknown as {
        startAll?:
          () =>
            | Promise<unknown>
            | unknown;

        start?:
          () =>
            | Promise<unknown>
            | unknown;
      };

    if (
      typeof lifecycle.startAll ===
      "function"
    ) {
      await lifecycle.startAll();
      return;
    }

    if (
      typeof lifecycle.start ===
      "function"
    ) {
      await lifecycle.start();
      return;
    }

    throw new RuntimeBootstrapError(
      "ModuleLifecycleManager does not expose a supported start method.",
      "MODULE_START_METHOD_NOT_FOUND",
    );
  }

  /**
   * Resolves bootstrap options against runtime defaults.
   */
  private resolveOptions(
    options:
      RuntimeBootstrapOptions,
  ):
    ResolvedBootstrapOptions {
    return {
      loadModules:
        options.loadModules ??
        this._runtimeOptions
          .startup
          .autoLoadModules,

      initializeModules:
        options.initializeModules ??
        this._runtimeOptions
          .startup
          .autoInitializeModules,

      startModules:
        options.startModules ??
        this._runtimeOptions
          .startup
          .autoStartModules,

      continueOnInitializeError:
        options.continueOnInitializeError ??
        this._runtimeOptions
          .startup
          .continueOnInitializeError,

      continueOnStartError:
        options.continueOnStartError ??
        this._runtimeOptions
          .startup
          .continueOnStartError,

      timeoutMs:
        options.timeoutMs ??
        this._runtimeOptions
          .startup
          .timeoutMs,
    };
  }

  /**
   * Applies a timeout to bootstrap.
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
                  new RuntimeBootstrapError(
                    `Runtime bootstrap exceeded the configured timeout of ${timeoutMs}ms.`,
                    "BOOTSTRAP_TIMEOUT",
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
   * Creates a bootstrap result.
   */
  private createResult(
    success:
      boolean,
    phase:
      RuntimeBootstrapPhase,
    loadedModules:
      number,
    initializedModules:
      number,
    startedModules:
      number,
    errors:
      readonly RuntimeBootstrapError[],
    startedAt:
      Date,
    completedAt:
      Date,
  ):
    RuntimeBootstrapResult {
    return Object.freeze({
      success,

      phase,

      loadedModules,

      initializedModules,

      startedModules,

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
   * Returns the latest bootstrap result.
   */
  public getLastResult():
    RuntimeBootstrapResult |
    undefined {
    return this._lastResult;
  }

  /**
   * Returns the execution context for the current bootstrap operation.
   *
   * This is available after bootstrap() is called and provides
   * access to execution metadata and the application context.
   */
  public getBootstrapContext():
    Context |
    undefined {
    return this._bootstrapContext;
  }

  /**
   * Resets bootstrap state.
   */
  public reset():
    void {
    if (
      this._running
    ) {
      throw new RuntimeBootstrapError(
        "Cannot reset runtime bootstrap while it is running.",
        "BOOTSTRAP_RESET_WHILE_RUNNING",
      );
    }

    this._phase =
      "created";

    this._lastResult =
      undefined;
  }

  /**
   * Writes bootstrap diagnostics.
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
       * Logging must never break bootstrap.
       */
    }
  }
}

/**
 * Internal resolved bootstrap configuration.
 */
interface ResolvedBootstrapOptions {
  readonly loadModules:
    boolean;

  readonly initializeModules:
    boolean;

  readonly startModules:
    boolean;

  readonly continueOnInitializeError:
    boolean;

  readonly continueOnStartError:
    boolean;

  readonly timeoutMs:
    number;
}

/**
 * Runtime bootstrap error.
 */
export class RuntimeBootstrapError
  extends Error {
  public readonly code:
    string;

  public override readonly name: string = "RuntimeBootstrapError";

  public constructor(
    message:
      string,
    code:
      string,
    cause?:
      unknown,
  ) {
    super(message);

    this.name =
      "RuntimeBootstrapError";

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
 * Creates a RuntimeBootstrap instance.
 */
export function createRuntimeBootstrap(
  dependencies:
    RuntimeBootstrapDependencies,
  runtimeOptions:
    ResolvedRuntimeOptions,
):
  RuntimeBootstrap {
  return new DefaultRuntimeBootstrap(
    dependencies,
    runtimeOptions,
  );
}