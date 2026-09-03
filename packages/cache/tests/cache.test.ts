/**
 * @zudolib/cache — CacheService Tests
 *
 * Integration tests for CacheService: getOrSet, tags, patterns,
 * locking, stats, and health checks.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

import { MemoryCacheAdapter, createMemoryCacheAdapter } from "../src/memory.js";
import { CacheService, createCacheService } from "../src/cache.js";

let adapter: MemoryCacheAdapter;
let service: CacheService;

beforeEach(() => {
  adapter = createMemoryCacheAdapter();
  service = createCacheService({
    adapter,
    config: { enabled: true, defaultTtl: 60_000, collectStats: true },
  });
});

// ─── Basic CRUD ────────────────────────────────────────────────────────────

describe("CacheService — get/set", () => {
  it("stores and retrieves values", async () => {
    await service.set("greeting", "hello");
    const result = await service.get<string>("greeting");
    expect(result.hit).toBe(true);
    expect(result.value).toBe("hello");
  });

  it("returns miss for missing keys", async () => {
    const result = await service.get("missing");
    expect(result.hit).toBe(false);
  });
});

describe("CacheService — delete", () => {
  it("deletes an existing key", async () => {
    await service.set("key", "value");
    const result = await service.delete("key");
    expect(result.deleted).toBe(true);
  });
});

describe("CacheService — has", () => {
  it("returns true for existing key", async () => {
    await service.set("key", "value");
    expect(await service.has("key")).toBe(true);
  });

  it("returns false for missing key", async () => {
    expect(await service.has("missing")).toBe(false);
  });
});

describe("CacheService — clear", () => {
  it("clears all entries", async () => {
    await service.set("a", 1);
    await service.set("b", 2);
    const result = await service.clear();
    expect(result.cleared).toBe(2);
  });
});

// ─── getOrSet ──────────────────────────────────────────────────────────────

describe("CacheService — getOrSet", () => {
  it("computes and caches on miss", async () => {
    const fn = vi.fn().mockResolvedValue("computed");
    const result = await service.getOrSet("key", fn);
    expect(result.value).toBe("computed");
    expect(result.cached).toBe(false);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("returns cached value on hit", async () => {
    await service.set("key", "cached");
    const fn = vi.fn().mockResolvedValue("fresh");
    const result = await service.getOrSet("key", fn);
    expect(result.value).toBe("cached");
    expect(result.cached).toBe(true);
    expect(fn).not.toHaveBeenCalled();
  });

  it("forceRefresh re-computes", async () => {
    await service.set("key", "old");
    const fn = vi.fn().mockResolvedValue("new");
    const result = await service.getOrSet("key", fn, { forceRefresh: true });
    expect(result.value).toBe("new");
    expect(result.cached).toBe(false);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

// ─── Tags ──────────────────────────────────────────────────────────────────

describe("CacheService — tags", () => {
  it("invalidates entries by tag", async () => {
    await service.set("user:1", "alice", { tags: ["user"] });
    await service.set("user:2", "bob", { tags: ["user"] });
    await service.set("post:1", "hello", { tags: ["post"] });

    await service.invalidateByTag(["user"]);
    expect((await service.get("user:1")).hit).toBe(false);
    expect((await service.get("user:2")).hit).toBe(false);
    expect((await service.get("post:1")).hit).toBe(true);
  });
});

// ─── Patterns ──────────────────────────────────────────────────────────────

describe("CacheService — patterns", () => {
  it("invalidates entries by pattern", async () => {
    await service.set("user:1", "alice");
    await service.set("user:2", "bob");
    await service.set("post:1", "hello");

    // Keys are prefixed with zudo: by the key builder
    await service.invalidateByPattern("*:user:*");
    expect((await service.get("user:1")).hit).toBe(false);
    expect((await service.get("user:2")).hit).toBe(false);
    expect((await service.get("post:1")).hit).toBe(true);
  });
});

// ─── Locking ───────────────────────────────────────────────────────────────

describe("CacheService — locking", () => {
  it("withLock executes function while holding lock", async () => {
    let executed = false;
    await service.withLock("resource", async () => {
      executed = true;
    });
    expect(executed).toBe(true);
  });

  it("withLock releases lock after execution", async () => {
    await service.withLock("resource", async () => {});
    // Should be able to acquire the lock again
    await service.withLock("resource", async () => {});
  });

  it("withLock releases lock on error", async () => {
    await expect(
      service.withLock("resource", async () => {
        throw new Error("boom");
      }),
    ).rejects.toThrow("boom");
    // Lock should be released
    await service.withLock("resource", async () => {});
  });
});

// ─── Stats ─────────────────────────────────────────────────────────────────

describe("CacheService — stats", () => {
  it("returns cache statistics", async () => {
    await service.set("key", "value");
    await service.get("key"); // hit
    await service.get("missing"); // miss

    const stats = service.getStats();
    expect(stats).not.toBeNull();
    expect(stats!.hits).toBe(1);
    expect(stats!.misses).toBe(1);
    expect(stats!.sets).toBe(1);
  });

  it("returns null when stats disabled", async () => {
    const noStats = createCacheService({
      adapter,
      config: { collectStats: false },
    });
    expect(noStats.getStats()).toBeNull();
  });
});

// ─── Health Check ──────────────────────────────────────────────────────────

describe("CacheService — health check", () => {
  it("reports healthy for working adapter", async () => {
    const health = await service.healthCheck();
    expect(health.healthy).toBe(true);
    expect(health.adapter).toBe("memory");
    expect(health.latencyMs).toBeGreaterThanOrEqual(0);
    expect(health.checkedAt).toBeInstanceOf(Date);
  });
});

// ─── Disabled ──────────────────────────────────────────────────────────────

describe("CacheService — disabled", () => {
  it("returns miss for get when disabled", async () => {
    const disabled = createCacheService({
      adapter,
      config: { enabled: false },
    });
    const result = await disabled.get("key");
    expect(result.hit).toBe(false);
  });

  it("returns success=false for set when disabled", async () => {
    const disabled = createCacheService({
      adapter,
      config: { enabled: false },
    });
    const result = await disabled.set("key", "value");
    expect(result.success).toBe(false);
  });

  it("returns deleted=false for delete when disabled", async () => {
    const disabled = createCacheService({
      adapter,
      config: { enabled: false },
    });
    const result = await disabled.delete("key");
    expect(result.deleted).toBe(false);
  });
});

// ─── Lifecycle ─────────────────────────────────────────────────────────────

describe("CacheService — lifecycle", () => {
  it("connect and disconnect resolve", async () => {
    await expect(service.connect()).resolves.not.toThrow();
    await expect(service.disconnect()).resolves.not.toThrow();
  });
});

// ─── Factory ───────────────────────────────────────────────────────────────

describe("createCacheService", () => {
  it("creates a CacheService", () => {
    expect(createCacheService({ adapter })).toBeInstanceOf(CacheService);
  });
});
