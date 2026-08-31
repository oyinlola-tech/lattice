import type { ModuleId } from "../module.js";
import type { ModuleRegistry } from "../moduleRegistry/index.js";
import type { ModuleLoader } from "../moduleLoader/index.js";
import { createModuleDependencyGraph, resolveModuleStartupOrder, resolveModuleShutdownOrder } from "../moduleDependency/index.js";
import type { ModuleDependencyGraph } from "../moduleDependency/moduleDependency.type.js";
import type { ModuleLifecycleOptions, ModuleLifecycleResult, LifecycleStateMap } from "./moduleLifecycle.type.js";
import { ensureStateSynchronized, getLifecycleState, requireLifecycleState, getAllLifecycleStates, isModuleInitialized, isModuleStarted, isModuleDestroyed, executeLifecyclePhase } from "./moduleLifecycle.stateMachine.js";

/**
 * Module lifecycle manager.
 * Initializes, starts, stops, and destroys modules in dependency order.
 */
export class ModuleLifecycleManager {
  private readonly registry: ModuleRegistry;
  private readonly loader: ModuleLoader;
  private readonly options: Required<ModuleLifecycleOptions>;
  private readonly states: LifecycleStateMap = new Map();
  private operation: Promise<void> | undefined;

  public constructor(registry: ModuleRegistry, loader: ModuleLoader, options: ModuleLifecycleOptions = {}) {
    this.registry = registry;
    this.loader = loader;
    this.options = {
      continueOnInitializeError: options.continueOnInitializeError ?? false,
      continueOnStartError: options.continueOnStartError ?? false,
      continueOnStopError: options.continueOnStopError ?? true,
      continueOnDestroyError: options.continueOnDestroyError ?? true,
    };
  }

  public async initialize(): Promise<ModuleLifecycleResult> {
    return this.runExclusive(async () => {
      ensureStateSynchronized(this.registry, this.states);
      return executeLifecyclePhase(this.getStartupOrder(), "initialize", "initializing", "initialized", this.options.continueOnInitializeError, this.registry, this.loader, this.states);
    });
  }

  public async start(): Promise<ModuleLifecycleResult> {
    return this.runExclusive(async () => {
      ensureStateSynchronized(this.registry, this.states);
      return executeLifecyclePhase(this.getStartupOrder(), "start", "starting", "started", this.options.continueOnStartError, this.registry, this.loader, this.states);
    });
  }

  public async stop(): Promise<ModuleLifecycleResult> {
    return this.runExclusive(async () => {
      ensureStateSynchronized(this.registry, this.states);
      return executeLifecyclePhase(this.getShutdownOrder(), "stop", "stopping", "stopped", this.options.continueOnStopError, this.registry, this.loader, this.states);
    });
  }

  public async destroy(): Promise<ModuleLifecycleResult> {
    return this.runExclusive(async () => {
      ensureStateSynchronized(this.registry, this.states);
      return executeLifecyclePhase(this.getShutdownOrder(), "destroy", "destroying", "destroyed", this.options.continueOnDestroyError, this.registry, this.loader, this.states);
    });
  }

  public async startApplication(): Promise<{ readonly initialized: ModuleLifecycleResult; readonly started: ModuleLifecycleResult }> {
    const initialized = await this.initialize();
    if (initialized.failed.length > 0 && !this.options.continueOnInitializeError) throw new Error("Application startup aborted because module initialization failed.");
    const started = await this.start();
    if (started.failed.length > 0 && !this.options.continueOnStartError) throw new Error("Application startup aborted because module startup failed.");
    return { initialized, started };
  }

  public async stopApplication(): Promise<{ readonly stopped: ModuleLifecycleResult; readonly destroyed: ModuleLifecycleResult }> {
    const stopped = await this.stop();
    const destroyed = await this.destroy();
    return { stopped, destroyed };
  }

  public getState(moduleId: ModuleId): import("./moduleLifecycle.type.js").ModuleLifecycleState | undefined { return getLifecycleState(moduleId, this.states); }
  public requireState(moduleId: ModuleId): import("./moduleLifecycle.type.js").ModuleLifecycleState { return requireLifecycleState(moduleId, this.states); }
  public getStates(): ReadonlyMap<ModuleId, import("./moduleLifecycle.type.js").ModuleLifecycleState> { return getAllLifecycleStates(this.states); }
  public isInitialized(moduleId: ModuleId): boolean { return isModuleInitialized(moduleId, this.states); }
  public isStarted(moduleId: ModuleId): boolean { return isModuleStarted(moduleId, this.states); }
  public isDestroyed(moduleId: ModuleId): boolean { return isModuleDestroyed(moduleId, this.states); }

  private createGraph(): ModuleDependencyGraph {
    const nodes = this.registry.getAll().map((r) => ({ id: r.definition.id, dependencies: this.registry.getDependencies(r.definition.id) }));
    return createModuleDependencyGraph(nodes);
  }

  private getStartupOrder(): readonly ModuleId[] {
    const order = resolveModuleStartupOrder(this.createGraph());
    return Object.freeze(order.filter((id) => this.registry.get(id)?.state === "loaded"));
  }

  private getShutdownOrder(): readonly ModuleId[] {
    const order = resolveModuleShutdownOrder(this.createGraph());
    return Object.freeze(order.filter((id) => this.registry.get(id)?.state === "loaded"));
  }

  private async runExclusive<T>(operation: () => Promise<T>): Promise<T> {
    while (this.operation) await this.operation;
    let resolveOperation: (() => void) | undefined;
    const lock = new Promise<void>((resolve) => { resolveOperation = resolve; });
    this.operation = lock;
    try { return await operation(); } finally { resolveOperation?.(); this.operation = undefined; }
  }
}

/** Creates a module lifecycle manager. */
export function createModuleLifecycleManager(registry: ModuleRegistry, loader: ModuleLoader, options: ModuleLifecycleOptions = {}): ModuleLifecycleManager {
  return new ModuleLifecycleManager(registry, loader, options);
}
