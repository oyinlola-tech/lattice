import { describe, it, expect } from "vitest";
import {
  createExecutionContext,
  deriveExecutionContext,
  withExecutionMetadata,
  getExecutionDuration,
  createContextKey,
  setContextValue,
  getContextValue,
  requireContextValue,
  hasContextValue,
  deleteContextValue,
  createContextValues,
  createContextSnapshot,
  restoreContextSnapshot,
  deriveContextSnapshot,
} from "../src/index.js";

describe("ExecutionContext", () => {
  it("should create an execution context with defaults", () => {
    const ctx = createExecutionContext();
    expect(ctx.executionId).toBeDefined();
    expect(ctx.startedAt).toBeInstanceOf(Date);
    expect(ctx.metadata).toEqual({});
  });

  it("should create an execution context with custom values", () => {
    const ctx = createExecutionContext({
      executionId: "exec-123",
      correlationId: "corr-456",
      principalId: "user-789",
      service: "auth",
    });

    expect(ctx.executionId).toBe("exec-123");
    expect(ctx.correlationId).toBe("corr-456");
    expect(ctx.principalId).toBe("user-789");
    expect(ctx.service).toBe("auth");
  });

  it("should freeze the context", () => {
    const ctx = createExecutionContext();
    expect(Object.isFrozen(ctx)).toBe(true);
  });

  it("should derive a new context from an existing one", () => {
    const original = createExecutionContext({
      executionId: "exec-1",
      service: "auth",
      metadata: { key1: "value1" },
    });

    const derived = deriveExecutionContext(original, {
      principalId: "user-123",
      metadata: { key2: "value2" },
    });

    expect(derived.executionId).toBe("exec-1");
    expect(derived.principalId).toBe("user-123");
    expect(derived.metadata.key1).toBe("value1");
    expect(derived.metadata.key2).toBe("value2");
  });

  it("should not mutate original when deriving", () => {
    const original = createExecutionContext({
      metadata: { key1: "value1" },
    });

    deriveExecutionContext(original, {
      metadata: { key2: "value2" },
    });

    expect(Object.keys(original.metadata)).toHaveLength(1);
  });

  it("should add metadata with withExecutionMetadata", () => {
    const ctx = createExecutionContext({
      metadata: { existing: true },
    });

    const updated = withExecutionMetadata(ctx, { added: true });

    expect(updated.metadata.existing).toBe(true);
    expect(updated.metadata.added).toBe(true);
  });

  it("should calculate execution duration", () => {
    const ctx = createExecutionContext({
      startedAt: new Date(Date.now() - 1000),
    });

    const duration = getExecutionDuration(ctx);
    expect(duration).toBeGreaterThanOrEqual(999);
    expect(duration).toBeLessThan(2000);
  });
});

describe("ContextKey", () => {
  it("should create a context key", () => {
    const key = createContextKey<string>("testKey");
    expect(key.name).toBe("testKey");
    expect(typeof key.id).toBe("symbol");
  });

  it("should throw for empty name", () => {
    expect(() => createContextKey("")).toThrow();
  });
});

describe("Context value store functions", () => {
  it("should set and get context values", () => {
    const store = new Map<symbol, unknown>();
    const key = createContextKey<string>("test");

    setContextValue(store, key, "hello");
    expect(getContextValue(store, key)).toBe("hello");
  });

  it("should return undefined for missing values", () => {
    const store = new Map<symbol, unknown>();
    const key = createContextKey<string>("missing");

    expect(getContextValue(store, key)).toBeUndefined();
  });

  it("should require context values", () => {
    const store = new Map<symbol, unknown>();
    const key = createContextKey<string>("test");

    expect(() => requireContextValue(store, key)).toThrow();
    setContextValue(store, key, "hello");
    expect(requireContextValue(store, key)).toBe("hello");
  });

  it("should check if value exists", () => {
    const store = new Map<symbol, unknown>();
    const key = createContextKey<string>("test");

    expect(hasContextValue(store, key)).toBe(false);
    setContextValue(store, key, "hello");
    expect(hasContextValue(store, key)).toBe(true);
  });

  it("should delete values", () => {
    const store = new Map<symbol, unknown>();
    const key = createContextKey<string>("test");

    setContextValue(store, key, "hello");
    expect(deleteContextValue(store, key)).toBe(true);
    expect(hasContextValue(store, key)).toBe(false);
  });
});

describe("ContextValues", () => {
  it("should create empty context values", () => {
    const values = createContextValues();
    expect(values.size()).toBe(0);
    expect(values.isEmpty()).toBe(true);
  });

  it("should set and get values immutably", () => {
    const key1 = createContextKey<string>("key1");
    const key2 = createContextKey<string>("key2");

    const empty = createContextValues();
    const with1 = empty.set(key1, "hello");
    const with2 = with1.set(key2, "world");

    expect(empty.get(key1)).toBeUndefined();
    expect(with1.get(key1)).toBe("hello");
    expect(with2.get(key1)).toBe("hello");
    expect(with2.get(key2)).toBe("world");
  });

  it("should require values", () => {
    const key = createContextKey<number>("num");
    const values = createContextValues().set(key, 42);

    expect(values.require(key)).toBe(42);
    expect(() => createContextValues().require(key)).toThrow();
  });

  it("should delete values immutably", () => {
    const key = createContextKey<string>("test");
    const values = createContextValues().set(key, "hello");
    const deleted = values.delete(key);

    expect(values.has(key)).toBe(true);
    expect(deleted.has(key)).toBe(false);
  });

  it("should merge values", () => {
    const key1 = createContextKey<string>("key1");
    const key2 = createContextKey<string>("key2");

    const v1 = createContextValues().set(key1, "a");
    const v2 = createContextValues().set(key2, "b");
    const merged = v1.merge(v2);

    expect(merged.get(key1)).toBe("a");
    expect(merged.get(key2)).toBe("b");
  });

  it("should clear values immutably", () => {
    const key = createContextKey<string>("test");
    const values = createContextValues().set(key, "hello");
    const cleared = values.clear();

    expect(values.has(key)).toBe(true);
    expect(cleared.isEmpty()).toBe(true);
  });
});

describe("ContextSnapshot", () => {
  it("should create a snapshot", () => {
    const ctx = createExecutionContext();
    const snapshot = createContextSnapshot(ctx);

    expect(snapshot.context).toBe(ctx);
    expect(snapshot.capturedAt).toBeInstanceOf(Date);
    expect(snapshot.values).toBeDefined();
  });

  it("should restore a snapshot", () => {
    const ctx = createExecutionContext();
    const key = createContextKey<string>("test");
    const values = createContextValues().set(key, "hello");
    const snapshot = createContextSnapshot(ctx, values);

    const restored = restoreContextSnapshot(snapshot);
    expect(restored.context).toBe(ctx);
    expect(restored.values.get(key)).toBe("hello");
  });

  it("should derive a snapshot", () => {
    const ctx1 = createExecutionContext({ executionId: "exec-1" });
    const snapshot = createContextSnapshot(ctx1);

    const ctx2 = createExecutionContext({ executionId: "exec-2" });
    const derived = deriveContextSnapshot(snapshot, ctx2);

    expect(derived.context.executionId).toBe("exec-2");
    expect(derived.capturedAt).toBeInstanceOf(Date);
  });

  it("should freeze the snapshot", () => {
    const ctx = createExecutionContext();
    const snapshot = createContextSnapshot(ctx);
    expect(Object.isFrozen(snapshot)).toBe(true);
  });
});
