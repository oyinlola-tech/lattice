import type { ModuleLoader } from "../../../modules/moduleLoader/index.js";
import type { ModuleLifecycleManager } from "../../../modules/moduleLifecycle/index.js";
import type { RuntimeBootstrapPhase, RuntimeBootstrapErrorInfo, ResolvedBootstrapOptions } from "../runtimeBootstrap.type.js";
import { invokeModuleLoader, invokeInitializeModules, invokeStartModules } from "./runtimeBootstrap.invoke.js";

export type RuntimeBootstrapErrorCode = "BOOTSTRAP_ALREADY_RUNNING" | "BOOTSTRAP_ALREADY_COMPLETED" | "BOOTSTRAP_FAILED" | "BOOTSTRAP_TIMEOUT" | "BOOTSTRAP_MODULE_ERRORS" | "BOOTSTRAP_RESET_WHILE_RUNNING" | "MODULE_LOAD_FAILED" | "MODULE_INITIALIZATION_FAILED" | "MODULE_START_FAILED" | "MODULE_LOADER_METHOD_NOT_FOUND" | "MODULE_INITIALIZE_METHOD_NOT_FOUND" | "MODULE_START_METHOD_NOT_FOUND";

import {
  RuntimeBootstrapError as BaseRuntimeBootstrapError,
} from "@oyinlola141/lattice-errors";

export class RuntimeBootstrapError extends BaseRuntimeBootstrapError {
  public readonly bootstrapCode: RuntimeBootstrapErrorCode;
  public constructor(message: string, code: RuntimeBootstrapErrorCode, cause?: unknown) {
    super(message, { cause });
    this.bootstrapCode = code;
  }
}

type LogFn = (level: "debug" | "info" | "warn" | "error", message: string, metadata?: Record<string, unknown>) => void;

async function loadModules(errors: RuntimeBootstrapErrorInfo[], counters: { incrementLoaded(): void }, moduleLoader: ModuleLoader, setPhase: (phase: RuntimeBootstrapPhase) => void, log: LogFn): Promise<void> {
  setPhase("loading");
  log("debug", "Loading runtime modules.");
  try {
    await invokeModuleLoader(moduleLoader);
    setPhase("loaded");
    counters.incrementLoaded();
    log("debug", "Runtime modules loaded.");
  } catch (error) {
    errors.push({ phase: "loading", error });
    throw new RuntimeBootstrapError("Failed to load runtime modules.", "MODULE_LOAD_FAILED", error);
  }
}

async function initializeModules(errors: RuntimeBootstrapErrorInfo[], counters: { incrementInitialized(): void }, continueOnError: boolean, moduleLifecycle: ModuleLifecycleManager, setPhase: (phase: RuntimeBootstrapPhase) => void, log: LogFn): Promise<void> {
  setPhase("initializing");
  log("debug", "Initializing runtime modules.");
  try {
    await invokeInitializeModules(moduleLifecycle);
    setPhase("initialized");
    counters.incrementInitialized();
    log("debug", "Runtime modules initialized.");
  } catch (error) {
    errors.push({ phase: "initializing", error });
    if (!continueOnError) {
      throw new RuntimeBootstrapError("Failed to initialize runtime modules.", "MODULE_INITIALIZATION_FAILED", error);
    }
    log("warn", "Runtime module initialization reported an error. Continuing.", { error });
  }
}

async function startModules(errors: RuntimeBootstrapErrorInfo[], counters: { incrementStarted(): void }, continueOnError: boolean, moduleLifecycle: ModuleLifecycleManager, setPhase: (phase: RuntimeBootstrapPhase) => void, log: LogFn): Promise<void> {
  setPhase("starting");
  log("debug", "Starting runtime modules.");
  try {
    await invokeStartModules(moduleLifecycle);
    setPhase("started");
    counters.incrementStarted();
    log("debug", "Runtime modules started.");
  } catch (error) {
    errors.push({ phase: "starting", error });
    if (!continueOnError) {
      throw new RuntimeBootstrapError("Failed to start runtime modules.", "MODULE_START_FAILED", error);
    }
    log("warn", "Runtime module startup reported an error. Continuing.", { error });
  }
}

export async function executeBootstrapPipeline(options: ResolvedBootstrapOptions, errors: RuntimeBootstrapErrorInfo[], counters: { incrementLoaded(): void; incrementInitialized(): void; incrementStarted(): void }, moduleLoader: ModuleLoader, moduleLifecycle: ModuleLifecycleManager, setPhase: (phase: RuntimeBootstrapPhase) => void, log: LogFn): Promise<void> {
  if (options.loadModules) {
    await loadModules(errors, counters, moduleLoader, setPhase, log);
  }
  if (options.initializeModules) {
    await initializeModules(errors, counters, options.continueOnInitializeError, moduleLifecycle, setPhase, log);
  }
  if (options.startModules) {
    await startModules(errors, counters, options.continueOnStartError, moduleLifecycle, setPhase, log);
  }
  if (errors.length > 0 && !options.continueOnInitializeError && !options.continueOnStartError) {
    throw new RuntimeBootstrapError("Runtime bootstrap completed with module errors.", "BOOTSTRAP_MODULE_ERRORS", errors);
  }
}

export async function withTimeout(operation: Promise<void>, timeoutMs: number): Promise<void> {
  if (timeoutMs <= 0) { await operation; return; }
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(() => { reject(new RuntimeBootstrapError(`Runtime bootstrap exceeded the configured timeout of ${timeoutMs}ms.`, "BOOTSTRAP_TIMEOUT")); }, timeoutMs);
  });
  try { await Promise.race([operation, timeout]); } finally { clearTimeout(timer!); }
}

export function createBootstrapResult(success: boolean, phase: RuntimeBootstrapPhase, loadedModules: number, initializedModules: number, startedModules: number, errors: readonly RuntimeBootstrapErrorInfo[], startedAt: Date, completedAt: Date): import("../runtimeBootstrap.type.js").RuntimeBootstrapResult {
  return Object.freeze({ success, phase, loadedModules, initializedModules, startedModules, errors: Object.freeze([...errors]), startedAt, completedAt, durationMs: completedAt.getTime() - startedAt.getTime() });
}
