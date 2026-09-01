import { describe, expect, it } from "vitest";

import {
  PluginManager,
  PluginRegistryImpl,
  DependencyResolver,
  LifecycleController,
  createPluginContext,
  isValidTransition,
  VALID_STATE_TRANSITIONS,
  PluginAlreadyRegisteredError,
  PluginDependencyError,
  PluginDependencyCycleError,
  PluginStateError,
  assertResolutionValid,
  PLUGIN_EVENTS,
  createPluginLifecycleEvent,
  createHealthyHealth,
  createDegradedHealth,
  createUnhealthyHealth,
  buildDiagnosticReport,
} from "../src/index.js";

describe("isValidTransition", () => {
  it("allows registered -> installing", () => {
    expect(isValidTransition("registered", "installing")).toBe(true);
  });

  it("allows installed -> initializing", () => {
    expect(isValidTransition("installed", "initializing")).toBe(true);
  });

  it("allows started -> stopping", () => {
    expect(isValidTransition("started", "stopping")).toBe(true);
  });

  it("rejects registered -> started", () => {
    expect(isValidTransition("registered", "started")).toBe(false);
  });

  it("rejects started -> installed", () => {
    expect(isValidTransition("started", "installed")).toBe(false);
  });
});

describe("VALID_STATE_TRANSITIONS", () => {
  it("contains all states", () => {
    const states = [
      "registered",
      "installing",
      "installed",
      "initializing",
      "initialized",
      "starting",
      "started",
      "stopping",
      "stopped",
      "disposing",
      "disposed",
      "failed",
    ];

    for (const state of states) {
      expect(VALID_STATE_TRANSITIONS[state]).toBeDefined();
    }
  });

  it("has empty transitions for disposed", () => {
    expect(VALID_STATE_TRANSITIONS.disposed).toEqual([]);
  });

  it("allows failed -> disposing", () => {
    expect(VALID_STATE_TRANSITIONS.failed).toContain("disposing");
  });
});

describe("DependencyResolver", () => {
  it("resolves simple dependencies", () => {
    const resolver = new DependencyResolver();
    const plugins = new Map([
      ["A", { dependencies: [{ name: "B" }] }],
      ["B", { dependencies: [] }],
    ]);

    const result = resolver.resolve(plugins);
    expect(result.ordered).toEqual(["B", "A"]);
    expect(result.missing).toEqual([]);
    expect(result.cycles).toEqual([]);
  });

  it("resolves complex dependency graph", () => {
    const resolver = new DependencyResolver();
    const plugins = new Map([
      ["A", { dependencies: [{ name: "B" }, { name: "C" }] }],
      ["B", { dependencies: [{ name: "D" }] }],
      ["C", { dependencies: [{ name: "D" }] }],
      ["D", { dependencies: [] }],
    ]);

    const result = resolver.resolve(plugins);
    expect(result.ordered).toEqual(["D", "B", "C", "A"]);
  });

  it("detects missing dependencies", () => {
    const resolver = new DependencyResolver();
    const plugins = new Map([
      ["A", { dependencies: [{ name: "B" }] }],
    ]);

    const result = resolver.resolve(plugins);
    expect(result.missing).toEqual(["B"]);
    expect(result.cycles).toEqual([]);
  });

  it("detects circular dependencies", () => {
    const resolver = new DependencyResolver();
    const plugins = new Map([
      ["A", { dependencies: [{ name: "B" }] }],
      ["B", { dependencies: [{ name: "A" }] }],
    ]);

    const result = resolver.resolve(plugins);
    expect(result.cycles.length).toBeGreaterThan(0);
  });

  it("throws on missing dependency", () => {
    const resolver = new DependencyResolver();
    const plugins = new Map([
      ["A", { dependencies: [{ name: "B" }] }],
    ]);

    const result = resolver.resolve(plugins);
    expect(() => {
      assertResolutionValid(result);
    }).toThrow(PluginDependencyError);
  });

  it("throws on circular dependency", () => {
    const resolver = new DependencyResolver();
    const plugins = new Map([
      ["A", { dependencies: [{ name: "B" }] }],
      ["B", { dependencies: [{ name: "A" }] }],
    ]);

    const result = resolver.resolve(plugins);
    expect(() => {
      assertResolutionValid(result);
    }).toThrow(PluginDependencyCycleError);
  });
});

