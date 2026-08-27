import type {
  RuntimeManagerDependencies,
  RuntimeManager,
} from "./runtimeManager.type.js";

import type {
  RuntimeOptions,
} from "../runtimeOptions/index.js";

import {
  DefaultRuntimeManager,
} from "./runtimeManager.core.js";

/**
 * Creates a RuntimeManager.
 */
export function createRuntimeManager(
  dependencies: RuntimeManagerDependencies,
  options: RuntimeOptions = {},
): RuntimeManager {
  return new DefaultRuntimeManager(
    dependencies,
    options,
  );
}
