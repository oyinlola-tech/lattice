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

import {
  RuntimeState,
  assertRuntimeTransition,
  createRuntimeStateSnapshot,
  type RuntimeStateSnapshot,
} from "./runtime-state.js";

import {
  createRuntimeContext,
  createRuntimeIdentity,
  type RuntimeContext,
  type RuntimeContextDependencies,
  type RuntimeIdentity,
} from "./runtime-context.js";

import {
  createRuntimeEnvironment,
  type RuntimeEnvironment,
} from "./runtime-environment.js";

import type {
  RuntimeBootstrap,
} from "./runtime-bootstrap.js";

import type {
  RuntimeShutdown,
} from "./runtime-shutdown.js";

import {
  resolveRuntimeOptions,
  type RuntimeOptions,
  type ResolvedRuntimeOptions,
} from "./runtime-options.js";

/**
 * Dependencies required by the RuntimeManager.
 */
export interface RuntimeManagerDependencies {
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

  /**
   * Runtime bootstrap service.
   */
  readonly bootstrap?: RuntimeBootstrap;

  /**
   * Runtime shutdown service.
   */
  readonly shutdown?: RuntimeShutdown;
}

/**
 * Runtime manager lifecycle operations.
 */
export interface RuntimeManager {
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
   * Runtime identity.
   */
  readonly identity:
    RuntimeIdentity;

  /**
   * Runtime options.
   */
  readonly options:
    ResolvedRuntimeOptions;

  /**
   * Current runtime state.
   */
  readonly state:
    RuntimeState;

  /**
   * Whether the runtime is ready.
   */
  readonly ready:
    boolean;

  /**
   * Whether the runtime has stopped.
   */
  readonly stopped:
    boolean;

  /**
   * Whether the runtime has failed.
   */
  readonly failed:
    boolean;

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
   * Marks the runtime as failed.
   */
  fail(
    error?: unknown,
  ):
    void;

  /**
   * Returns a state snapshot.
   */
  getStateSnapshot():
    RuntimeStateSnapshot;

  /**
   * Returns the runtime uptime.
   */
  getUptime():
    number;
}

/**
 * Internal runtime manager state.
 */
interface RuntimeManagerState {
  state:
    RuntimeState;

  startPromise?:
    Promise<void>;

  stopPromise?:
    Promise<void>;

  failureReason?:
    unknown;
}

/**
 * Default RuntimeManager implementation.
 *
 * The manager owns the runtime lifecycle state and delegates
 * detailed startup/shutdown work to RuntimeBootstrap and
 * RuntimeShutdown services.
 */
