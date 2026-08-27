import { RuntimeState, createRuntimeStateSnapshot } from "../runtimeState.state.js";
import type { RuntimeStateSnapshot } from "../runtimeState.state.js";
import type { RuntimeIdentity, RuntimeTiming, RuntimeContextDependencies, RuntimeContext, RuntimeContextState } from "./runtimeContext.type.js";
import type { ApplicationContext } from "../../application/applicationContext.context.js";
import type { ConfigurationManager } from "../../configuration/configurationManager.manager.js";
import type { Logger } from "../../logging/core/logger.js";
import type { ModuleLoader } from "../../modules/moduleLoader/index.js";
import type { ModuleLifecycleManager } from "../../modules/moduleLifecycle/index.js";
import type { ModuleRegistry } from "../../modules/moduleRegistry/index.js";

export class DefaultRuntimeContext implements RuntimeContext {
  private readonly _identity: RuntimeIdentity;
  private readonly _metadata: Readonly<Record<string, unknown>>;
  private readonly _application: ApplicationContext;
  private readonly _configuration: ConfigurationManager;
  private readonly _logger: Logger;
  private readonly _moduleRegistry: ModuleRegistry;
  private readonly _moduleLoader: ModuleLoader;
  private readonly _moduleLifecycle: ModuleLifecycleManager;
  private readonly _state: RuntimeContextState;

  public constructor(
    identity: RuntimeIdentity,
    dependencies: RuntimeContextDependencies,
    metadata: Readonly<Record<string, unknown>> = {},
  ) {
    this._identity = Object.freeze({ ...identity });
    this._metadata = Object.freeze({ ...metadata });
    this._application = dependencies.application;
    this._configuration = dependencies.configuration;
    this._logger = dependencies.logger;
    this._moduleRegistry = dependencies.moduleRegistry;
    this._moduleLoader = dependencies.moduleLoader;
    this._moduleLifecycle = dependencies.moduleLifecycle;
    this._state = { state: RuntimeState.CREATED, timing: { createdAt: identity.createdAt } };
  }

  public get identity(): RuntimeIdentity { return this._identity; }
  public get state(): RuntimeState { return this._state.state; }
  public get timing(): RuntimeTiming { return Object.freeze({ ...this._state.timing }); }
  public get metadata(): Readonly<Record<string, unknown>> { return this._metadata; }
  public get application(): ApplicationContext { return this._application; }
  public get configuration(): ConfigurationManager { return this._configuration; }
  public get logger(): Logger { return this._logger; }
  public get moduleRegistry(): ModuleRegistry { return this._moduleRegistry; }
  public get moduleLoader(): ModuleLoader { return this._moduleLoader; }
  public get moduleLifecycle(): ModuleLifecycleManager { return this._moduleLifecycle; }

  public getStateSnapshot(): RuntimeStateSnapshot {
    return createRuntimeStateSnapshot(this._state.state);
  }

  public get<T = unknown>(key: string): T | undefined {
    return this._metadata[key] as T | undefined;
  }

  public has(key: string): boolean {
    return Object.prototype.hasOwnProperty.call(this._metadata, key);
  }

  public getUptime(): number {
    return Date.now() - this._identity.createdAt.getTime();
  }

  public setState(state: RuntimeState): void {
    this._state.state = state;
    this.updateTimingForState(state);
  }

  private updateTimingForState(state: RuntimeState): void {
    const now = new Date();
    const t = this._state.timing;

    switch (state) {
      case RuntimeState.BOOTSTRAPPING:
        this._state.timing = { ...t, startupStartedAt: t.startupStartedAt ?? now };
        break;
      case RuntimeState.READY:
        this._state.timing = { ...t, readyAt: t.readyAt ?? now };
        break;
      case RuntimeState.STOPPING:
        this._state.timing = { ...t, shutdownStartedAt: t.shutdownStartedAt ?? now };
        break;
      case RuntimeState.STOPPED:
        this._state.timing = { ...t, stoppedAt: t.stoppedAt ?? now };
        break;
      default:
        break;
    }
  }
}
