/**
 * Test application builder.
 *
 * Provides a simplified builder for creating test application
 * contexts without the full Runtime lifecycle.
 */

import type { Container } from "@zudolib/container";

import type { Logger } from "@zudolib/logger";

import { createStartedContainer } from "@zudolib/container";

import { createLogger } from "@zudolib/logger";

import { createCleanupManager } from "../cleanupManager/cleanupManager.core.js";

import { createTestClock } from "../testClock/testClock.core.js";

import type { CleanupManager } from "../cleanupManager/cleanupManager.core.js";

import type { TestClock } from "../testClock/testClock.core.js";

/**
 * Options for creating a test application.
 */
export interface TestApplicationOptions {
  readonly name?: string;
  readonly container?: Container;
  readonly logger?: Logger;
  readonly clock?: TestClock;
  readonly cleanup?: CleanupManager;
}

/**
 * A test application context.
 */
export interface TestApplication {
  readonly name: string;
  readonly container: Container;
  readonly logger: Logger;
  readonly clock: TestClock;
  readonly cleanup: CleanupManager;
  dispose: () => Promise<void>;
}

/**
 * Creates a test application context.
 *
 * @param options - Test application options.
 * @returns A TestApplication instance.
 *
 * @example
 * ```ts
 * const app = createTestApplication({ name: "user-service" });
 *
 * app.container.registerValue(token, implementation);
 * const service = app.container.resolve(token);
 *
 * await app.dispose();
 * ```
 */
export function createTestApplication(
  options: TestApplicationOptions = {},
): TestApplication {
  const name = options.name ?? "test-app";
  const container = options.container ?? createStartedContainer();
  const logger = options.logger ?? createLogger({ name });
  const clock = options.clock ?? createTestClock();
  const cleanup = options.cleanup ?? createCleanupManager();

  cleanup.register(async () => {
    container.dispose();
  }, "container-dispose");

  cleanup.register(async () => {
    await logger.close();
  }, "logger-close");

  const dispose = async (): Promise<void> => {
    await cleanup.dispose();
  };

  return {
    name,
    container,
    logger,
    clock,
    cleanup,
    dispose,
  };
}
