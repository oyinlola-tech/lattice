import type { ResolvedRuntimeOptions } from "../runtimeOptions/index.js";
import type { RuntimeBootstrapDependencies, RuntimeBootstrapOptions, RuntimeBootstrapPhase, RuntimeBootstrapResult, RuntimeBootstrap, ResolvedBootstrapOptions, RuntimeBootstrapErrorInfo } from "./runtimeBootstrap.type.js";
import { Context, createContext } from "../../context/core/context.js";
import { executeBootstrapPipeline, RuntimeBootstrapError, withTimeout, createBootstrapResult } from "./pipeline/index.js";
import { logRuntimeEvent } from "../runtimeLogger.js";

export class DefaultRuntimeBootstrap implements RuntimeBootstrap {
  private readonly _context: import("../runtimeContext/index.js").RuntimeContext;
  private readonly _environment: import("../runtimeEnvironment/index.js").RuntimeEnvironment;
  private readonly _application: import("../../application/applicationContext.context.js").ApplicationContext;
  private readonly _moduleLoader: import("../../modules/moduleLoader/index.js").ModuleLoader;
  private readonly _moduleRegistry: import("../../modules/moduleRegistry/index.js").ModuleRegistry;
  private readonly _moduleLifecycle: import("../../modules/moduleLifecycle/index.js").ModuleLifecycleManager;
  private readonly _logger: import("../../logging/core/logger.js").Logger;
  private readonly _runtimeOptions: ResolvedRuntimeOptions;
  private _running = false;
  private _phase: RuntimeBootstrapPhase = "created";
  private _lastResult: RuntimeBootstrapResult | undefined;
  private _bootstrapContext?: Context;

  public constructor(dependencies: RuntimeBootstrapDependencies, runtimeOptions: ResolvedRuntimeOptions) {
    this._context = dependencies.context;
    this._environment = dependencies.environment;
    this._application = dependencies.application;
    this._moduleLoader = dependencies.moduleLoader;
    this._moduleRegistry = dependencies.moduleRegistry;
    this._moduleLifecycle = dependencies.moduleLifecycle;
    this._logger = dependencies.logger;
    this._runtimeOptions = runtimeOptions;
  }

  public get running(): boolean { return this._running; }
  public get phase(): RuntimeBootstrapPhase { return this._phase; }

  public async bootstrap(options: RuntimeBootstrapOptions = {}): Promise<RuntimeBootstrapResult> {
    if (this._running) { throw new RuntimeBootstrapError("Runtime bootstrap is already running.", "BOOTSTRAP_ALREADY_RUNNING"); }
    if (this._phase === "completed") { throw new RuntimeBootstrapError("Runtime has already been bootstrapped.", "BOOTSTRAP_ALREADY_COMPLETED"); }
    this._running = true;
    this._phase = "created";
    const startedAt = new Date();
    const errors: RuntimeBootstrapErrorInfo[] = [];
    let loadedModules = 0, initializedModules = 0, startedModules = 0;
    const configuration = this.resolveOptions(options);
    this._bootstrapContext = createContext({ application: this._application, type: "worker", id: this._context.identity.id });

    try {
      logRuntimeEvent(this._logger, this._context, this._environment, "info", "Runtime bootstrap started.");
      const operation = executeBootstrapPipeline(configuration, errors, { incrementLoaded: () => { loadedModules += 1; }, incrementInitialized: () => { initializedModules += 1; }, incrementStarted: () => { startedModules += 1; } }, this._moduleLoader, this._moduleLifecycle, (phase) => { this._phase = phase; }, this.log.bind(this));
      await withTimeout(operation, configuration.timeoutMs);
      this._phase = "completed";
      const completedAt = new Date();
      const result = createBootstrapResult(true, "completed", loadedModules, initializedModules, startedModules, errors, startedAt, completedAt);
      this._lastResult = result;
      logRuntimeEvent(this._logger, this._context, this._environment, "info", "Runtime bootstrap completed.", { durationMs: result.durationMs, loadedModules, initializedModules, startedModules });
      return result;
    } catch (error) {
      this._phase = "failed";
      const bootstrapError = error instanceof RuntimeBootstrapError ? error : new RuntimeBootstrapError("Runtime bootstrap failed.", "BOOTSTRAP_FAILED", error);
      errors.push({ phase: this._phase, error: bootstrapError });
      const completedAt = new Date();
      const result = createBootstrapResult(false, "failed", loadedModules, initializedModules, startedModules, errors, startedAt, completedAt);
      this._lastResult = result;
      logRuntimeEvent(this._logger, this._context, this._environment, "error", "Runtime bootstrap failed.", { error: bootstrapError });
      throw bootstrapError;
    } finally {
      this._running = false;
    }
  }

  private resolveOptions(options: RuntimeBootstrapOptions): ResolvedBootstrapOptions {
    return {
      loadModules: options.loadModules ?? this._runtimeOptions.startup.autoLoadModules,
      initializeModules: options.initializeModules ?? this._runtimeOptions.startup.autoInitializeModules,
      startModules: options.startModules ?? this._runtimeOptions.startup.autoStartModules,
      continueOnInitializeError: options.continueOnInitializeError ?? this._runtimeOptions.startup.continueOnInitializeError,
      continueOnStartError: options.continueOnStartError ?? this._runtimeOptions.startup.continueOnStartError,
      timeoutMs: options.timeoutMs ?? this._runtimeOptions.startup.timeoutMs,
    };
  }

  public getLastResult(): RuntimeBootstrapResult | undefined { return this._lastResult; }
  public reset(): void {
    if (this._running) { throw new RuntimeBootstrapError("Cannot reset runtime bootstrap while it is running.", "BOOTSTRAP_RESET_WHILE_RUNNING"); }
    this._phase = "created";
    this._lastResult = undefined;
  }

  private log(level: "debug" | "info" | "warn" | "error", message: string, metadata?: Record<string, unknown>): void {
    logRuntimeEvent(this._logger, this._context, this._environment, level, message, metadata);
  }
}
