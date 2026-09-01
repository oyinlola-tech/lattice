import type { ModuleLoader } from "../../../modules/moduleLoader/index.js";

import type { ModuleLifecycleManager } from "../../../modules/moduleLifecycle/index.js";

import { RuntimeBootstrapError } from "./runtimeBootstrap.pipeline.js";

export async function invokeModuleLoader(
  moduleLoader: ModuleLoader,
): Promise<void> {
  const loader = moduleLoader as unknown as {
    loadAll?: () => Promise<unknown> | unknown;
    load?: () => Promise<unknown> | unknown;
  };

  if (typeof loader.loadAll === "function") {
    await loader.loadAll();
    return;
  }

  if (typeof loader.load === "function") {
    await loader.load();
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
  const lifecycle = moduleLifecycle as unknown as {
    initializeAll?: () => Promise<unknown> | unknown;
    initialize?: () => Promise<unknown> | unknown;
  };

  if (typeof lifecycle.initializeAll === "function") {
    await lifecycle.initializeAll();
    return;
  }

  if (typeof lifecycle.initialize === "function") {
    await lifecycle.initialize();
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
  const lifecycle = moduleLifecycle as unknown as {
    startAll?: () => Promise<unknown> | unknown;
    start?: () => Promise<unknown> | unknown;
  };

  if (typeof lifecycle.startAll === "function") {
    await lifecycle.startAll();
    return;
  }

  if (typeof lifecycle.start === "function") {
    await lifecycle.start();
    return;
  }

  throw new RuntimeBootstrapError(
    "ModuleLifecycleManager does not expose a supported start method.",
    "MODULE_START_METHOD_NOT_FOUND",
  );
}
