/**
 * @zudolib/testing — Central test context.
 *
 * Bundles test utilities into one isolated context per test.
 */

export { createTestContext } from "./testContext.core.js";
export type { TestContext, TestContextOptions } from "./testContext.core.js";

export type {
  CapturedLogEntry,
  CapturedEvent,
  CapturedMessage,
  LogRecorder,
  EventRecorder,
  MessageRecorder,
} from "./testContext.recorder.type.js";

export {
  createLogRecorder,
  createEventRecorder,
  createMessageRecorder,
} from "./testContext.recorder.core.js";
