import type { ApplicationContext } from "../application/applicationContext.context.js";
import type { ConfigurationManager } from "../configuration/configurationManager.manager.js";
import type { Logger } from "../logging/core/logger.js";
import type { Module } from "../modules/module.js";
import type { ModuleLoader } from "../modules/moduleLoader/index.js";
import type { ModuleLifecycleManager } from "../modules/moduleLifecycle/index.js";
import type { ModuleRegistry } from "../modules/moduleRegistry/index.js";
import {
  RuntimeError as BaseRuntimeError,
  RuntimeStateError as BaseRuntimeStateError,
} from "@oyinlola141/lattice-errors";

/** Runtime lifecycle state. */
export type RuntimeState =
  "created" | "bootstrapping" | "ready" | "stopping" | "stopped" | "failed";

/** Dependencies required by the runtime. */
export interface RuntimeDependencies {
  readonly application: ApplicationContext;
  readonly configuration: ConfigurationManager;
  readonly logger: Logger;
  readonly moduleRegistry: ModuleRegistry;
  readonly moduleLoader: ModuleLoader;
  readonly moduleLifecycle: ModuleLifecycleManager;
}

/** Runtime status snapshot. */
export interface RuntimeStatus {
  readonly state: RuntimeState;
  readonly startedAt?: Date;
  readonly stoppedAt?: Date;
  readonly failedAt?: Date;
  readonly error?: unknown;
}

/** Runtime contract. */
export interface Runtime {
  readonly state: RuntimeState;
  start(): Promise<void>;
  stop(): Promise<void>;
  getStatus(): RuntimeStatus;
  getApplicationContext(): ApplicationContext;
  getConfiguration(): ConfigurationManager;
  getLogger(): Logger;
  getModuleRegistry(): ModuleRegistry;
  getModuleLoader(): ModuleLoader;
  getModuleLifecycle(): ModuleLifecycleManager;
  getModule(moduleId: string): Module | undefined;
  requireModule(moduleId: string): Module;
}

/** Error thrown for invalid runtime operations. */
export class RuntimeStateError extends BaseRuntimeStateError {
  public constructor(message: string) {
    super(message);
  }
}

/** Error thrown when runtime startup/shutdown fails. */
export class RuntimeError extends BaseRuntimeError {
  public readonly moduleIds: readonly string[];
  public constructor(message: string, moduleIds: readonly string[] = []) {
    super(message, { phase: "runtime" });
    this.moduleIds = Object.freeze([...moduleIds]);
  }
}

/**
 * Default runtime implementation.
 * Orchestrates Application, Configuration, Logger, ModuleRegistry,
 * ModuleLoader, ModuleLifecycleManager.
 */
export class DefaultRuntime implements Runtime {
  private _state: RuntimeState = "created";
  private startedAt: Date | undefined;
  private stoppedAt: Date | undefined;
  private failedAt: Date | undefined;
  private error: unknown;
  private startPromise: Promise<void> | undefined;
  private stopPromise: Promise<void> | undefined;
  private readonly application: ApplicationContext;
  private readonly configuration: ConfigurationManager;
  private readonly logger: Logger;
  private readonly moduleRegistry: ModuleRegistry;
  private readonly moduleLoader: ModuleLoader;
  private readonly moduleLifecycle: ModuleLifecycleManager;

  public constructor(dependencies: RuntimeDependencies) {
    this.application = dependencies.application;
    this.configuration = dependencies.configuration;
    this.logger = dependencies.logger;
    this.moduleRegistry = dependencies.moduleRegistry;
    this.moduleLoader = dependencies.moduleLoader;
    this.moduleLifecycle = dependencies.moduleLifecycle;
  }

  public get state(): RuntimeState {
    return this._state;
  }

  public async start(): Promise<void> {
    if (this._state === "ready") return;
    if (this.startPromise) return this.startPromise;
    if (this._state === "stopping")
      throw new RuntimeStateError(
        "Cannot start the runtime while it is stopping.",
      );
    if (this._state === "stopped")
      throw new RuntimeStateError("A stopped runtime cannot be started again.");
    if (this._state === "failed")
      throw new RuntimeStateError("A failed runtime cannot be restarted.");
    this.startPromise = this.performStart();
    try {
      await this.startPromise;
    } finally {
      this.startPromise = undefined;
    }
  }

  public async stop(): Promise<void> {
    if (this._state === "stopped") return;
    if (this.stopPromise) return this.stopPromise;
    if (this._state === "created") {
      this._state = "stopped";
      this.stoppedAt = new Date();
      return;
    }
    if (this._state === "bootstrapping")
      throw new RuntimeStateError(
        "Cannot stop the runtime while it is bootstrapping.",
      );
    if (this._state === "stopping") return;
    this.stopPromise = this.performStop();
    try {
      await this.stopPromise;
    } finally {
      this.stopPromise = undefined;
    }
  }

  private async performStart(): Promise<void> {
    this._state = "bootstrapping";
    this.error = undefined;
    try {
      this.logger.info("Starting application runtime.");
      await this.moduleLoader.loadAll();

      const initialization = await this.moduleLifecycle.initialize();
      if (initialization.failed.length > 0)
        throw new RuntimeError(
          "One or more modules failed during initialization.",
          initialization.failed,
        );

      const startup = await this.moduleLifecycle.start();
      if (startup.failed.length > 0)
        throw new RuntimeError(
          "One or more modules failed during startup.",
          startup.failed,
        );

      this.startedAt = new Date();
      this._state = "ready";
      this.logger.info("Application runtime is ready.");
    } catch (error) {
      this.error = error;
      this.failedAt = new Date();
      this._state = "failed";
      this.logger.error("Application runtime failed to start.", { error });
      try {
        await this.moduleLifecycle.stopApplication();
      } catch (cleanupError) {
        this.logger.error("Runtime startup cleanup failed.", {
          error: cleanupError,
        });
      }
      throw error;
    }
  }

  private async performStop(): Promise<void> {
    this._state = "stopping";
    try {
      this.logger.info("Stopping application runtime.");
      await this.moduleLifecycle.stopApplication();
      this.stoppedAt = new Date();
      this._state = "stopped";
      this.logger.info("Application runtime stopped.");
    } catch (error) {
      this.error = error;
      this.failedAt = new Date();
      this._state = "failed";
      this.logger.error("Application runtime failed to stop cleanly.", {
        error,
      });
      throw error;
    }
  }

  public getStatus(): RuntimeStatus {
    return Object.freeze({
      state: this._state,
      startedAt: this.startedAt,
      stoppedAt: this.stoppedAt,
      failedAt: this.failedAt,
      error: this.error,
    });
  }
  public getApplicationContext(): ApplicationContext {
    return this.application;
  }
  public getConfiguration(): ConfigurationManager {
    return this.configuration;
  }
  public getLogger(): Logger {
    return this.logger;
  }
  public getModuleRegistry(): ModuleRegistry {
    return this.moduleRegistry;
  }
  public getModuleLoader(): ModuleLoader {
    return this.moduleLoader;
  }
  public getModuleLifecycle(): ModuleLifecycleManager {
    return this.moduleLifecycle;
  }
  public getModule(moduleId: string): Module | undefined {
    return this.moduleRegistry.get(moduleId)?.instance;
  }
  public requireModule(moduleId: string): Module {
    const module = this.getModule(moduleId);
    if (!module)
      throw new RuntimeError(`Module "${moduleId}" is not loaded.`, [moduleId]);
    return module;
  }
}

/** Creates a runtime. */
export function createRuntime(dependencies: RuntimeDependencies): Runtime {
  return new DefaultRuntime(dependencies);
}
