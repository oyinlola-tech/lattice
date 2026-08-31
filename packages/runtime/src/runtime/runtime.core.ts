import type {
  Logger,
} from "@lattice/logger";

import type {
  EventBus,
} from "@lattice/events";

import type {
  Container,
} from "@lattice/container";

import type {
  Module,
} from "@lattice/core";

import type {
  RuntimeState,
  RuntimeStatus,
  RuntimeHealth,
  RuntimeHealthState,
} from "../runtimeState/index.js";

import {
  canTransition,
  isRunning,
  createStatus,
} from "../runtimeState/index.js";

import type {
  RuntimeOptions,
  ResolvedRuntimeOptions,
} from "../runtimeOptions/index.js";

import {
  createRuntimeOptions,
} from "../runtimeOptions/index.js";

import type {
  RuntimeContext,
} from "../runtimeContext/index.js";

import {
  createRuntimeContext,
} from "../runtimeContext/index.js";

import {
  createRuntimeId,
} from "../runtimeContext/index.js";

import {
  LifecycleManager,
} from "../lifecycle/index.js";

import {
  executeStartup,
  rollbackStartup,
} from "../startup/index.js";

import {
  executeShutdown,
} from "../shutdown/index.js";

import {
  SignalHandler,
} from "../signalHandler/index.js";

import {
  ReadinessTracker,
} from "../readiness/index.js";

import {
  createRuntimeEventPayload,
  createFailureEventPayload,
  createHealthEventPayload,
  createReadinessEventPayload,
} from "../runtimeEvents/index.js";

import {
  createEvent,
} from "@lattice/events";

import {
  RuntimeStartError,
  RuntimeStopError,
  RuntimeStateError,
  RuntimeTimeoutError,
  RuntimeRollbackError,
  toRuntimeError,
} from "../runtimeError/index.js";

/**
 * Lattice runtime interface.
 *
 * The runtime is the orchestrator that manages the complete
 * application lifecycle from creation through shutdown.
 */
export interface Runtime {
  readonly state: RuntimeState;
  readonly status: RuntimeStatus;
  readonly context: RuntimeContext;
  readonly ready: boolean;

  start(): Promise<void>;
  stop(): Promise<void>;
}

/**
 * Dependencies required to create a runtime.
 */
export interface RuntimeDependencies {
  readonly modules: ReadonlyMap<string, Module>;
  readonly logger: Logger;
  readonly container: Container;
  readonly eventBus: EventBus;
}

/**
 * Default runtime implementation.
 */
export class DefaultRuntime implements Runtime {
  private _state: RuntimeState = "created";
  private _status: RuntimeStatus;
  private _context: RuntimeContext;
  private _ready = false;
  private _startedAt?: Date;
  private _stoppedAt?: Date;
  private _failedAt?: Date;
  private _error?: Error;

  private readonly options: ResolvedRuntimeOptions;
  private readonly modules: ReadonlyMap<string, Module>;
  private readonly logger: Logger;
  private readonly lifecycle: LifecycleManager;
  private readonly signalHandler: SignalHandler;
  private readonly readinessTracker: ReadinessTracker;

  private startPromise: Promise<void> | undefined;
  private stopPromise: Promise<void> | undefined;

  public constructor(
    dependencies: RuntimeDependencies,
    options: RuntimeOptions,
  ) {
    this.options = createRuntimeOptions(options as ResolvedRuntimeOptions);
    this.modules = dependencies.modules;
    this.logger = dependencies.logger;

    this._context = createRuntimeContext({
      runtimeId: this.options.runtimeId,
      environment: this.options.environment,
      applicationName: this.options.applicationName,
      applicationVersion: this.options.applicationVersion,
      logger: dependencies.logger,
      container: dependencies.container,
      eventBus: dependencies.eventBus,
    });

    this._status = createStatus("created");

    this.lifecycle = new LifecycleManager(
      this.modules,
      this.logger,
      dependencies.container,
      this.options.runtimeId,
      this.options.environment,
      {
        shutdownTimeout: this.options.shutdownTimeout,
        continueOnFailure: false,
      },
    );

    this.signalHandler = new SignalHandler(this.logger, {
      handleSignals: this.options.handleSignals,
      handleFatalErrors: this.options.handleFatalErrors,
    });

    this.readinessTracker = new ReadinessTracker({
      autoMarkReady: this.options.trackReadiness,
    });
  }

  /**
   * Current runtime state.
   */
  public get state(): RuntimeState {
    return this._state;
  }

  /**
   * Current runtime status.
   */
  public get status(): RuntimeStatus {
    return this._status;
  }

  /**
   * Runtime context.
   */
  public get context(): RuntimeContext {
    return this._context;
  }

  /**
   * Whether the runtime is ready.
   */
  public get ready(): boolean {
    return this._ready;
  }

  /**
   * Starts the runtime.
   */
  public async start(): Promise<void> {
    if (this._state === "running") {
      return;
    }

    if (this.startPromise) {
      return this.startPromise;
    }

    if (!canTransition(this._state, "initializing")) {
      throw new RuntimeStateError(
        `Cannot start runtime from state "${this._state}".`,
      );
    }

    this.startPromise = this.performStart();

    try {
      await this.startPromise;
    } finally {
      this.startPromise = undefined;
    }
  }

