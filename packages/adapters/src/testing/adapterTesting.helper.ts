/**
 * @oyinlola141/lattice-adapters/testing
 *
 * Testing utilities for adapter implementations.
 */

import type { Adapter } from "../adapter/adapter.type.js";
import type { AdapterCapabilities } from "../capabilities/capabilities.type.js";
import { AdapterRegistry } from "../adapter/adapter.registry.js";
import type { AdapterHealth } from "../lifecycle/lifecycle.type.js";

/**
 * Creates a minimal mock adapter for testing.
 */
export function createMockAdapter(
  overrides: Partial<Adapter> & { name: string } = { name: "mock" },
): Adapter {
  const capabilities: AdapterCapabilities = {
    http: false,
    websocket: false,
    streaming: false,
    filesystem: false,
    tcp: false,
    udp: false,
    backgroundTasks: false,
    longRunning: false,
    edgeRuntime: false,
    serverless: false,
    gracefulShutdown: false,
    abortSignal: false,
  };

  return {
    name: overrides.name,
    version: overrides.version ?? "1.0.0",
    capabilities: overrides.capabilities ?? capabilities,
    metadata: overrides.metadata,
    initialize: overrides.initialize,
    start: overrides.start,
    stop: overrides.stop,
    dispose: overrides.dispose,
  };
}

/**
 * Creates a mock adapter registry pre-populated with adapters.
 */
export function createMockAdapterRegistry(
  adapters: Adapter[] = [],
): { registry: AdapterRegistry; adapters: Adapter[] } {
  const registry = new AdapterRegistry();
  for (const adapter of adapters) {
    registry.register(adapter);
  }
  return { registry, adapters };
}

/**
 * Creates a default healthy health report.
 */
export function createMockHealth(): AdapterHealth {
  return {
    status: "healthy",
    timestamp: Date.now(),
  };
}
