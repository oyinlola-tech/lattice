import type {
  ModuleId,
} from "../module.js";

import type {
  ModuleRegistry,
} from "../moduleRegistry/index.js";

import type {
  ModuleLoader,
} from "../moduleLoader/index.js";

import {
  createModuleDependencyGraph,
  resolveModuleStartupOrder,
  resolveModuleShutdownOrder,
} from "../moduleDependency/index.js";

import type {
  ModuleDependencyGraph,
} from "../moduleDependency/moduleDependency.type.js";

import type {
  ModuleLifecycleOptions,
  ModuleLifecycleResult,
  LifecycleStateMap,
} from "./moduleLifecycle.type.js";

import {
  ensureStateSynchronized,
  getLifecycleState,
  requireLifecycleState,
  getAllLifecycleStates,
  isModuleInitialized,
  isModuleStarted,
  isModuleDestroyed,
  executeLifecyclePhase,
} from "./moduleLifecycle.stateMachine.js";

/**
 * Module lifecycle manager.
 *
 * Responsibilities:
 *
 * 1. Initialize loaded modules.
 * 2. Start initialized modules.
 * 3. Stop started modules.
 * 4. Destroy stopped modules.
 * 5. Respect dependency ordering.
 * 6. Track lifecycle state.
 *
 * The manager does not create module instances.
 * ModuleLoader owns that responsibility.
 *
 * The relationship between module lifecycle and application lifecycle:
 *
 * - Application Lifecycle (LifecycleManager):
 *   Manages application-wide resources like HTTP servers,
 *   database connections, message brokers, etc.
 *
 * - Module Lifecycle (ModuleLifecycleManager):
 *   Manages module-specific resources within each module.
 *   Each module can have its own initialize/start/stop/destroy
 *   hooks that run in dependency order.
 *
 * During runtime startup:
 *   1. Runtime creates ModuleLoader and ModuleLifecycleManager
 *   2. ModuleLoader loads all modules and creates instances
 *   3. ModuleLifecycleManager initializes modules in dependency order
 *   4. ModuleLifecycleManager starts modules in dependency order
 *
 * During runtime shutdown:
 *   1. ModuleLifecycleManager stops modules in reverse dependency order
 *   2. ModuleLifecycleManager destroys modules in reverse dependency order
 */
export class ModuleLifecycleManager {
  private readonly registry:
    ModuleRegistry;

  private readonly loader:
    ModuleLoader;

  private readonly options:
    Required<ModuleLifecycleOptions>;

  private readonly states:
    LifecycleStateMap =
    new Map();

  private operation:
    Promise<void> | undefined;

  public constructor(
    registry: ModuleRegistry,
    loader: ModuleLoader,
    options:
      ModuleLifecycleOptions = {},
  ) {
    this.registry =
      registry;

    this.loader =
      loader;

    this.options = {
      continueOnInitializeError:
        options.continueOnInitializeError ??
        false,

      continueOnStartError:
        options.continueOnStartError ??
        false,

      continueOnStopError:
        options.continueOnStopError ??
        true,

      continueOnDestroyError:
        options.continueOnDestroyError ??
        true,
    };
  }

  /**
   * Initializes every loaded module.
   */
  public async initialize(): Promise<ModuleLifecycleResult> {
    return this.runExclusive(
      async () => {
        ensureStateSynchronized(
          this.registry,
          this.states,
        );

        const order =
          this.getStartupOrder();

        return executeLifecyclePhase(
          order,
          "initialize",
          "initializing",
          "initialized",
          this.options
            .continueOnInitializeError,
          this.registry,
          this.loader,
          this.states,
        );
      },
    );
  }

  /**
   * Starts every initialized module.
   */
  public async start(): Promise<ModuleLifecycleResult> {
    return this.runExclusive(
      async () => {
        ensureStateSynchronized(
          this.registry,
          this.states,
        );

        const order =
          this.getStartupOrder();

        return executeLifecyclePhase(
          order,
          "start",
          "starting",
          "started",
          this.options
            .continueOnStartError,
          this.registry,
          this.loader,
          this.states,
        );
      },
    );
  }

  /**
   * Stops started modules.
   *
   * Shutdown runs in reverse dependency order.
   */
  public async stop(): Promise<ModuleLifecycleResult> {
    return this.runExclusive(
      async () => {
        ensureStateSynchronized(
          this.registry,
          this.states,
        );

        const order =
          this.getShutdownOrder();

        return executeLifecyclePhase(
          order,
          "stop",
          "stopping",
          "stopped",
          this.options
            .continueOnStopError,
          this.registry,
          this.loader,
          this.states,
        );
      },
    );
  }