export class DefaultRuntimeManager
  implements RuntimeManager {
  private readonly _options:
    ResolvedRuntimeOptions;

  private readonly _identity:
    RuntimeIdentity;

  private readonly _context:
    ReturnType<
      typeof createRuntimeContext
    >;

  private readonly _environment:
    RuntimeEnvironment;

  private readonly _bootstrap?:
    RuntimeBootstrap;

  private readonly _shutdown?:
    RuntimeShutdown;

  private readonly _state:
    RuntimeManagerState;

  public constructor(
    dependencies:
      RuntimeManagerDependencies,
    options:
      RuntimeOptions = {},
  ) {
    this._options =
      resolveRuntimeOptions(
        options,
      );

    this._identity =
      createRuntimeIdentity({
        name:
          this._options.name,

        mode:
          this._options.mode,

        role:
          this._options.role,
      });

    this._environment =
      createRuntimeEnvironment({
        mode:
          this._options.mode,

        role:
          this._options.role,
      });

    const contextDependencies:
      RuntimeContextDependencies =
      {
        application:
          dependencies.application,

        configuration:
          dependencies.configuration,

        logger:
          dependencies.logger,

        moduleRegistry:
          dependencies.moduleRegistry,

        moduleLoader:
          dependencies.moduleLoader,

        moduleLifecycle:
          dependencies.moduleLifecycle,
      };

    this._context =
      createRuntimeContext(
        this._identity,
        contextDependencies,
        this._options.metadata,
      );

    this._bootstrap =
      dependencies.bootstrap;

    this._shutdown =
      dependencies.shutdown;

    this._state = {
      state:
        RuntimeState.CREATED,
    };
  }

  /**
   * Runtime context.
   */
  public get context():
    RuntimeContext {
    return this._context;
  }

  /**
   * Runtime environment.
   */
  public get environment():
    RuntimeEnvironment {
    return this._environment;
  }

  /**
   * Runtime identity.
   */
  public get identity():
    RuntimeIdentity {
    return this._identity;
  }

  /**
   * Runtime options.
   */
  public get options():
    ResolvedRuntimeOptions {
    return this._options;
  }

  /**
   * Current runtime state.
   */
  public get state():
    RuntimeState {
    return this._state.state;
  }

  /**
   * Whether the runtime is ready.
   */
  public get ready():
    boolean {
    return (
      this.state ===
      RuntimeState.READY
    );
  }

  /**
   * Whether the runtime has stopped.
   */
  public get stopped():
    boolean {
    return (
      this.state ===
      RuntimeState.STOPPED
    );
  }

  /**
   * Whether the runtime has failed.
   */
  public get failed():
    boolean {
    return (
      this.state ===
      RuntimeState.FAILED
    );
  }

  /**
   * Starts the runtime.
   *
   * The detailed bootstrap sequence will be implemented by
   * RuntimeBootstrap. For now, the manager owns the state
   * transition and lifecycle lock.
   */
  public async start():
    Promise<void> {
    if (
      this.ready
    ) {
      return;
    }

    if (
      this.failed
    ) {
      throw new RuntimeManagerError(
        "Cannot start a runtime that has failed.",
        "START_FAILED_RUNTIME",
      );
    }

    if (
      this.stopped
    ) {
      throw new RuntimeManagerError(
        "Cannot restart a stopped runtime.",
        "START_STOPPED_RUNTIME",
      );
    }

    if (
      this._state.startPromise
    ) {
      return this._state.startPromise;
    }

    this._state.startPromise =
      this.performStart();

    try {
      await this._state.startPromise;
    } finally {
      this._state.startPromise =
        undefined;
    }
  }

  /**
   * Performs the startup state transition.
   */
  private async performStart():
    Promise<void> {
    this.transitionTo(
      RuntimeState.BOOTSTRAPPING,
      "Runtime startup initiated.",
    );

    try {
      if (this._bootstrap) {
        const result =
          await this._bootstrap.bootstrap();

        if (!result.success) {
          throw new RuntimeManagerError(
            "Runtime bootstrap failed.",
            "BOOTSTRAP_FAILED",
          );
        }
      } else {
        /*
         * No bootstrap service provided.
         * The runtime transitions directly to ready.
         */
        await Promise.resolve();
      }

      this.transitionTo(
        RuntimeState.READY,
        "Runtime startup completed.",
      );
    } catch (error) {
      this._state.failureReason =
        error;

      this.transitionTo(
        RuntimeState.FAILED,
        "Runtime startup failed.",
      );

      throw error;
    }
  }

  /**
   * Stops the runtime.
   *
   * Detailed shutdown work will eventually be delegated to
   * RuntimeShutdown.
   */
  public async stop():
    Promise<void> {
    if (
      this.stopped
    ) {
      return;
    }

    if (
      this.failed
    ) {
      throw new RuntimeManagerError(
        "Cannot gracefully stop a runtime that has failed.",
        "STOP_FAILED_RUNTIME",
      );
    }

    if (
      this.state !==
      RuntimeState.READY
    ) {
      throw new RuntimeManagerError(
        `Cannot stop runtime while it is "${this.state}".`,
        "STOP_INVALID_STATE",
      );
    }

    if (
      this._state.stopPromise
    ) {
      return this._state.stopPromise;
    }

    this._state.stopPromise =
      this.performStop();

    try {
      await this._state.stopPromise;
    } finally {
      this._state.stopPromise =
        undefined;
    }
  }

  /**
   * Performs the shutdown state transition.
   */
  private async performStop():
    Promise<void> {
    this.transitionTo(
      RuntimeState.STOPPING,
      "Runtime shutdown initiated.",
    );

    try {
      if (this._shutdown) {
        const result =
          await this._shutdown.shutdown();

        if (!result.success) {
          throw new RuntimeManagerError(
            "Runtime shutdown failed.",
            "SHUTDOWN_FAILED",
          );
        }
      } else {
        /*
         * No shutdown service provided.
         * The runtime transitions directly to stopped.
         */
        await Promise.resolve();
      }

      this.transitionTo(
        RuntimeState.STOPPED,
        "Runtime shutdown completed.",
      );
    } catch (error) {
      this._state.failureReason =
        error;

      this.transitionTo(
        RuntimeState.FAILED,
        "Runtime shutdown failed.",
      );

      throw error;
    }
  }

  /**
   * Marks the runtime as failed.
   */
  public fail(
    error?:
      unknown,
  ):
    void {
    if (
      this.state ===
      RuntimeState.STOPPED
    ) {
      return;
    }

    if (
      this.state ===
      RuntimeState.FAILED
    ) {
      return;
    }

    this._state.failureReason =
      error;

    this.transitionTo(
      RuntimeState.FAILED,
      "Runtime marked as failed.",
    );
  }

  /**
   * Returns a runtime state snapshot.
   */
  public getStateSnapshot():
    RuntimeStateSnapshot {
    return createRuntimeStateSnapshot(
      this.state,
    );
  }

  /**
   * Returns runtime uptime.
   */
  public getUptime():
    number {
    return this._context.getUptime();
  }

  /**
   * Performs a controlled state transition.
   */
  private transitionTo(
    next:
      RuntimeState,
    reason?:
      string,
  ):
    void {
    const current =
      this._state.state;

    assertRuntimeTransition(
      current,
      next,
    );

    this._state.state =
      next;

    /*
     * RuntimeContext intentionally exposes state as read-only
     * through its public interface. The concrete implementation
     * allows the runtime owner to synchronize its internal state.
     */
    this._context.setState(
      next,
    );

    this.logStateTransition(
      current,
      next,
      reason,
    );
  }

  /**
   * Logs runtime state changes.
   */
  private logStateTransition(
    from:
      RuntimeState,
    to:
      RuntimeState,
    reason?:
      string,
  ):
    void {
    try {
      this._context.logger.debug(
        `Runtime state changed from "${from}" to "${to}".`,
        {
          runtimeId:
            this._identity.id,

          runtimeName:
            this._identity.name,

          from,

          to,

          reason,
        },
      );
    } catch {
      /*
       * Logging must never prevent a lifecycle transition.
       */
    }
  }
}

/**
 * Creates a RuntimeManager.
 */
export function createRuntimeManager(
  dependencies:
    RuntimeManagerDependencies,
  options:
    RuntimeOptions = {},
):
  RuntimeManager {
  return new DefaultRuntimeManager(
    dependencies,
    options,
  );
}

/**
 * Runtime manager error.
 */
export class RuntimeManagerError
  extends Error {
  public readonly code:
    string;

  public constructor(
    message:
      string,
    code:
      string,
  ) {
    super(message);

    this.name =
      "RuntimeManagerError";

    this.code =
      code;

    Object.setPrototypeOf(
      this,
      new.target.prototype,
    );
  }
}