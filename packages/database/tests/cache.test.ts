import { describe, it, expect } from "vitest";
import {
  MemoryDatabaseCache,
  createDatabaseCache,
  createCacheKey,
  serializeCachePart,
  invalidateByPrefix,
  type CacheOptions,
} from "../src/index.js";

describe("MemoryDatabaseCache", () => {
  it("stores and retrieves a value", () => {
    const cache = new MemoryDatabaseCache<string>();
    cache.set("k", "v");
    expect(cache.get("k")).toBe("v");
  });

  it("returns undefined for missing keys", () => {
    const cache = new MemoryDatabaseCache<string>();
    expect(cache.get("missing")).toBeUndefined();
  });

  it("tracks hits and misses", () => {
    const cache = new MemoryDatabaseCache<string>();
    cache.set("a", "1");
    cache.get("a");
    cache.get("b");
    const stats = cache.getStats();
    expect(stats.hits).toBe(1);
    expect(stats.misses).toBe(1);
    expect(stats.hitRate).toBe(0.5);
  });

  it("has() returns true for existing keys", () => {
    const cache = new MemoryDatabaseCache<string>();
    cache.set("x", "1");
    expect(cache.has("x")).toBe(true);
    expect(cache.has("y")).toBe(false);
  });

  it("delete() returns true when removing an existing key", () => {
    const cache = new MemoryDatabaseCache<string>();
    cache.set("x", "1");
    expect(cache.delete("x")).toBe(true);
    expect(cache.delete("x")).toBe(false);
  });

  it("clear() empties the cache", () => {
    const cache = new MemoryDatabaseCache<string>();
    cache.set("a", "1");
    cache.set("b", "2");
    cache.clear();
    expect(cache.has("a")).toBe(false);
    expect(cache.size).toBe(0);
  });

  it("expires entries after TTL", async () => {
    const cache = new MemoryDatabaseCache<string>({ ttlMs: 10 });
    cache.set("k", "v");
    expect(cache.get("k")).toBe("v");
    await new Promise((r) => setTimeout(r, 20));
    expect(cache.get("k")).toBeUndefined();
  });

  it("rejects empty keys", () => {
    const cache = new MemoryDatabaseCache<string>();
    expect(() => cache.set("", "v")).toThrow();
  });
});

describe("createDatabaseCache", () => {
  it("creates a MemoryDatabaseCache", () => {
    const cache = createDatabaseCache<string>();
    expect(cache).toBeInstanceOf(MemoryDatabaseCache);
  });

  it("applies default TTL", async () => {
    const cache = createDatabaseCache<string>({ ttlMs: 10 });
    cache.set("k", "v");
    await new Promise((r) => setTimeout(r, 20));
    expect(cache.get("k")).toBeUndefined();
  });
});

describe("createCacheKey", () => {
  it("joins parts with a separator", () => {
    const k = createCacheKey("users", "find", 123);
    expect(k).toBe("users:find:123");
  });

  it("handles object parts via serializeCachePart", () => {
    const k = createCacheKey("users", { id: 1 });
    expect(k).toContain("users");
    expect(k).toContain('"id":1');
  });
});

describe("serializeCachePart", () => {
  it("serializes primitives", () => {
    expect(serializeCachePart(1)).toBe("1");
    expect(serializeCachePart("x")).toBe("x");
    expect(serializeCachePart(true)).toBe("true");
    expect(serializeCachePart(null)).toBe("null");
  });

  it("serializes objects as JSON", () => {
    expect(serializeCachePart({ a: 1 })).toBe('{"a":1}');
  });

  it("serializes arrays as JSON", () => {
    expect(serializeCachePart([1, 2, 3])).toBe("[1,2,3]");
  });
});

describe("invalidateByPrefix", () => {
  it("removes all entries matching a prefix", () => {
    const cache = new MemoryDatabaseCache<string>();
    cache.set("users:1", "alice");
    cache.set("users:2", "bob");
    cache.set("posts:1", "hello");
    invalidateByPrefix(cache, "users:");
    expect(cache.has("users:1")).toBe(false);
    expect(cache.has("users:2")).toBe(false);
    expect(cache.has("posts:1")).toBe(true);
  });
});
