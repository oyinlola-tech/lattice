import type {
  Module,
  ModuleId,
} from "./module.js";

import type {
  ModuleContext,
} from "./module-context.js";

import type {
  ModuleRegistry,
} from "./module-registry.js";

import type {
  ModuleLoader,
} from "./module-loader.js";

import {
  createModuleDependencyGraph,
  resolveModuleStartupOrder,
  resolveModuleShutdownOrder,
  type ModuleDependencyGraph,
} from "./module-dependency.js";

/**
 * Lifecycle phases supported by the module system.
 */
export type ModuleLifecyclePhase =
  | "created"
  | "initializing"
  | "initialized"
  | "starting"
  | "started"
  | "stopping"
  | "stopped"
  | "destroying"
  | "destroyed"
  | "failed";

/**
 * Runtime lifecycle state for a module.
 */
export interface ModuleLifecycleState {
  readonly moduleId:
    ModuleId;

  readonly phase:
    ModuleLifecyclePhase;

  readonly error?:
    unknown;

  readonly initializedAt?:
    Date;

  readonly startedAt?:
    Date;

  readonly stoppedAt?:
    Date;

  readonly destroyedAt?:
    Date;
}

/**
 * Lifecycle hooks supported by a module.
 *
 * Modules can implement any subset of these hooks.
 */
export interface ModuleLifecycleHooks {
  /**
   * Called before the module starts accepting work.
   */
  initialize?(
    context: ModuleContext,
  ):
    | void
    | Promise<void>;

  /**
   * Called after all modules have initialized.
   *
   * This is useful when a module needs other modules to
   * already be initialized before it becomes active.
   */
  start?(
    context: ModuleContext,
  ):
    | void
    | Promise<void>;

  /**
   * Called when the application begins shutting down.
   */
  stop?(
    context: ModuleContext,
  ):
    | void
    | Promise<void>;

  /**
   * Called after the module has stopped.
   *
   * This is the place for final resource cleanup.
   */
  destroy?(
    context: ModuleContext,
  ):
    | void
    | Promise<void>;
}

/**
 * Options controlling module lifecycle behavior.
 */
export interface ModuleLifecycleOptions {
  /**
   * Whether initialization should continue when one module fails.
   *
   * Defaults to false.
   */
  readonly continueOnInitializeError?: boolean;

  /**
   * Whether startup should continue when one module fails.
   *
   * Defaults to false.
   */
  readonly continueOnStartError?: boolean;

  /**
   * Whether shutdown should continue when one module fails.
   *
   * Defaults to true.
   */
  readonly continueOnStopError?: boolean;

  /**
   * Whether destruction should continue when one module fails.
   *
   * Defaults to true.
   */
  readonly continueOnDestroyError?: boolean;
}

/**
 * Error thrown when a module lifecycle operation fails.
 */
export class ModuleLifecycleError
  extends Error {
  public readonly moduleId:
    ModuleId;

  public readonly phase:
    ModuleLifecyclePhase;

  public readonly cause:
    unknown;

  public constructor(
    moduleId: ModuleId,
    phase: ModuleLifecyclePhase,
    cause: unknown,
  ) {
    const message =
      cause instanceof Error
        ? cause.message
        : String(cause);

    super(
      `Module "${moduleId}" failed during ${phase}: ${message}`,
    );

    this.name =
      "ModuleLifecycleError";

    this.moduleId =
      moduleId;

    this.phase =
      phase;

    this.cause =
      cause;
  }
}

/**
 * Result of a lifecycle operation.
 */
export interface ModuleLifecycleResult {
  readonly completed:
    readonly ModuleId[];

  readonly failed:
    readonly ModuleId[];
}

/**
 * Internal lifecycle state map.
 */
