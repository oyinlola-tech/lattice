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
  Module,
} from "../modules/module.js";

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
 * Runtime lifecycle state.
 */
export type RuntimeState =
  | "created"
  | "bootstrapping"
  | "ready"
  | "stopping"
  | "stopped"
  | "failed";

/**
 * Dependencies required by the runtime.
 */
export interface RuntimeDependencies {
  /**
   * Application-level context.
   */
  readonly application:
    ApplicationContext;

  /**
   * Application configuration.
   */
  readonly configuration:
    ConfigurationManager;

  /**
   * Application logger.
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
 * Runtime status snapshot.
 */
export interface RuntimeStatus {
  readonly state:
    RuntimeState;

  readonly startedAt?:
    Date;

  readonly stoppedAt?:
    Date;

  readonly failedAt?:
    Date;

  readonly error?:
    unknown;
}

/**
 * Runtime contract.
 *
 * Runtime is the top-level coordinator for the core application
 * infrastructure.
 */
export interface Runtime {
  /**
   * Current runtime state.
   */
  readonly state:
    RuntimeState;

  /**
   * Starts the runtime.
   */
  start():
    Promise<void>;

  /**
   * Stops the runtime.
   */
  stop():
    Promise<void>;

  /**
   * Returns the runtime status.
   */
  getStatus():
    RuntimeStatus;

  /**
   * Returns the application context.
   */
  getApplicationContext():
    ApplicationContext;

  /**
   * Returns the configuration manager.
   */
  getConfiguration():
    ConfigurationManager;

  /**
   * Returns the logger.
   */
  getLogger():
    Logger;

  /**
   * Returns the module registry.
   */
  getModuleRegistry():
    ModuleRegistry;

  /**
   * Returns the module loader.
   */
  getModuleLoader():
    ModuleLoader;

  /**
   * Returns the module lifecycle manager.
   */
  getModuleLifecycle():
    ModuleLifecycleManager;

  /**
   * Returns a loaded module.
   */
  getModule(
    moduleId: string,
  ):
    | Module
    | undefined;