describe("PluginRegistryImpl", () => {
  it("registers and retrieves plugins", () => {
    const registry = new PluginRegistryImpl();
    const plugin = {
      metadata: { name: "@oyinlola141/lattice-test" },
    };

    registry.register(plugin);
    expect(registry.has("@oyinlola141/lattice-test")).toBe(true);
    expect(registry.get("@oyinlola141/lattice-test")?.plugin).toBe(plugin);
  });

  it("rejects duplicate registration", () => {
    const registry = new PluginRegistryImpl();
    const plugin = {
      metadata: { name: "@oyinlola141/lattice-test" },
    };

    registry.register(plugin);
    expect(() => registry.register(plugin)).toThrow(PluginAlreadyRegisteredError);
  });

  it("lists all plugins", () => {
    const registry = new PluginRegistryImpl();
    registry.register({ metadata: { name: "A" } });
    registry.register({ metadata: { name: "B" } });

    const list = registry.list();
    expect(list).toHaveLength(2);
  });

  it("removes registered plugins", () => {
    const registry = new PluginRegistryImpl();
    registry.register({ metadata: { name: "@oyinlola141/lattice-test" } });

    expect(registry.remove("@oyinlola141/lattice-test")).toBe(true);
    expect(registry.has("@oyinlola141/lattice-test")).toBe(false);
  });
});

describe("LifecycleController", () => {
  it("transitions through install lifecycle", async () => {
    const controller = new LifecycleController();
    const registry = new PluginRegistryImpl();
    const plugin = {
      metadata: { name: "@oyinlola141/lattice-test" },
      install() {},
    };
    registry.register(plugin);
    const registered = registry.get("@oyinlola141/lattice-test")!;
    const context = createPluginContext(plugin.metadata);

    await controller.install(registered, context);
    expect(registered.state).toBe("installed");
  });

  it("transitions to failed on install error", async () => {
    const controller = new LifecycleController();
    const registry = new PluginRegistryImpl();
    const plugin = {
      metadata: { name: "@oyinlola141/lattice-test" },
      install() {
        throw new Error("install failed");
      },
    };
    registry.register(plugin);
    const registered = registry.get("@oyinlola141/lattice-test")!;
    const context = createPluginContext(plugin.metadata);

    await expect(controller.install(registered, context)).rejects.toThrow("install failed");
    expect(registered.state).toBe("failed");
  });

  it("rejects invalid state transitions", async () => {
    const controller = new LifecycleController();
    const registry = new PluginRegistryImpl();
    const plugin = {
      metadata: { name: "@oyinlola141/lattice-test" },
    };
    registry.register(plugin);
    const registered = registry.get("@oyinlola141/lattice-test")!;
    const context = createPluginContext(plugin.metadata);

    await expect(controller.start(registered, context)).rejects.toThrow(PluginStateError);
  });
});

describe("PluginManager", () => {
  it("registers and lists plugins", async () => {
    const manager = new PluginManager();
    manager.register({
      metadata: { name: "@oyinlola141/lattice-test" },
    });

    expect(manager.has("@oyinlola141/lattice-test")).toBe(true);
    expect(manager.list()).toHaveLength(1);
  });

  it("resolves dependencies and starts plugins in order", async () => {
    const manager = new PluginManager();
    const order: string[] = [];

    manager.register({
      metadata: { name: "@oyinlola141/lattice-a" },
      dependencies: [{ name: "@oyinlola141/lattice-b" }],
      async initialize() {
        order.push("a");
      },
      async start() {
        order.push("a-start");
      },
    });

    manager.register({
      metadata: { name: "@oyinlola141/lattice-b" },
      async initialize() {
        order.push("b");
      },
      async start() {
        order.push("b-start");
      },
    });

    const context = createPluginContext({ metadata: { name: "@oyinlola141/lattice-test" } });
    await manager.start(context);

    expect(order).toEqual(["b", "a", "b-start", "a-start"]);
  });

  it("rejects duplicate plugin registration", () => {
    const manager = new PluginManager();
    manager.register({
      metadata: { name: "@oyinlola141/lattice-test" },
    });

    expect(() => {
      manager.register({
        metadata: { name: "@oyinlola141/lattice-test" },
      });
    }).toThrow();
  });
});

