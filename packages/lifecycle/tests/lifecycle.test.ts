/**
 * @zudojs/lifecycle tests
 *
 * Comprehensive tests for the lifecycle orchestration system.
 */

import { describe, it, expect, vi } from "vitest";
import {
  LifecycleStateMachine,
  LifecycleRegistry,
  DependencyGraph,
  topologicalSort,
  reverseTopologicalSort,
  withTimeout,
  withConcurrency,
  buildExecutionPlan,
  LifecycleExecutor,
  LifecycleManager,
  createLifecycleManager,
  LifecycleEventEmitter,
  STARTUP_PHASES,
  SHUTDOWN_PHASES,
  installSignalHandlers,
} from "../src/index.js";
import { LifecycleState, LifecyclePhase } from "@zudojs/constants";
import type { LifecycleComponent } from "../src/index.js";

describe("LifecycleStateMachine", () => {
  it("starts in IDLE state", () => {
    const sm = new LifecycleStateMachine("test");
    expect(sm.state).toBe(LifecycleState.IDLE);
  });

  it("transitions through valid states", () => {
    const sm = new LifecycleStateMachine("test");
    sm.transition(LifecycleState.INITIALIZING);
    expect(sm.state).toBe(LifecycleState.INITIALIZING);
    sm.transition(LifecycleState.INITIALIZED);
    expect(sm.state).toBe(LifecycleState.INITIALIZED);
    sm.transition(LifecycleState.STARTING);
    expect(sm.state).toBe(LifecycleState.STARTING);
    sm.transition(LifecycleState.STARTED);
    expect(sm.state).toBe(LifecycleState.STARTED);
    sm.transition(LifecycleState.READY);
    expect(sm.state).toBe(LifecycleState.READY);
  });

  it("rejects invalid transitions", () => {
    const sm = new LifecycleStateMachine("test");
    expect(() => sm.transition(LifecycleState.READY)).toThrow();
  });

  it("reports isRunning correctly", () => {
    const sm = new LifecycleStateMachine("test");
    expect(sm.isRunning).toBe(false);
    sm.transition(LifecycleState.INITIALIZING);
    sm.transition(LifecycleState.INITIALIZED);
    sm.transition(LifecycleState.STARTING);
    sm.transition(LifecycleState.STARTED);
    expect(sm.isRunning).toBe(true);
    sm.transition(LifecycleState.READY);
    expect(sm.isRunning).toBe(true);
  });

  it("reports isTerminal correctly", () => {
    const sm = new LifecycleStateMachine("test");
    expect(sm.isTerminal).toBe(false);
    sm.transition(LifecycleState.INITIALIZING);
    sm.transition(LifecycleState.INITIALIZED);
    sm.transition(LifecycleState.STARTING);
    sm.transition(LifecycleState.STARTED);
    sm.transition(LifecycleState.READY);
    sm.transition(LifecycleState.STOPPING);
    sm.transition(LifecycleState.STOPPED);
    expect(sm.isTerminal).toBe(true);
  });

  it("can force state", () => {
    const sm = new LifecycleStateMachine("test");
    sm.forceState(LifecycleState.READY);
    expect(sm.state).toBe(LifecycleState.READY);
  });
});

describe("DependencyGraph", () => {
  it("adds nodes and edges", () => {
    const graph = new DependencyGraph();
    graph.addNode("a");
    graph.addNode("b");
    graph.addEdge("b", "a");

    expect(graph.getNodes()).toContain("a");
    expect(graph.getNodes()).toContain("b");
    expect(graph.getDependencies("b")).toContain("a");
    expect(graph.getDependents("a")).toContain("b");
  });

  it("validates acyclic graph", () => {
    const graph = new DependencyGraph();
    graph.addEdge("a", "b");
    graph.addEdge("b", "c");
    expect(() => graph.validate()).not.toThrow();
  });

  it("detects circular dependencies", () => {
    const graph = new DependencyGraph();
    graph.addEdge("a", "b");
    graph.addEdge("b", "c");
    graph.addEdge("c", "a");
    expect(() => graph.validate()).toThrow();
  });
});

