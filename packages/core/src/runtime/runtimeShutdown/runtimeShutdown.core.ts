import type { ResolvedRuntimeOptions } from "../runtimeOptions/index.js";
import type { RuntimeShutdownDependencies, RuntimeShutdownConfig, RuntimeShutdownPhase, RuntimeShutdownResult, RuntimeShutdown, ResolvedShutdownOptions, RuntimeShutdownErrorInfo } from "./runtimeShutdown.type.js";
import { Context, createContext } from "../../context/core/context.js";
import { executeShutdownPipeline } from "./pipeline/index.js";
import { logRuntimeEvent } from "../runtimeLogger.js";

export type RuntimeShutdownErrorCode = "SHUTDOWN_ALREADY_RUNNING" | "SHUTDOWN_ALREADY_COMPLETED" | "SHUTDOWN_FAILED" | "SHUTDOWN_TIMEOUT" | "SHUTDOWN_MODULE_ERRORS" | "SHUTDOWN_RESET_WHILE_RUNNING" | "MODULE_STOP_FAILED" | "MODULE_DESTROY_FAILED" | "MODULE_STOP_METHOD_NOT_FOUND" | "MODULE_DESTROY_METHOD_NOT_FOUND";

export class RuntimeShutdownError extends Error {
  public override readonly name = "RuntimeShutdownError";
  public readonly code: RuntimeShutdownErrorCode;
  public override readonly cause?: unknown;
  public constructor(message: string, code: RuntimeShutdownErrorCode, cause?: unknown) {
    super(message);
    this.code = code;
    this.cause = cause;
  }
}

export async function withShutdownTimeout(operation: Promise<void>, timeoutMs: number): Promise<void> {
  if (timeoutMs <= 0) { await operation; return; }
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(() => { reject(new RuntimeShutdownError(`Runtime shutdown exceeded the configured timeout of ${timeoutMs}ms.`, "SHUTDOWN_TIMEOUT")); }, timeoutMs);
  });
  try { await Promise.race([operation, timeout]); } finally { clearTimeout(timer!); }
}

export function createShutdownResult(success: boolean, phase: RuntimeShutdownPhase, stoppedModules: number, destroyedModules: number, errors: readonly RuntimeShutdownErrorInfo[], startedAt: Date, completedAt: Date): RuntimeShutdownResult {
  return Object.freeze({ success, phase, stoppedModules, destroyedModules, errors: Object.freeze([...errors]), startedAt, completedAt, durationMs: completedAt.getTime() - startedAt.getTime() });
}

export class DefaultRuntimeShutdown implements RuntimeShutdown {
  private readonly _context: import("../runtimeContext/index.js").RuntimeContext;
  private readonly _environment: import("../runtimeEnvironment/index.js").RuntimeEnvironment;
  private readonly _application: import("../../application/applicationContext.context.js").ApplicationContext;
  private readonly _moduleRegistry: import("../../modules/moduleRegistry/index.js").ModuleRegistry;
  private readonly _moduleLifecycle: import("../../modules/moduleLifecycle/index.js").ModuleLifecycleManager;
  private readonly _logger: import("../../logging/core/logger.js").Logger;
  private readonly _runtimeOptions: ResolvedRuntimeOptions;
  private _running = false;
  private _phase: RuntimeShutdownPhase = "created";
  private _lastResult: RuntimeShutdownResult | undefined;
  private _shutdownContext?: Context;

  public constructor(dependencies: RuntimeShutdownDependencies, runtimeOptions: ResolvedRuntimeOptions) {
    this._context = dependencies.context;
    this._environment = dependencies.environment;
    this._application = dependencies.application;
    this._moduleRegistry = dependencies.moduleRegistry;
    this._moduleLifecycle = dependencies.moduleLifecycle;
    this._logger = dependencies.logger;
    this._runtimeOptions = runtimeOptions;
  }

  public get running(): boolean { return this._running; }
  public get phase(): RuntimeShutdownPhase { return this._phase; }

  public async shutdown(options: RuntimeShutdownConfig = {}): Promise<RuntimeShutdownResult> {
    if (this._running) { throw new RuntimeShutdownError("Runtime shutdown is already running.", "SHUTDOWN_ALREADY_RUNNING"); }
    if (this._phase === "completed") { throw new RuntimeShutdownError("Runtime has already been shut down.", "SHUTDOWN_ALREADY_COMPLETED"); }
    this._running = true;
    this._phase = "created";
    const configuration = this.resolveOptions(options);
    const errors: RuntimeShutdownErrorInfo[] = [];
    this._shutdownContext = createContext({ application: this._application, type: "worker", id: `${this._context.identity.id}-shutdown` });

    try {
      logRuntimeEvent(this._logger, this._context, this._environment, "info", "Runtime shutdown started.");
      const operation = executeShutdownPipeline(configuration, errors, { incrementStopped: () => {}, incrementDestroyed: () => {} }, this._moduleLifecycle, (phase: RuntimeShutdownPhase) => { this._phase = phase; }, this.log.bind(this));
      await withShutdownTimeout(operation, configuration.timeoutMs);
      this._phase = "completed";
      const completedAt = new Date();
      const result = createShutdownResult(true, "completed", 0, 0, [], new Date(), completedAt);
      this._lastResult = result;
      logRuntimeEvent(this._logger, this._context, this._environment, "info", "Runtime shutdown completed.", { durationMs: result.durationMs });
      return result;
    } catch (error) {
      this._phase = "failed";
      const shutdownError = error instanceof RuntimeShutdownError ? error : new RuntimeShutdownError("Runtime shutdown failed.", "SHUTDOWN_FAILED", error);
      const completedAt = new Date();
      const result = createShutdownResult(false, "failed", 0, 0, [], new Date(), completedAt);
      this._lastResult = result;
      logRuntimeEvent(this._logger, this._context, this._environment, "error", "Runtime shutdown failed.", { error: shutdownError });
      throw shutdownError;
    } finally {
      this._running = false;
    }
  }

  private resolveOptions(options: RuntimeShutdownConfig): ResolvedShutdownOptions {
    return {
      stopModules: options.stopModules ?? this._runtimeOptions.shutdown.autoStopModules,
      destroyModules: options.destroyModules ?? this._runtimeOptions.shutdown.autoDestroyModules,
      continueOnStopError: options.continueOnStopError ?? this._runtimeOptions.shutdown.continueOnStopError,
      continueOnDestroyError: options.continueOnDestroyError ?? this._runtimeOptions.shutdown.continueOnDestroyError,
      timeoutMs: options.timeoutMs ?? this._runtimeOptions.shutdown.timeoutMs,
    };
  }

  public getLastResult(): RuntimeShutdownResult | undefined { return this._lastResult; }
  public getShutdownContext(): Context | undefined { return this._shutdownContext; }
  public reset(): void {
    if (this._running) { throw new RuntimeShutdownError("Cannot reset runtime shutdown while it is running.", "SHUTDOWN_RESET_WHILE_RUNNING"); }
    this._phase = "created";
    this._lastResult = undefined;
  }

  private log(level: "debug" | "info" | "warn" | "error", message: string, metadata?: Record<string, unknown>): void {
    logRuntimeEvent(this._logger, this._context, this._environment, level, message, metadata);
  }
}