  /**
   * Returns a required loaded module.
   */
  requireModule(
    moduleId: string,
  ): Module;
}

/**
 * Runtime implementation.
 *
 * The runtime owns application-wide execution state.
 *
 * It coordinates:
 *
 * ApplicationContext
 * Configuration
 * Logging
 * ModuleRegistry
 * ModuleLoader
 * ModuleLifecycleManager
 *
 * It does not directly implement module lifecycle hooks.
 */
export class DefaultRuntime
  implements Runtime {
  private _state:
    RuntimeState =
    "created";

  private startedAt:
    Date | undefined;

  private stoppedAt:
    Date | undefined;

  private failedAt:
    Date | undefined;

  private error:
    unknown;

  private startPromise:
    Promise<void> | undefined;

  private stopPromise:
    Promise<void> | undefined;

  private readonly application:
    ApplicationContext;

  private readonly configuration:
    ConfigurationManager;

  private readonly logger:
    Logger;

  private readonly moduleRegistry:
    ModuleRegistry;

  private readonly moduleLoader:
    ModuleLoader;

  private readonly moduleLifecycle:
    ModuleLifecycleManager;

  public constructor(
    dependencies:
      RuntimeDependencies,
  ) {
    this.application =
      dependencies.application;

    this.configuration =
      dependencies.configuration;

    this.logger =
      dependencies.logger;

    this.moduleRegistry =
      dependencies.moduleRegistry;

    this.moduleLoader =
      dependencies.moduleLoader;

    this.moduleLifecycle =
      dependencies.moduleLifecycle;
  }

  /**
   * Current runtime state.
   */
  public get state():
    RuntimeState {
    return this._state;
  }

  /**
   * Starts the runtime.
   */
  public async start(): Promise<void> {
    if (
      this._state ===
      "ready"
    ) {
      return;
    }

    if (
      this.startPromise
    ) {
      return this.startPromise;
    }

    if (
      this._state ===
        "stopping"
    ) {
      throw new RuntimeStateError(
        "Cannot start the runtime while it is stopping.",
      );
    }

    if (
      this._state ===
      "stopped"
    ) {
      throw new RuntimeStateError(
        "A stopped runtime cannot be started again.",
      );
    }

    if (
      this._state ===
      "failed"
    ) {
      throw new RuntimeStateError(
        "A failed runtime cannot be restarted.",
      );
    }

    this.startPromise =
      this.performStart();

    try {
      await this.startPromise;
    } finally {
      this.startPromise =
        undefined;
    }
  }

  /**
   * Stops the runtime.
   */
  public async stop(): Promise<void> {
    if (
      this._state ===
      "stopped"
    ) {
      return;
    }

    if (
      this.stopPromise
    ) {
      return this.stopPromise;
    }

    if (
      this._state ===
      "created"
    ) {
      this._state =
        "stopped";

      this.stoppedAt =
        new Date();

      return;
    }

    if (
      this._state ===
      "bootstrapping"
    ) {
      throw new RuntimeStateError(
        "Cannot stop the runtime while it is bootstrapping.",
      );
    }

    if (
      this._state ===
      "stopping"
    ) {
      return;
    }

    this.stopPromise =
      this.performStop();

    try {
      await this.stopPromise;
    } finally {
      this.stopPromise =
        undefined;
    }
  }

  /**
   * Performs runtime startup.
   */
  private async performStart(): Promise<void> {
    this._state =
      "bootstrapping";

    this.error =
      undefined;

    try {
      this.logger.info(
        "Starting application runtime.",
      );

      /**
       * Load module definitions and instantiate
       * their runtime instances.
       */
      await this.moduleLoader.loadAll();

      /**
       * Initialize modules in dependency order.
       */
      const initialization =
        await this.moduleLifecycle
          .initialize();

      if (
        initialization.failed
          .length > 0
      ) {
        throw new RuntimeError(
          "One or more modules failed during initialization.",
          initialization.failed,
        );
      }

      /**
       * Start modules in dependency order.
       */
      const startup =
        await this.moduleLifecycle
          .start();

      if (
        startup.failed.length >
        0
      ) {
        throw new RuntimeError(
          "One or more modules failed during startup.",
          startup.failed,
        );
      }

      this.startedAt =
        new Date();

      this._state =
        "ready";

      this.logger.info(
        "Application runtime is ready.",
      );
    } catch (error) {
      this.error =
        error;

      this.failedAt =
        new Date();

      this._state =
        "failed";

      this.logger.error(
        "Application runtime failed to start.",
        {
          error,
        },
      );

      /**
       * Attempt cleanup when startup fails.
       *
       * Shutdown errors must not hide the original startup
       * failure.
       */
      try {
        await this.moduleLifecycle
          .stopApplication();
      } catch (cleanupError) {
        this.logger.error(
          "Runtime startup cleanup failed.",
          {
            error:
              cleanupError,
          },
        );
      }

      throw error;
    }
  }

  /**
   * Performs runtime shutdown.
   */
  private async performStop(): Promise<void> {
    this._state =
      "stopping";

    try {
      this.logger.info(
        "Stopping application runtime.",
      );

      await this.moduleLifecycle
        .stopApplication();

      this.stoppedAt =
        new Date();

      this._state =
        "stopped";

      this.logger.info(
        "Application runtime stopped.",
      );
    } catch (error) {
      this.error =
        error;

      this.failedAt =
        new Date();

      this._state =
        "failed";

      this.logger.error(
        "Application runtime failed to stop cleanly.",
        {
          error,
        },
      );

      throw error;
    }
  }

  /**
   * Returns the runtime status.
   */
  public getStatus():
    RuntimeStatus {
    return Object.freeze({
      state:
        this._state,

      startedAt:
        this.startedAt,

      stoppedAt:
        this.stoppedAt,

      failedAt:
        this.failedAt,

      error:
        this.error,
    });
  }

  /**
   * Returns application context.
   */
  public getApplicationContext():
    ApplicationContext {
    return this.application;
  }

  /**
   * Returns configuration.
   */
  public getConfiguration():
    ConfigurationManager {
    return this.configuration;
  }

  /**
   * Returns logger.
   */
  public getLogger():
    Logger {
    return this.logger;
  }

  /**
   * Returns module registry.
   */
  public getModuleRegistry():
    ModuleRegistry {
    return this.moduleRegistry;
  }

  /**
   * Returns module loader.
   */
  public getModuleLoader():
    ModuleLoader {
    return this.moduleLoader;
  }

  /**
   * Returns module lifecycle manager.
   */
  public getModuleLifecycle():
    ModuleLifecycleManager {
    return this.moduleLifecycle;
  }

  /**
   * Returns a loaded module.
   */
  public getModule(
    moduleId: string,
  ):
    | Module
    | undefined {
    return this.moduleRegistry
      .get(moduleId)
      ?.instance;
  }

  /**
   * Returns a required loaded module.
   */
  public requireModule(
    moduleId: string,
  ): Module {
    const module =
      this.getModule(
        moduleId,
      );

    if (!module) {
      throw new RuntimeError(
        `Module "${moduleId}" is not loaded.`,
        [moduleId],
      );
    }

    return module;
  }
}

/**
 * Error thrown for invalid runtime operations.
 */
export class RuntimeStateError
  extends Error {
  public constructor(
    message: string,
  ) {
    super(message);

    this.name =
      "RuntimeStateError";

    Object.setPrototypeOf(
      this,
      new.target.prototype,
    );
  }
}

/**
 * Error thrown when runtime startup/shutdown fails.
 */
export class RuntimeError
  extends Error {
  public readonly moduleIds:
    readonly string[];

  public constructor(
    message: string,
    moduleIds:
      readonly string[] = [],
  ) {
    super(message);

    this.name =
      "RuntimeError";

    this.moduleIds =
      Object.freeze([
        ...moduleIds,
      ]);

    Object.setPrototypeOf(
      this,
      new.target.prototype,
    );
  }
}

/**
 * Creates a runtime.
 */
export function createRuntime(
  dependencies:
    RuntimeDependencies,
): Runtime {
  return new DefaultRuntime(
    dependencies,
  );
}