describe("PluginContext", () => {
  it("creates context with plugin metadata", () => {
    const context = createPluginContext({ name: "@oyinlola141/lattice-test" });
    expect(context.plugin.name).toBe("@oyinlola141/lattice-test");
    expect(context.signal).toBeInstanceOf(AbortSignal);
  });

  it("supports onDispose handler", async () => {
    const context = createPluginContext({ name: "@oyinlola141/lattice-test" });
    let disposed = false;

    context.onDispose(() => {
      disposed = true;
    });

    expect(disposed).toBe(false);
  });

  it("supports registerDisposable", () => {
    const context = createPluginContext({ name: "@oyinlola141/lattice-test" });
    const disposable = {
      dispose() {
        return undefined;
      },
    };

    expect(() => context.registerDisposable(disposable)).not.toThrow();
  });

  it("creates context with optional integrations", () => {
    const logger = {
      info: () => {},
      warn: () => {},
      error: () => {},
    };

    const context = createPluginContext({ name: "@oyinlola141/lattice-test" }, {
      logger,
    });

    expect(context.logger).toBe(logger);
  });
});

describe("PluginEvents", () => {
  it("creates plugin lifecycle event", () => {
    const event = createPluginLifecycleEvent(
      { name: "@oyinlola141/lattice-test" },
      "installed",
      "installing",
    );

    expect(event.plugin.name).toBe("@oyinlola141/lattice-test");
    expect(event.state).toBe("installed");
    expect(event.previousState).toBe("installing");
    expect(event.timestamp).toBeGreaterThan(0);
  });

  it("creates event without previous state", () => {
    const event = createPluginLifecycleEvent(
      { name: "@oyinlola141/lattice-test" },
      "failed",
    );

    expect(event.state).toBe("failed");
    expect(event.previousState).toBeUndefined();
  });

  it("creates event with error", () => {
    const error = new Error("test error");
    const event = createPluginLifecycleEvent(
      { name: "@oyinlola141/lattice-test" },
      "failed",
      "starting",
      error,
    );

    expect(event.error).toBe(error);
  });
});

describe("PluginDiagnostics", () => {
  it("creates healthy health", () => {
    const health = createHealthyHealth();
    expect(health.status).toBe("healthy");
  });

  it("creates degraded health", () => {
    const health = createDegradedHealth({ reason: "not started" });
    expect(health.status).toBe("degraded");
    expect(health.details).toEqual({ reason: "not started" });
  });

  it("creates unhealthy health", () => {
    const health = createUnhealthyHealth({ reason: "connection lost" });
    expect(health.status).toBe("unhealthy");
    expect(health.details).toEqual({ reason: "connection lost" });
  });

  it("builds diagnostic report", () => {
    const report = buildDiagnosticReport([
      {
        plugin: { metadata: { name: "@oyinlola141/lattice-a" } },
        state: "started" as const,
      },
      {
        plugin: { metadata: { name: "@oyinlola141/lattice-b" } },
        state: "failed" as const,
      },
    ]);

    expect(report.total).toBe(2);
    expect(report.healthy).toBe(1);
    expect(report.unhealthy).toBe(1);
    expect(report.failed).toBe(1);
    expect(report.plugins).toHaveLength(2);
  });

  it("includes dependencies in diagnostic", () => {
    const report = buildDiagnosticReport([
      {
        plugin: {
          metadata: { name: "@oyinlola141/lattice-a" },
          dependencies: [{ name: "@oyinlola141/lattice-b" }],
          optionalDependencies: [{ name: "@oyinlola141/lattice-c" }],
        },
        state: "started" as const,
      },
    ]);

    const diagnostic = report.plugins[0]!;
    expect(diagnostic.dependencies).toEqual(["@oyinlola141/lattice-b"]);
    expect(diagnostic.optionalDependencies).toEqual(["@oyinlola141/lattice-c"]);
  });
});

describe("PluginManager.diagnostics", () => {
  it("returns diagnostic report", async () => {
    const manager = new PluginManager();
    manager.register({
      metadata: { name: "@oyinlola141/lattice-a" },
    });
    manager.register({
      metadata: { name: "@oyinlola141/lattice-b" },
      dependencies: [{ name: "@oyinlola141/lattice-a" }],
    });

    const context = createPluginContext({ metadata: { name: "@oyinlola141/lattice-test" } });
    await manager.start(context);

    const report = manager.diagnostics();

    expect(report.total).toBe(2);
    expect(report.healthy).toBe(2);
  });

  it("reflects failed state in diagnostics", async () => {
    const manager = new PluginManager();
    manager.register({
      metadata: { name: "@oyinlola141/lattice-a" },
      async install() {
        throw new Error("failed");
      },
    });

    const context = createPluginContext({ metadata: { name: "@oyinlola141/lattice-test" } });
    await manager.start(context).catch(() => {});

    const report = manager.diagnostics();
    expect(report.failed).toBe(1);
  });
});