describe("topologicalSort", () => {
  it("sorts linear dependencies", () => {
    const graph = new DependencyGraph();
    graph.addEdge("b", "a");
    graph.addEdge("c", "b");

    const stages = topologicalSort(graph);
    expect(stages.length).toBe(3);
    expect(stages[0]).toEqual(["a"]);
    expect(stages[1]).toEqual(["b"]);
    expect(stages[2]).toEqual(["c"]);
  });

  it("groups independent components in parallel stages", () => {
    const graph = new DependencyGraph();
    graph.addEdge("c", "a");
    graph.addEdge("c", "b");

    const stages = topologicalSort(graph);
    expect(stages.length).toBe(2);
    expect(stages[0]).toEqual(expect.arrayContaining(["a", "b"]));
    expect(stages[1]).toEqual(["c"]);
  });

  it("respects priority within stages", () => {
    const graph = new DependencyGraph();
    graph.addNode("a");
    graph.addNode("b");

    const priorities = new Map([
      ["a", 10],
      ["b", 5],
    ]);
    const stages = topologicalSort(graph, priorities);
    expect(stages[0]).toEqual(["a", "b"]);
  });
});

describe("reverseTopologicalSort", () => {
  it("reverses the order for shutdown", () => {
    const graph = new DependencyGraph();
    graph.addEdge("b", "a");
    graph.addEdge("c", "b");

    const stages = reverseTopologicalSort(graph);
    expect(stages[0]).toEqual(["c"]);
    expect(stages[1]).toEqual(["b"]);
    expect(stages[2]).toEqual(["a"]);
  });
});

describe("withTimeout", () => {
  it("resolves before timeout", async () => {
    const result = await withTimeout(async () => "ok", 1000, "test", "start");
    expect(result).toBe("ok");
  });

  it("rejects on timeout", async () => {
    await expect(
      withTimeout(
        () => new Promise((resolve) => setTimeout(resolve, 1000)),
        50,
        "test",
        "start",
      ),
    ).rejects.toThrow();
  });
});

describe("withConcurrency", () => {
  it("executes items with concurrency limit", async () => {
    const executed: number[] = [];
    const items = [1, 2, 3, 4, 5];

    await withConcurrency(items, 2, async (item) => {
      executed.push(item);
    });

    expect(executed).toEqual([1, 2, 3, 4, 5]);
  });
});

describe("LifecycleRegistry", () => {
  it("registers components", () => {
    const registry = new LifecycleRegistry();
    const component: LifecycleComponent = { name: "test" };
    registry.register(component);
    expect(registry.size).toBe(1);
    expect(registry.get("test")).toBeDefined();
  });

  it("prevents duplicate registration", () => {
    const registry = new LifecycleRegistry();
    registry.register({ name: "test" });
    expect(() => registry.register({ name: "test" })).toThrow();
  });

  it("validates dependencies exist", () => {
    const registry = new LifecycleRegistry();
    registry.register({ name: "queue" }, { dependsOn: ["database"] });
    expect(() => registry.validate()).toThrow();
  });

  it("validates acyclic dependencies", () => {
    const registry = new LifecycleRegistry();
    registry.register({ name: "a" }, { dependsOn: ["b"] });
    registry.register({ name: "b" }, { dependsOn: ["a"] });
    expect(() => registry.validate()).toThrow();
  });

  it("freezes registry", () => {
    const registry = new LifecycleRegistry();
    registry.register({ name: "test" });
    registry.freeze();
    expect(registry.isFrozen).toBe(true);
    expect(() => registry.register({ name: "test2" })).toThrow();
  });
});

describe("buildExecutionPlan", () => {
  it("builds startup plan with correct ordering", () => {
    const registrations = [
      {
        id: "db",
        component: { name: "db", start: async () => {} },
        dependsOn: [],
        priority: 0,
        critical: true,
        timeout: 30000,
        retry: { attempts: 0 },
      },
      {
        id: "queue",
        component: { name: "queue", start: async () => {} },
        dependsOn: ["db"],
        priority: 0,
        critical: true,
        timeout: 30000,
        retry: { attempts: 0 },
      },
      {
        id: "server",
        component: { name: "server", start: async () => {} },
        dependsOn: ["queue"],
        priority: 0,
        critical: true,
        timeout: 30000,
        retry: { attempts: 0 },
      },
    ];

    const plan = buildExecutionPlan(registrations, "start" as never);
    expect(plan.stages.length).toBe(3);
    expect(plan.stages[0]!.components).toEqual(["db"]);
    expect(plan.stages[1]!.components).toEqual(["queue"]);
    expect(plan.stages[2]!.components).toEqual(["server"]);
  });
});