  /**
   * Stops the runtime.
   */
  public async stop(): Promise<void> {
    if (this._state === "stopped") {
      return;
    }

    if (this.stopPromise) {
      return this.stopPromise;
    }

    if (this._state === "created") {
      this._state = "stopped";
      this._stoppedAt = new Date();
      return;
    }

    if (!canTransition(this._state, "stopping")) {
      throw new RuntimeStateError(
        `Cannot stop runtime from state "${this._state}".`,
      );
    }

    this.stopPromise = this.performStop();

    try {
      await this.stopPromise;
    } finally {
      this.stopPromise = undefined;
    }
  }

  /**
   * Performs runtime startup.
   */
  private async performStart(): Promise<void> {
    this.transitionTo("initializing");

    if (this.options.emitEvents) {
      this.emitEvent("runtime.initializing");
    }

    try {
      await executeStartup(
        this.lifecycle,
        this.options.runtimeId,
        this._context.eventBus,
        this.logger,
        this.options.emitEvents,
      );

      this.transitionTo("running");
      this._ready = true;
      this._startedAt = new Date();
      this.readinessTracker.markReady("Runtime started successfully.");

      if (this.options.emitEvents) {
        this.emitEvent("runtime.running");
        this.emitEvent("runtime.readiness.changed", createReadinessEventPayload(
          this.options.runtimeId,
          "running",
          true,
          "Runtime started successfully.",
        ));
      }

      this.signalHandler.register(() => {
        this.stop().catch(error => {
          this.logger.error("Shutdown failed.", { errorMessage: error.message });
        });
      });

      this.logger.info("Runtime is ready.", {
        runtimeId: this.options.runtimeId,
        environment: this.options.environment,
      });
    } catch (error) {
      const runtimeError = toRuntimeError(error, "startup");

      this._error = runtimeError;
      this._failedAt = new Date();

      this.logger.error("Runtime failed to start.", { errorMessage: runtimeError.message });

      if (this.options.emitEvents) {
        this.emitEvent("runtime.failed", createFailureEventPayload(
          this.options.runtimeId,
          "failed",
          runtimeError,
          "startup",
        ));
      }

      try {
        await rollbackStartup(this.lifecycle, this.logger);
      } catch (rollbackError) {
        this.logger.error("Rollback failed.", { errorMessage: rollbackError instanceof Error ? rollbackError.message : String(rollbackError) });
      }

      this.transitionTo("failed");

      throw runtimeError;
    }
  }

  /**
   * Performs runtime shutdown.
   */
  private async performStop(): Promise<void> {
    this.transitionTo("stopping");
    this._ready = false;
    this.readinessTracker.markNotReady("Runtime is shutting down.");

    if (this.options.emitEvents) {
      this.emitEvent("runtime.stopping");
    }

    try {
      await executeShutdown(
        this.lifecycle,
        this.options.runtimeId,
        this._context.eventBus,
        this.logger,
        this.options.shutdownTimeout,
        this.options.emitEvents,
      );

      this.transitionTo("stopped");
      this._stoppedAt = new Date();

      this.signalHandler.unregister();

      if (this.options.emitEvents) {
        this.emitEvent("runtime.stopped");
      }

      this.logger.info("Runtime stopped.", {
        runtimeId: this.options.runtimeId,
      });
    } catch (error) {
      const runtimeError = toRuntimeError(error, "shutdown");

      this._error = runtimeError;
      this._failedAt = new Date();

      this.logger.error("Runtime failed to stop.", { errorMessage: runtimeError.message });

      if (this.options.emitEvents) {
        this.emitEvent("runtime.failed", createFailureEventPayload(
          this.options.runtimeId,
          "failed",
          runtimeError,
          "stop",
        ));
      }

      this.transitionTo("failed");

      throw runtimeError;
    }
  }

  /**
   * Transitions to a new state.
   */
  private transitionTo(newState: RuntimeState): void {
    const oldState = this._state;

    if (!canTransition(oldState, newState)) {
      throw new RuntimeStateError(
        `Invalid state transition from "${oldState}" to "${newState}".`,
      );
    }

    this._state = newState;
    this._status = createStatus(newState);

    this.logger.debug(`Runtime state: ${oldState} -> ${newState}`);
  }

  /**
   * Emits a runtime event.
   */
  private emitEvent(
    eventType: string,
    payload?: unknown,
  ): void {
    if (this.options.emitEvents && this._context.eventBus) {
      const eventPayload = payload ?? createRuntimeEventPayload(
        this.options.runtimeId,
        this._state,
      );
      const event = createEvent({
        type: eventType,
        payload: eventPayload,
      });
      this._context.eventBus.publish(event);
    }
  }
}

/**
 * Creates a runtime instance.
 */
export function createRuntime(
  dependencies: RuntimeDependencies,
  options: RuntimeOptions,
): Runtime {
  return new DefaultRuntime(dependencies, options);
}
