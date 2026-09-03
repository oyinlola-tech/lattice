import type { Logger } from "@zudo/logger";

import type { Container } from "@zudo/container";

import type { Module, ModuleContext } from "@zudo/core";

import type {
  LifecycleResult,
  LifecycleFailure,
  LifecyclePhase,
  ManagedModule,
  LifecycleManagerOptions,
} from "./lifecycle.type.js";

import { resolveDependencies } from "../dependencyGraph/index.js";

import {
  RuntimeStartError,
  RuntimeStopError,
  RuntimeDependencyError,
} from "../runtimeError/index.js";

/**
 * Manages the lifecycle of runtime modules.
 */
export class LifecycleManager {
  private readonly modules: ReadonlyMap<string, Module>;
  private readonly logger: Logger;
  private readonly container: Container;
  private readonly runtimeId: string;
  private readonly environment: string;
  private readonly options: Required<LifecycleManagerOptions>;
  private readonly initializedModules: string[] = [];
  private readonly startedModules: string[] = [];

  public constructor(
    modules: ReadonlyMap<string, Module>,
    logger: Logger,
    container: Container,
    runtimeId: string,
    environment: string,
    options: LifecycleManagerOptions = {},
  ) {
    this.modules = modules;
    this.logger = logger;
    this.container = container;
    this.runtimeId = runtimeId;
    this.environment = environment;
    this.options = {
      shutdownTimeout: options.shutdownTimeout ?? 30_000,
      continueOnFailure: options.continueOnFailure ?? false,
      parallelInitialization: options.parallelInitialization ?? true,
    };
  }

  /**
   * Initializes all modules in dependency order.
   */
  public async initialize(): Promise<LifecycleResult> {
    const startTime = Date.now();
    const succeeded: string[] = [];
    const failed: LifecycleFailure[] = [];

    const depGraph = this.buildModuleDependencyGraph();

    for (const moduleId of depGraph.order) {
      const module = this.modules.get(moduleId);
      if (!module) {
        failed.push({
          moduleId,
          phase: "initialize",
          error: new RuntimeDependencyError(moduleId, "unknown"),
          durationMs: 0,
        });
        continue;
      }

      const moduleStartTime = Date.now();

      try {
        if (module.onInitialize) {
          const context = this.createModuleContext(module);
          await module.onInitialize(context);
        }

        succeeded.push(moduleId);
        this.initializedModules.push(moduleId);

        this.logger.debug(`Module "${moduleId}" initialized.`, {
          durationMs: Date.now() - moduleStartTime,
        });
      } catch (error) {
        const failure: LifecycleFailure = {
          moduleId,
          phase: "initialize",
          error: error instanceof Error ? error : new Error(String(error)),
          durationMs: Date.now() - moduleStartTime,
        };

        failed.push(failure);

        this.logger.error(
          `Module "${moduleId}" failed during initialization.`,
          { error: failure.error },
        );

        if (!this.options.continueOnFailure) {
          break;
        }
      }
    }

    return Object.freeze({
      phase: "initialize",
      succeeded: Object.freeze(succeeded),
      failed: Object.freeze(failed),
      durationMs: Date.now() - startTime,
    });
  }

  /**
   * Starts all modules in dependency order.
   */
  public async start(): Promise<LifecycleResult> {
    const startTime = Date.now();
    const succeeded: string[] = [];
    const failed: LifecycleFailure[] = [];

    for (const moduleId of this.initializedModules) {
      const module = this.modules.get(moduleId);
      if (!module) continue;

      const moduleStartTime = Date.now();

      try {
        if (module.onReady) {
          const context = this.createModuleContext(module);
          await module.onReady(context);
        }

        succeeded.push(moduleId);
        this.startedModules.push(moduleId);

        this.logger.debug(`Module "${moduleId}" started.`, {
          durationMs: Date.now() - moduleStartTime,
        });
      } catch (error) {
        const failure: LifecycleFailure = {
          moduleId,
          phase: "start",
          error: error instanceof Error ? error : new Error(String(error)),
          durationMs: Date.now() - moduleStartTime,
        };

        failed.push(failure);

        this.logger.error(`Module "${moduleId}" failed during startup.`, {
          error: failure.error,
        });

        if (!this.options.continueOnFailure) {
          break;
        }
      }
    }

    return Object.freeze({
      phase: "start",
      succeeded: Object.freeze(succeeded),
      failed: Object.freeze(failed),
      durationMs: Date.now() - startTime,
    });
  }

