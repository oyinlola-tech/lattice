import type { ModuleLifecycleManager } from "../../../modules/moduleLifecycle/index.js";
import type {
  RuntimeShutdownPhase,
  RuntimeShutdownErrorInfo,
  ResolvedShutdownOptions,
} from "../runtimeShutdown.type.js";
import { RuntimeShutdownError } from "../runtimeShutdown.core.js";

type LogFn = (
  level: "debug" | "info" | "warn" | "error",
  message: string,
  metadata?: Record<string, unknown>,
) => void;

async function stopModules(
  errors: RuntimeShutdownErrorInfo[],
  counters: { incrementStopped(): void },
  continueOnError: boolean,
  moduleLifecycle: ModuleLifecycleManager,
  setPhase: (phase: RuntimeShutdownPhase) => void,
  log: LogFn,
): Promise<void> {
  setPhase("stopping");
  log("debug", "Stopping runtime modules.");
  try {
    await invokeStopModules(moduleLifecycle);
    setPhase("stopped");
    counters.incrementStopped();
    log("debug", "Runtime modules stopped.");
  } catch (error) {
    errors.push({ phase: "stopping", error });
    if (!continueOnError) {
      throw new RuntimeShutdownError(
        "Failed to stop runtime modules.",
        "MODULE_STOP_FAILED",
        error,
      );
    }
    log("warn", "Runtime module shutdown reported an error. Continuing.", {
      error,
    });
  }
}

async function destroyModules(
  errors: RuntimeShutdownErrorInfo[],
  counters: { incrementDestroyed(): void },
  continueOnError: boolean,
  moduleLifecycle: ModuleLifecycleManager,
  setPhase: (phase: RuntimeShutdownPhase) => void,
  log: LogFn,
): Promise<void> {
  setPhase("destroying");
  log("debug", "Destroying runtime modules.");
  try {
    await invokeDestroyModules(moduleLifecycle);
    setPhase("destroyed");
    counters.incrementDestroyed();
    log("debug", "Runtime modules destroyed.");
  } catch (error) {
    errors.push({ phase: "destroying", error });
    if (!continueOnError) {
      throw new RuntimeShutdownError(
        "Failed to destroy runtime modules.",
        "MODULE_DESTROY_FAILED",
        error,
      );
    }
    log("warn", "Runtime module destruction reported an error. Continuing.", {
      error,
    });
  }
}

async function invokeStopModules(
  moduleLifecycle: ModuleLifecycleManager,
): Promise<void> {
  const l = moduleLifecycle as unknown as {
    stopAll?: () => Promise<unknown> | unknown;
    stop?: () => Promise<unknown> | unknown;
  };
  if (typeof l.stopAll === "function") {
    await l.stopAll();
    return;
  }
  if (typeof l.stop === "function") {
    await l.stop();
    return;
  }
  throw new RuntimeShutdownError(
    "ModuleLifecycleManager does not expose a supported stop method.",
    "MODULE_STOP_METHOD_NOT_FOUND",
  );
}

async function invokeDestroyModules(
  moduleLifecycle: ModuleLifecycleManager,
): Promise<void> {
  const l = moduleLifecycle as unknown as {
    destroyAll?: () => Promise<unknown> | unknown;
    destroy?: () => Promise<unknown> | unknown;
    disposeAll?: () => Promise<unknown> | unknown;
    dispose?: () => Promise<unknown> | unknown;
  };
  if (typeof l.destroyAll === "function") {
    await l.destroyAll();
    return;
  }
  if (typeof l.destroy === "function") {
    await l.destroy();
    return;
  }
  if (typeof l.disposeAll === "function") {
    await l.disposeAll();
    return;
  }
  if (typeof l.dispose === "function") {
    await l.dispose();
    return;
  }
  throw new RuntimeShutdownError(
    "ModuleLifecycleManager does not expose a supported destroy or dispose method.",
    "MODULE_DESTROY_METHOD_NOT_FOUND",
  );
}

export async function executeShutdownPipeline(
  options: ResolvedShutdownOptions,
  errors: RuntimeShutdownErrorInfo[],
  counters: { incrementStopped(): void; incrementDestroyed(): void },
  moduleLifecycle: ModuleLifecycleManager,
  setPhase: (phase: RuntimeShutdownPhase) => void,
  log: LogFn,
): Promise<void> {
  if (options.stopModules) {
    await stopModules(
      errors,
      counters,
      options.continueOnStopError,
      moduleLifecycle,
      setPhase,
      log,
    );
  }
  if (options.destroyModules) {
    await destroyModules(
      errors,
      counters,
      options.continueOnDestroyError,
      moduleLifecycle,
      setPhase,
      log,
    );
  }
  if (
    errors.length > 0 &&
    !options.continueOnStopError &&
    !options.continueOnDestroyError
  ) {
    throw new RuntimeShutdownError(
      "Runtime shutdown completed with module errors.",
      "SHUTDOWN_MODULE_ERRORS",
      errors,
    );
  }
}
