/**
 * @zudojs/runtime — Test Runtime
 *
 * Provides a lightweight runtime for testing purposes with
 * mock infrastructure and easy lifecycle management.
 */

import type { Module } from "@zudojs/core";
import { createLogger } from "@zudojs/logger";
import { createContainer } from "@zudojs/container";
import { createEventBus } from "@zudojs/events";
import { DefaultRuntime } from "../runtime/runtime.core.js";
import type { RuntimeDependencies } from "../runtime/runtime.core.js";
import type { RuntimeOptions } from "../runtimeOptions/runtimeOptions.type.js";

/**
 * Creates a test runtime with mock infrastructure.
 *
 * @param modules - Optional modules to register.
 * @param options - Optional runtime options overrides.
 * @returns A runtime instance ready for testing.
 */
export function createTestRuntime(
  modules: Module[] = [],
  options: Partial<RuntimeOptions> = {},
): DefaultRuntime {
  const logger = createLogger({ name: "test-runtime" });
  const container = createContainer();
  const eventBus = createEventBus();

  const moduleMap = new Map<string, Module>();
  for (const module of modules) {
    moduleMap.set(module.id, module);
  }

  const dependencies: RuntimeDependencies = {
    modules: moduleMap,
    logger,
    container,
    eventBus,
  };

  const runtimeOptions: RuntimeOptions = {
    environment: "test",
    applicationName: "test-app",
    applicationVersion: "0.0.0-test",
    handleSignals: false,
    handleFatalErrors: false,
    shutdownTimeout: 5000,
    startupTimeout: 10000,
    emitEvents: false,
    ...options,
  };

  return new DefaultRuntime(dependencies, runtimeOptions);
}

/**
 * Creates a mock module for testing.
 *
 * @param id - Module identifier.
 * @param dependencies - Module dependencies.
 * @returns A mock module with vi.fn() hooks.
 */
export function createMockModule(
  id: string,
  dependencies: string[] = [],
): Module {
  const { vi } = require("vitest");
  return {
    id,
    name: `Module ${id}`,
    dependencies,
    onInitialize: vi.fn().mockResolvedValue(undefined),
    onReady: vi.fn().mockResolvedValue(undefined),
    onShutdown: vi.fn().mockResolvedValue(undefined),
    onDestroy: vi.fn().mockResolvedValue(undefined),
  };
}

/**
 * Starts a test runtime, runs a callback, and stops it.
 *
 * @param fn - Async function to run with the started runtime.
 * @param modules - Optional modules to register.
 * @param options - Optional runtime options.
 */
export async function withTestRuntime<T>(
  fn: (runtime: DefaultRuntime) => Promise<T>,
  modules: Module[] = [],
  options: Partial<RuntimeOptions> = {},
): Promise<T> {
  const runtime = createTestRuntime(modules, options);
  await runtime.start();
  try {
    return await fn(runtime);
  } finally {
    await runtime.stop();
  }
}