type LifecycleStateMap =
  Map<
    ModuleId,
    ModuleLifecycleState
  >;

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

  private initialized = false;

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
   * Ensures lifecycle state is synchronized with the registry.
   *
   * This is called lazily before any lifecycle operation.
   * It handles dynamically registered modules by creating
   * initial state for any modules that don't have state yet.
   */
  private ensureStateSynchronized(): void {
    for (
      const registration of
        this.registry.getAll()
    ) {
      const moduleId =
        registration.definition.id;

      if (!this.states.has(moduleId)) {
        this.states.set(
          moduleId,
          {
            moduleId,
            phase: "created",
          },
        );
      }
    }
  }

  /**
   * Initializes every loaded module.
   */
  public async initialize(): Promise<ModuleLifecycleResult> {
    return this.runExclusive(
      async () => {
        this.ensureStateSynchronized();

        const order =
          this.getStartupOrder();

        return this.executePhase(
          order,
          "initialize",
          "initializing",
          "initialized",
          this.options
            .continueOnInitializeError,
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
        this.ensureStateSynchronized();

        const order =
          this.getStartupOrder();

        return this.executePhase(
          order,
          "start",
          "starting",
          "started",
          this.options
            .continueOnStartError,
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
        this.ensureStateSynchronized();

        const order =
          this.getShutdownOrder();

        return this.executePhase(
          order,
          "stop",
          "stopping",
          "stopped",
          this.options
            .continueOnStopError,
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
        this.ensureStateSynchronized();

        const order =
          this.getShutdownOrder();

        return this.executePhase(
          order,
          "destroy",
          "destroying",
          "destroyed",
          this.options
            .continueOnDestroyError,
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
    | ModuleLifecycleState
    | undefined {
    return this.states.get(
      moduleId,
    );
  }

  /**
   * Returns the state or throws when unavailable.
   */
  public requireState(
    moduleId: ModuleId,
  ): ModuleLifecycleState {
    const state =
      this.getState(
        moduleId,
      );

    if (!state) {
      throw new Error(
        `No lifecycle state exists for module "${moduleId}".`,
      );
    }

    return state;
  }

  /**
   * Returns all lifecycle states.
   */
  public getStates():
    ReadonlyMap<
      ModuleId,
      ModuleLifecycleState
    > {
    return new Map(
      this.states,
    );
  }

  /**
   * Checks whether a module has reached the initialized phase.
   */
  public isInitialized(
    moduleId: ModuleId,
  ): boolean {
    const phase =
      this.getState(
        moduleId,
      )?.phase;

    return (
      phase ===
        "initialized" ||
      phase ===
        "starting" ||
      phase ===
        "started"
    );
  }

  /**
   * Checks whether a module has started.
   */
  public isStarted(
    moduleId: ModuleId,
  ): boolean {
    return (
      this.getState(
        moduleId,
      )?.phase ===
      "started"
    );
  }

  /**
   * Checks whether a module has been destroyed.
   */
  public isDestroyed(
    moduleId: ModuleId,
  ): boolean {
    return (
      this.getState(
        moduleId,
      )?.phase ===
      "destroyed"
    );
  }



  /**
   * Executes a lifecycle phase against a module order.
   */
  private async executePhase(
    order:
      readonly ModuleId[],
    hook:
      keyof ModuleLifecycleHooks,
    activePhase:
      ModuleLifecyclePhase,
    completedPhase:
      ModuleLifecyclePhase,
    continueOnError:
      boolean,
  ): Promise<ModuleLifecycleResult> {
    const completed:
      ModuleId[] =
      [];

    const failed:
      ModuleId[] =
      [];

    for (
      const moduleId of order
    ) {
      const registration =
        this.registry.get(
          moduleId,
        );

      if (
        !registration?.instance
      ) {
        continue;
      }

      const module =
        registration.instance;

      const context =
        this.loader.getContext(
          moduleId,
        );

      if (!context) {
        failed.push(
          moduleId,
        );

        this.setState(
          moduleId,
          "failed",
        );

        if (!continueOnError) {
          throw new ModuleLifecycleError(
            moduleId,
            activePhase,
            new Error(
              `Module "${moduleId}" does not have a ModuleContext.`,
            ),
          );
        }

        continue;
      }

      if (
        !this.canEnterPhase(
          moduleId,
          hook,
        )
      ) {
        continue;
      }

      this.setState(
        moduleId,
        activePhase,
      );

      try {
        await this.invokeHook(
          module,
          hook,
          context,
        );

        this.setState(
          moduleId,
          completedPhase,
        );

        completed.push(
          moduleId,
        );
      } catch (error) {
        this.setState(
          moduleId,
          "failed",
          error,
        );

        failed.push(
          moduleId,
        );

        if (!continueOnError) {
          throw new ModuleLifecycleError(
            moduleId,
            activePhase,
            error,
          );
        }
      }
    }

    return {
      completed:
        Object.freeze([
          ...completed,
        ]),

      failed:
        Object.freeze([
          ...failed,
        ]),
    };
  }

  /**
   * Invokes a lifecycle hook when the module implements it.
   */
  private async invokeHook(
    module: Module,
    hook:
      keyof ModuleLifecycleHooks,
    context: ModuleContext,
  ): Promise<void> {
    const lifecycleModule =
      module as Module &
        Partial<
          ModuleLifecycleHooks
        >;

    const handler =
      lifecycleModule[hook];

    if (
      typeof handler !==
      "function"
    ) {
      return;
    }

    await handler.call(
      module,
      context,
    );
  }

  /**
   * Determines whether a module can enter a lifecycle phase.
   */
  private canEnterPhase(
    moduleId: ModuleId,
    hook:
      keyof ModuleLifecycleHooks,
  ): boolean {
    const state =
      this.getState(
        moduleId,
      );

    if (!state) {
      return false;
    }

    switch (hook) {
      case "initialize":
        return (
          state.phase ===
          "created"
        );

      case "start":
        return (
          state.phase ===
          "initialized"
        );

      case "stop":
        return (
          state.phase ===
          "started"
        );

      case "destroy":
        return (
          state.phase ===
            "stopped" ||
          state.phase ===
            "initialized" ||
          state.phase ===
            "created"
        );

      default:
        return false;
    }
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
   * Updates local lifecycle state.
   */
  private setState(
    moduleId: ModuleId,
    phase:
      ModuleLifecyclePhase,
    error?: unknown,
  ): void {
    const previous =
      this.states.get(
        moduleId,
      );

    const now =
      new Date();

    this.states.set(
      moduleId,
      Object.freeze({
        moduleId,

        phase,

        error,

        initializedAt:
          phase ===
          "initialized"
            ? now
            : previous
                ?.initializedAt,

        startedAt:
          phase ===
          "started"
            ? now
            : previous?.startedAt,

        stoppedAt:
          phase ===
          "stopped"
            ? now
            : previous?.stoppedAt,

        destroyedAt:
          phase ===
          "destroyed"
            ? now
            : previous
                ?.destroyedAt,
      }),
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