  /**
   * Destroys stopped modules.
   *
   * Destruction runs in reverse dependency order.
   */
  public async destroy(): Promise<ModuleLifecycleResult> {
    return this.runExclusive(
      async () => {
        ensureStateSynchronized(
          this.registry,
          this.states,
        );

        const order =
          this.getShutdownOrder();

        return executeLifecyclePhase(
          order,
          "destroy",
          "destroying",
          "destroyed",
          this.options
            .continueOnDestroyError,
          this.registry,
          this.loader,
          this.states,
        );
      },
    );
  }

  /**
   * Performs a complete startup.
   */
  public async startApplication(): Promise<{
    readonly initialized:
      ModuleLifecycleResult;

    readonly started:
      ModuleLifecycleResult;
  }> {
    const initialized =
      await this.initialize();

    if (
      initialized.failed.length >
        0 &&
      !this.options
        .continueOnInitializeError
    ) {
      throw new Error(
        "Application startup aborted because module initialization failed.",
      );
    }

    const started =
      await this.start();

    if (
      started.failed.length >
        0 &&
      !this.options
        .continueOnStartError
    ) {
      throw new Error(
        "Application startup aborted because module startup failed.",
      );
    }

    return {
      initialized,
      started,
    };
  }

  /**
   * Performs a complete shutdown.
   */
  public async stopApplication(): Promise<{
    readonly stopped:
      ModuleLifecycleResult;

    readonly destroyed:
      ModuleLifecycleResult;
  }> {
    const stopped =
      await this.stop();

    const destroyed =
      await this.destroy();

    return {
      stopped,
      destroyed,
    };
  }

  /**
   * Returns the lifecycle state of a module.
   */
  public getState(
    moduleId: ModuleId,
  ):
    | import("./moduleLifecycle.type.js").ModuleLifecycleState
    | undefined {
    return getLifecycleState(
      moduleId,
      this.states,
    );
  }

  /**
   * Returns the state or throws when unavailable.
   */
  public requireState(
    moduleId: ModuleId,
  ):
    import("./moduleLifecycle.type.js").ModuleLifecycleState {
    return requireLifecycleState(
      moduleId,
      this.states,
    );
  }

  /**
   * Returns all lifecycle states.
   */
  public getStates():
    ReadonlyMap<
      ModuleId,
      import("./moduleLifecycle.type.js").ModuleLifecycleState
    > {
    return getAllLifecycleStates(
      this.states,
    );
  }

  /**
   * Checks whether a module has reached the initialized phase.
   */
  public isInitialized(
    moduleId: ModuleId,
  ): boolean {
    return isModuleInitialized(
      moduleId,
      this.states,
    );
  }

  /**
   * Checks whether a module has started.
   */
  public isStarted(
    moduleId: ModuleId,
  ): boolean {
    return isModuleStarted(
      moduleId,
      this.states,
    );
  }

  /**
   * Checks whether a module has been destroyed.
   */
  public isDestroyed(
    moduleId: ModuleId,
  ): boolean {
    return isModuleDestroyed(
      moduleId,
      this.states,
    );
  }

  /**
   * Builds the dependency graph for currently registered modules.
   */
  private createGraph():
    ModuleDependencyGraph {
    const nodes =
      this.registry
        .getAll()
        .map(
          (registration) => ({
            id:
              registration.definition.id,

            dependencies:
              this.registry.getDependencies(
                registration.definition.id,
              ),
          }),
        );

    return createModuleDependencyGraph(
      nodes,
    );
  }

  /**
   * Returns startup order for loaded modules.
   */
  private getStartupOrder():
    readonly ModuleId[] {
    const graph =
      this.createGraph();

    const order =
      resolveModuleStartupOrder(
        graph,
      );

    return Object.freeze(
      order.filter(
        (moduleId) =>
          this.registry.get(
            moduleId,
          )?.state ===
          "loaded",
      ),
    );
  }

  /**
   * Returns shutdown order for loaded modules.
   */
  private getShutdownOrder():
    readonly ModuleId[] {
    const graph =
      this.createGraph();

    const order =
      resolveModuleShutdownOrder(
        graph,
      );

    return Object.freeze(
      order.filter(
        (moduleId) =>
          this.registry.get(
            moduleId,
          )?.state ===
          "loaded",
      ),
    );
  }

  /**
   * Prevents lifecycle operations from running concurrently.
   */
  private async runExclusive<T>(
    operation:
      () => Promise<T>,
  ): Promise<T> {
    while (this.operation) {
      await this.operation;
    }

    let resolveOperation:
      (() => void) | undefined;

    const lock =
      new Promise<void>(
        (resolve) => {
          resolveOperation =
            resolve;
        },
      );

    this.operation =
      lock;

    try {
      return await operation();
    } finally {
      resolveOperation?.();

      this.operation =
        undefined;
    }
  }
}

/**
 * Creates a module lifecycle manager.
 */
export function createModuleLifecycleManager(
  registry: ModuleRegistry,
  loader: ModuleLoader,
  options:
    ModuleLifecycleOptions = {},
): ModuleLifecycleManager {
  return new ModuleLifecycleManager(
    registry,
    loader,
    options,
  );
}
