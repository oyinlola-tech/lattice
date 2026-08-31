import { describe, it, expect } from "vitest";

import {
  createMockAdapter,
  createMockAdapterRegistry,
  createMockHealth,
  AdapterRegistry,
} from "../src/index.js";

describe("AdapterRegistry", () => {
  it("registers and retrieves adapters by name", () => {
    const registry = new AdapterRegistry();
    const adapter = createMockAdapter({ name: "test" });

    registry.register(adapter);

    expect(registry.has("test")).toBe(true);
    expect(registry.get("test")).toBe(adapter);
  });

  it("prevents duplicate adapter registration", () => {
    const registry = new AdapterRegistry();
    registry.register(createMockAdapter({ name: "test" }));

    expect(() => {
      registry.register(createMockAdapter({ name: "test" }));
    }).toThrow('Adapter "test" is already registered.');
  });

  it("removes adapters", () => {
    const registry = new AdapterRegistry();
    registry.register(createMockAdapter({ name: "test" }));

    expect(registry.remove("test")).toBe(true);
    expect(registry.has("test")).toBe(false);
  });

  it("lists all registered adapters", () => {
    const registry = new AdapterRegistry();
    registry.register(createMockAdapter({ name: "a" }));
    registry.register(createMockAdapter({ name: "b" }));

    expect(registry.size).toBe(2);
    expect(registry.getNames()).toEqual(["a", "b"]);
  });

  it("clears all adapters", () => {
    const registry = new AdapterRegistry();
    registry.register(createMockAdapter({ name: "test" }));

    registry.clear();

    expect(registry.size).toBe(0);
  });
});

describe("createMockAdapter", () => {
  it("creates an adapter with default capabilities", () => {
    const adapter = createMockAdapter({ name: "mock" });

    expect(adapter.name).toBe("mock");
    expect(adapter.version).toBe("1.0.0");
    expect(adapter.capabilities.http).toBe(false);
    expect(adapter.capabilities.websocket).toBe(false);
  });

  it("creates an adapter with overrides", () => {
    const adapter = createMockAdapter({
      name: "custom",
      capabilities: { http: true, longRunning: true },
    });

    expect(adapter.name).toBe("custom");
    expect(adapter.capabilities.http).toBe(true);
    expect(adapter.capabilities.longRunning).toBe(true);
  });
});

describe("createMockHealth", () => {
  it("creates a healthy report", () => {
    const health = createMockHealth();

    expect(health.status).toBe("healthy");
    expect(health.timestamp).toBeGreaterThan(0);
  });
});
