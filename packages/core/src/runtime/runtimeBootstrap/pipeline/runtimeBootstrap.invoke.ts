import type { ModuleLoader } from "../../../modules/moduleLoader/index.js";

import type { ModuleLifecycleManager } from "../../../modules/moduleLifecycle/index.js";

import { RuntimeBootstrapError } from "./runtimeBootstrap.pipeline.js";

export async function invokeModuleLoader(
  moduleLoader: ModuleLoader,
): Promise<void> {
  if (typeof moduleLoader.loadAll === "function") {
    await moduleLoader.loadAll();
    return;
  }

  if (typeof moduleLoader.load === "function") {
    await moduleLoader.load("unknown" as never);
    return;
  }

  throw new RuntimeBootstrapError(
    "ModuleLoader does not expose a supported load method.",
    "MODULE_LOADER_METHOD_NOT_FOUND",
  );
}

export async function invokeInitializeModules(
  moduleLifecycle: ModuleLifecycleManager,
): Promise<void> {
  if (typeof moduleLifecycle.initialize === "function") {
    await moduleLifecycle.initialize();
    return;
  }

  throw new RuntimeBootstrapError(
    "ModuleLifecycleManager does not expose a supported initialize method.",
    "MODULE_INITIALIZE_METHOD_NOT_FOUND",
  );
}

export async function invokeStartModules(
  moduleLifecycle: ModuleLifecycleManager,
): Promise<void> {
  if (typeof moduleLifecycle.start === "function") {
    await moduleLifecycle.start();
    return;
  }

  throw new RuntimeBootstrapError(
    "ModuleLifecycleManager does not expose a supported start method.",
    "MODULE_START_METHOD_NOT_FOUND",
  );
}
