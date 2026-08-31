/**
 * Mocking utilities.
 *
 * Mock functions, spies, and stubs for testing.
 */

export {
  createMockFn,
} from "./mockFn.core.js";

export {
  createSpyFn,
  createSpyMethod,
} from "./spy.core.js";

export {
  createStub,
  createStubClass,
} from "./stub.core.js";

export type {
  MockFn,
} from "./mockFn.core.js";

export type {
  SpyFn,
  SpyMethod,
} from "./spy.core.js";