  /**
   * Stops all modules in reverse dependency order.
   */
  public async stop(): Promise<LifecycleResult> {
    const startTime = Date.now();
    const succeeded: string[] = [];
    const failed: LifecycleFailure[] = [];

    const reversedModules = [...this.startedModules].reverse();

    for (const moduleId of reversedModules) {
      const module = this.modules.get(moduleId);
      if (!module) continue;

      const moduleStartTime = Date.now();

      try {
        if (module.onShutdown) {
          const context = this.createModuleContext(module);
          await module.onShutdown(context);
        }

        succeeded.push(moduleId);

        this.logger.debug(`Module "${moduleId}" stopped.`, {
          durationMs: Date.now() - moduleStartTime,
        });
      } catch (error) {
        const failure: LifecycleFailure = {
          moduleId,
          phase: "stop",
          error: error instanceof Error ? error : new Error(String(error)),
          durationMs: Date.now() - moduleStartTime,
        };

        failed.push(failure);

        this.logger.error(`Module "${moduleId}" failed during shutdown.`, {
          error: failure.error,
        });
      }
    }

    return Object.freeze({
      phase: "stop",
      succeeded: Object.freeze(succeeded),
      failed: Object.freeze(failed),
      durationMs: Date.now() - startTime,
    });
  }

  /**
   * Destroys all modules in reverse dependency order.
   */
  public async destroy(): Promise<LifecycleResult> {
    const startTime = Date.now();
    const succeeded: string[] = [];
    const failed: LifecycleFailure[] = [];

    const reversedModules = [...this.startedModules, ...this.initializedModules]
      .filter((id, index, arr) => arr.indexOf(id) === index)
      .reverse();

    for (const moduleId of reversedModules) {
      const module = this.modules.get(moduleId);
      if (!module) continue;

      const moduleStartTime = Date.now();

      try {
        if (module.onDestroy) {
          const context = this.createModuleContext(module);
          await module.onDestroy(context);
        }

        succeeded.push(moduleId);

        this.logger.debug(`Module "${moduleId}" destroyed.`, {
          durationMs: Date.now() - moduleStartTime,
        });
      } catch (error) {
        const failure: LifecycleFailure = {
          moduleId,
          phase: "destroy",
          error: error instanceof Error ? error : new Error(String(error)),
          durationMs: Date.now() - moduleStartTime,
        };

        failed.push(failure);

        this.logger.error(`Module "${moduleId}" failed during destruction.`, {
          error: failure.error,
        });
      }
    }

    return Object.freeze({
      phase: "destroy",
      succeeded: Object.freeze(succeeded),
      failed: Object.freeze(failed),
      durationMs: Date.now() - startTime,
    });
  }

  /**
   * Rolls back initialization for modules that were started.
   */
  public async rollback(): Promise<void> {
    const reversedModules = [...this.startedModules].reverse();

    for (const moduleId of reversedModules) {
      const module = this.modules.get(moduleId);
      if (!module?.onShutdown) continue;

      try {
        const context = this.createModuleContext(module);
        await module.onShutdown(context);

        this.logger.debug(`Module "${moduleId}" rolled back.`);
      } catch (error) {
        this.logger.error(`Module "${moduleId}" rollback failed.`, {
          errorMessage: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }

  /**
   * Creates a module context for lifecycle hooks.
   */
  private createModuleContext(module: Module): ModuleContext {
    return {
      id: module.id,
      name: module.name,
      version: module.version,
      options: module.options ?? {},
      scope: module.scope,
      application: {} as ModuleContext["application"],
      configuration: {} as unknown as ModuleContext["configuration"],
      logger: this.logger,
      getConfiguration: () =>
        ({}) as unknown as ReturnType<ModuleContext["getConfiguration"]>,
      getConfig: () => undefined,
      requireConfig: (path: string) => {
        throw new Error(`Config "${path}" not found.`);
      },
      getModuleContext: () => undefined,
      hasModule: () => false,
    };
  }

  /**
   * Builds a dependency graph from registered modules.
   */
  private buildModuleDependencyGraph() {
    const moduleDeps = new Map<string, readonly string[]>();

    for (const [id, module] of this.modules) {
      moduleDeps.set(id, module.dependencies ?? []);
    }

    return resolveDependencies(moduleDeps);
  }
}
