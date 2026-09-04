/**
 * @zudojs/adapters/testing
 *
 * Testing utilities for adapter implementations.
 */

export type { Adapter } from "../adapter/adapter.type.js";

export type { AdapterCapabilities } from "../capabilities/capabilities.type.js";

export type { AdapterRegistry } from "../adapter/adapter.registry.js";

export type { AdapterHealth } from "../lifecycle/lifecycle.type.js";

export {
  createMockAdapter,
  createMockAdapterRegistry,
  createMockHealth,
} from "./adapterTesting.helper.js";
