/**
 * @lattice/cache — Store Tests
 *
 * Tests for DefaultCacheStore: CRUD operations, events, middleware,
 * metrics integration, and error handling.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

import { MemoryCacheAdapter, createMemoryCacheAdapter } from "../src/memory.js";
import { DefaultCacheStore, createCacheStore } from "../src/store.js";
import { createCacheMetrics } from "../src/metrics.js";
import type { CacheMiddleware, CacheEvent, CacheEventHandler } from "../src/types.js";

let adapter: MemoryCacheAdapter;
let store: DefaultCacheStore;

beforeEach(() => {
  adapter = createMemoryCacheAdapter();
  store = createCacheStore({ adapter });
});

// ─── Basic Operations ──────────────────────────────────────────────────────

describe("DefaultCacheStore — get/set", () => {
  it("stores and retrieves values", async () => {
    await store.set("key", "value");
    const result = await store.get<string>("key");
    expect(result.hit).toBe(true);
    expect(result.value).toBe("value");
  });

  it("returns miss for missing keys", async () => {
    const result = await store.get("missing");
    expect(result.hit).toBe(false);
  });
});

describe("DefaultCacheStore — delete", () => {
  it("deletes an existing key", async () => {
    await store.set("key", "value");
    const result = await store.delete("key");
    expect(result.deleted).toBe(true);
  });

  it("returns deleted=false for missing key", async () => {
    const result = await store.delete("missing");
    expect(result.deleted).toBe(false);
  });
});

describe("DefaultCacheStore — has", () => {
  it("returns true for existing key", async () => {
    await store.set("key", "value");
    expect(await store.has("key")).toBe(true);
  });

  it("returns false for missing key", async () => {
    expect(await store.has("missing")).toBe(false);
  });
});

describe("DefaultCacheStore — clear", () => {
  it("clears all entries", async () => {
    await store.set("a", 1);
    await store.set("b", 2);
    const result = await store.clear();
    expect(result.cleared).toBe(2);
  });
});

describe("DefaultCacheStore — keys", () => {
  it("returns all keys", async () => {
    await store.set("a", 1);
    await store.set("b", 2);
    const keys = await store.keys();
    expect(keys).toHaveLength(2);
  });
});

// ─── Batch Operations ──────────────────────────────────────────────────────

describe("DefaultCacheStore — getMany", () => {
  it("returns results for multiple keys", async () => {
    await store.set("a", 1);
    await store.set("b", 2);
    const results = await store.getMany<number>(["a", "b", "missing"]);
    expect(results.size).toBe(3);
    expect(results.get("a")!.hit).toBe(true);
    expect(results.get("missing")!.hit).toBe(false);
  });
});

describe("DefaultCacheStore — setMany", () => {
  it("sets multiple entries", async () => {
    const entries = new Map([["a", 1], ["b", 2]]);
    const results = await store.setMany(entries, { ttl: 5000 });
    expect(results).toHaveLength(2);
    expect(results.every((r) => r.success)).toBe(true);
  });
});

describe("DefaultCacheStore — deleteMany", () => {
  it("deletes multiple keys", async () => {
    await store.set("a", 1);
    await store.set("b", 2);
    const result = await store.deleteMany(["a", "b"]);
    expect(result.deleted).toBe(2);
  });
});

// ─── Events ────────────────────────────────────────────────────────────────

describe("DefaultCacheStore — events", () => {
  it("emits cache.hit on cache hit", async () => {
    await store.set("key", "value");
    const handler = vi.fn();
    store.subscribe("cache.hit", handler);
    await store.get("key");
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].type).toBe("cache.hit");
  });

  it("emits cache.miss on cache miss", async () => {
    const handler = vi.fn();
    store.subscribe("cache.miss", handler);
    await store.get("missing");
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].type).toBe("cache.miss");
  });

  it("emits cache.set on set", async () => {
    const handler = vi.fn();
    store.subscribe("cache.set", handler);
    await store.set("key", "value");
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].type).toBe("cache.set");
  });

  it("emits cache.delete on delete", async () => {
    await store.set("key", "value");
    const handler = vi.fn();
    store.subscribe("cache.delete", handler);
    await store.delete("key");
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].type).toBe("cache.delete");
  });

  it("supports wildcard subscription", async () => {
    const handler = vi.fn();
    store.subscribe("*", handler);
    await store.set("key", "value");
    await store.get("key");
    expect(handler).toHaveBeenCalledTimes(2);
  });

  it("unsubscribe stops events", async () => {
    const handler = vi.fn();
    const sub = store.subscribe("cache.set", handler);
    await store.set("a", 1);
    expect(handler).toHaveBeenCalledTimes(1);
    sub.unsubscribe();
    await store.set("b", 2);
    expect(handler).toHaveBeenCalledTimes(1);
  });
});

// ─── Middleware ─────────────────────────────────────────────────────────────

describe("DefaultCacheStore — middleware", () => {
  it("executes middleware in order", async () => {
    const order: string[] = [];
    const middleware1: CacheMiddleware = async (ctx, next) => {
      order.push("before-1");
      const result = await next();
      order.push("after-1");
      return result;
    };
    const middleware2: CacheMiddleware = async (ctx, next) => {
      order.push("before-2");
      const result = await next();
      order.push("after-2");
      return result;
    };

    const storeWithMiddleware = createCacheStore({
      adapter,
      middlewares: [middleware1, middleware2],
    });

    await storeWithMiddleware.set("key", "value");
    expect(order).toEqual(["before-1", "before-2", "after-2", "after-1"]);
  });
});

// ─── Metrics Integration ───────────────────────────────────────────────────

describe("DefaultCacheStore — metrics", () => {
  it("tracks hits and misses", async () => {
    const metrics = createCacheMetrics();
    const storeWithMetrics = createCacheStore({ adapter, metrics });

    await storeWithMetrics.set("key", "value");
    await storeWithMetrics.get("key"); // hit
    await storeWithMetrics.get("missing"); // miss

    const stats = metrics.getStats();
    expect(stats.hits).toBe(1);
    expect(stats.misses).toBe(1);
    expect(stats.sets).toBe(1);
  });
});

// ─── Lifecycle ─────────────────────────────────────────────────────────────

describe("DefaultCacheStore — lifecycle", () => {
  it("connect and disconnect resolve", async () => {
    await expect(store.connect()).resolves.not.toThrow();
    await expect(store.disconnect()).resolves.not.toThrow();
  });
});

// ─── Factory ───────────────────────────────────────────────────────────────

describe("createCacheStore", () => {
  it("creates a DefaultCacheStore", () => {
    const s = createCacheStore({ adapter });
    expect(s).toBeInstanceOf(DefaultCacheStore);
  });

  it("uses adapter name", () => {
    const s = createCacheStore({ adapter });
    expect(s.name).toBe("memory");
  });
});
