/**
 * @zudo/testing — Central test context.
 *
 * Provides a single entry point that bundles test utilities
 * for container, logger, config, events, messaging, queue,
 * clock, and cleanup into one isolated context per test.
 */

import { createCleanupManager } from "../cleanupManager/cleanupManager.core.js";
import { createTestClock } from "../testClock/testClock.core.js";
import type { CleanupManager } from "../cleanupManager/cleanupManager.core.js";
import type { TestClock } from "../testClock/testClock.core.js";
import type {
  LogRecorder,
  EventRecorder,
  MessageRecorder,
} from "./testContext.recorder.type.js";
import {
  createLogRecorder,
  createEventRecorder,
  createMessageRecorder,
} from "./testContext.recorder.core.js";

/** Options for creating a test context. */
export interface TestContextOptions {
  readonly clock?: TestClock;
  readonly cleanup?: CleanupManager;
}

/** The central test context bundling all test utilities. */
export interface TestContext {
  readonly clock: TestClock;
  readonly cleanup: CleanupManager;
  readonly logs: LogRecorder;
  readonly events: EventRecorder;
  readonly messages: MessageRecorder;
  dispose: () => Promise<void>;
}

/**
 * Creates an isolated test context with all recording utilities.
 *
 * @param options - Optional configuration.
 * @returns A TestContext instance.
 */
export function createTestContext(
  options: TestContextOptions = {},
): TestContext {
  const clock = options.clock ?? createTestClock();
  const cleanup = options.cleanup ?? createCleanupManager();
  const logs = createLogRecorder();
  const events = createEventRecorder();
  const messages = createMessageRecorder();

  const dispose = async (): Promise<void> => {
    await cleanup.dispose();
  };

  return { clock, cleanup, logs, events, messages, dispose };
}