describe("LifecycleExecutor", () => {
  it("executes component hooks", async () => {
    const executor = new LifecycleExecutor();
    const startFn = vi.fn();
    const reg = {
      id: "test",
      component: { name: "test", start: startFn },
      dependsOn: [],
      priority: 0,
      critical: true,
      timeout: 5000,
      retry: { attempts: 0 },
    };

    const context = {
      signal: new AbortController().signal,
      phase: LifecyclePhase.START,
      startedAt: Date.now(),
      metadata: new Map(),
    };

    const result = await executor.execute(reg, LifecyclePhase.START, context);
    expect(result.success).toBe(true);
    expect(startFn).toHaveBeenCalled();
  });

  it("reports failure for non-existent hooks", async () => {
    const executor = new LifecycleExecutor();
    const reg = {
      id: "test",
      component: { name: "test" },
      dependsOn: [],
      priority: 0,
      critical: true,
      timeout: 5000,
      retry: { attempts: 0 },
    };

    const context = {
      signal: new AbortController().signal,
      phase: LifecyclePhase.STOP,
      startedAt: Date.now(),
      metadata: new Map(),
    };

    const result = await executor.execute(reg, LifecyclePhase.STOP, context);
    expect(result.success).toBe(true);
  });
});

describe("LifecycleManager", () => {
  it("registers and starts components", async () => {
    const manager = createLifecycleManager({ handleSignals: false });
    const startFn = vi.fn();
    manager.register({ name: "test", start: startFn });

    await manager.start();
    expect(startFn).toHaveBeenCalled();
    expect(manager.state).toBe(LifecycleState.READY);
    manager.dispose();
  });

  it("handles component dependencies", async () => {
    const manager = createLifecycleManager({ handleSignals: false });
    const order: string[] = [];

    manager.register({
      name: "db",
      start: async () => {
        order.push("db");
      },
    });
    manager.register(
      {
        name: "queue",
        start: async () => {
          order.push("queue");
        },
      },
      { dependsOn: ["db"] },
    );
    manager.register(
      {
        name: "server",
        start: async () => {
          order.push("server");
        },
      },
      { dependsOn: ["queue"] },
    );

    await manager.start();
    expect(order).toEqual(["db", "queue", "server"]);
    manager.dispose();
  });

  it("shuts down in reverse order", async () => {
    const manager = createLifecycleManager({ handleSignals: false });
    const order: string[] = [];

    manager.register({
      name: "db",
      start: async () => {},
      stop: async () => {
        order.push("db");
      },
    });
    manager.register(
      {
        name: "server",
        start: async () => {},
        stop: async () => {
          order.push("server");
        },
      },
      { dependsOn: ["db"] },
    );

    await manager.start();
    await manager.shutdown();

    expect(order[0]).toBe("server");
    expect(order[1]).toBe("db");
  });

  it("is idempotent for start", async () => {
    const manager = createLifecycleManager({ handleSignals: false });
    const startFn = vi.fn();
    manager.register({ name: "test", start: startFn });

    await manager.start();
    await manager.start();

    expect(startFn).toHaveBeenCalledTimes(1);
    manager.dispose();
  });

  it("is idempotent for shutdown", async () => {
    const manager = createLifecycleManager({ handleSignals: false });
    manager.register({ name: "test" });

    await manager.start();
    await manager.shutdown();
    await manager.shutdown();

    expect(manager.state).toBe(LifecycleState.DISPOSED);
  });

  it("tracks component status", async () => {
    const manager = createLifecycleManager({ handleSignals: false });
    manager.register({ name: "test", start: async () => {} });

    await manager.start();
    const status = manager.getStatus();
    expect(status.get("test")?.state).toBe(LifecycleState.READY);
    manager.dispose();
  });
});

describe("LifecycleEventEmitter", () => {
  it("emits events to listeners", () => {
    const emitter = new LifecycleEventEmitter();
    const listener = vi.fn();

    emitter.on("component:started", listener);
    emitter.emit("component:started", {
      component: { componentId: "test", duration: 100 },
    });

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "component:started",
        component: { componentId: "test", duration: 100 },
      }),
    );
  });

  it("unsubscribes listeners", () => {
    const emitter = new LifecycleEventEmitter();
    const listener = vi.fn();

    const unsub = emitter.on("component:started", listener);
    emitter.emit("component:started", { component: { componentId: "test" } });
    expect(listener).toHaveBeenCalledTimes(1);

    unsub();
    emitter.emit("component:started", { component: { componentId: "test" } });
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("clears all listeners", () => {
    const emitter = new LifecycleEventEmitter();
    const listener = vi.fn();

    emitter.on("component:started", listener);
    emitter.clear();
    emitter.emit("component:started", { component: { componentId: "test" } });
    expect(listener).not.toHaveBeenCalled();
  });
});

describe("Phase constants", () => {
  it("has correct startup phases", () => {
    expect(STARTUP_PHASES).toEqual(["initialize", "start", "ready"]);
  });

  it("has correct shutdown phases", () => {
    expect(SHUTDOWN_PHASES).toEqual(["stop", "dispose"]);
  });
});
