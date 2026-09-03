/**
 * @zudo/adapters/testing
 *
 * Testing utilities for adapter implementations.
 *
 * Provides contract-test helpers and mock adapters.
 */

import type {
  Adapter,
  AdapterCapabilities,
  AdapterMetadata,
} from "../adapter/adapter.type.js";
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
export function createMockAdapterRegistry(adapters: Adapter[] = []): {
  registry: AdapterRegistry;
  adapters: Adapter[];
} {
  const registry = new AdapterRegistry();
  for (const adapter of adapters) {
    registry.register(adapter);
  }
  return { registry, adapters };
}

/**
 * AdapterRegistry class for testing.
 */
export class AdapterRegistry {
  private readonly adapters = new Map<string, Adapter>();

  register(adapter: Adapter): void {
    const name = adapter.name.trim().toLowerCase();
    if (this.adapters.has(name)) {
      throw new Error(`Adapter "${name}" is already registered.`);
    }
    this.adapters.set(name, adapter);
  }

  get<T extends Adapter>(name: string): T | undefined {
    return this.adapters.get(name.trim().toLowerCase()) as T | undefined;
  }

  has(name: string): boolean {
    return this.adapters.has(name.trim().toLowerCase());
  }

  remove(name: string): boolean {
    return this.adapters.delete(name.trim().toLowerCase());
  }

  getAll(): readonly Adapter[] {
    return [...this.adapters.values()];
  }

  get size(): number {
    return this.adapters.size;
  }

  clear(): void {
    this.adapters.clear();
  }
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
