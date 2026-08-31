/**
 * @lattice/cache — Memory Adapter
 *
 * In-memory cache adapter using a `Map`. Suitable for development,
 * testing, and single-process deployments. Not suitable for distributed
 * caching or multi-instance scenarios.
 */

import type {
  CacheAdapter,
  CacheClearOptions,
  CacheClearResult,
  CacheDeleteOptions,
  CacheDeleteResult,
  CacheGetManyOptions,
  CacheGetOptions,
  CacheGetResult,
  CacheHasOptions,
  CacheKeysOptions,
  CacheSetManyOptions,
  CacheSetOptions,
  CacheSetResult,
  CacheTTL,
} from "./types.js";
import {
  DEFAULT_MAX_ENTRIES,
  DEFAULT_TTL_MS,
} from "./constants.js";

/* -------------------------------------------------------------------------- */
/* Internal Types                                                             */
/* -------------------------------------------------------------------------- */

interface MemoryEntry {
  readonly value: unknown;
  readonly createdAt: number;
  expiresAt: number | null;
  readonly tags: readonly string[];
  readonly metadata: Readonly<
    Record<string, unknown>
  >;
}

/* -------------------------------------------------------------------------- */
/* Memory Adapter                                                             */
/* -------------------------------------------------------------------------- */

/**
 * In-memory cache adapter backed by a `Map`.
 *
 * Supports TTL-based expiration, tags, and size limits.
 * Eviction uses an LRU-like strategy when the max size is reached.
 */
export class MemoryCacheAdapter implements CacheAdapter {
  readonly name = "memory";

  private readonly store = new Map<string, MemoryEntry>();
  private readonly maxEntries: number;
  private readonly defaultTtl: CacheTTL;

  constructor(options?: {
    readonly maxEntries?: number;
    readonly defaultTtl?: CacheTTL;
  }) {
    this.maxEntries =
      options?.maxEntries ?? DEFAULT_MAX_ENTRIES;
    this.defaultTtl =
      options?.defaultTtl ?? DEFAULT_TTL_MS;
  }

  /* ---- Read ---- */

  async get<TValue = unknown>(
    key: string,
    _options?: CacheGetOptions,
  ): Promise<CacheGetResult<TValue>> {
    const entry = this.store.get(key);

    if (!entry) {
      return { hit: false, value: null };
    }

    if (this.isExpired(entry)) {
      this.store.delete(key);
      return { hit: false, value: null };
    }

    return {
      hit: true,
      value: entry.value as TValue,
    };
  }

  /* ---- Write ---- */

  async set<TValue = unknown>(
    key: string,
    value: TValue,
    options?: CacheSetOptions,
  ): Promise<CacheSetResult> {
    this.evictIfNeeded();

    const ttl =
      options?.ttl ?? this.defaultTtl;
    const now = Date.now();

    this.store.set(key, {
      value,
      createdAt: now,
      expiresAt:
        ttl !== null ? now + ttl : null,
      tags: options?.tags ?? [],
      metadata: options?.metadata ?? {},
    });

    return {
      success: true,
      key,
      expiresAt:
        ttl !== null
          ? new Date(now + ttl)
          : null,
    };
  }

  /* ---- Delete ---- */

  async delete(
    key: string,
    _options?: CacheDeleteOptions,
  ): Promise<CacheDeleteResult> {
    const existed = this.store.has(key);
    this.store.delete(key);

    return { deleted: existed, key };
  }

  /* ---- Has ---- */

  async has(
    key: string,
    _options?: CacheHasOptions,
  ): Promise<boolean> {
    const entry = this.store.get(key);

    if (!entry) return false;

    if (this.isExpired(entry)) {
      this.store.delete(key);
      return false;
    }

    return true;
  }

  /* ---- Clear ---- */

  async clear(
    options?: CacheClearOptions,
  ): Promise<CacheClearResult> {
    if (!options?.pattern) {
      const size = this.store.size;
      this.store.clear();
      return { cleared: size };
    }

    let cleared = 0;
    const regex = this.patternToRegex(options.pattern);

    for (const key of [...this.store.keys()]) {
      if (regex.test(key)) {
        this.store.delete(key);
        cleared++;
      }
    }

    return { cleared };
  }

  /* ---- Keys ---- */

  async keys(
    options?: CacheKeysOptions,
  ): Promise<readonly string[]> {
    const allKeys = [...this.store.keys()];
    let filtered = allKeys;

    if (options?.pattern) {
      const regex = this.patternToRegex(
        options.pattern,
      );
      filtered = filtered.filter((k) =>
        regex.test(k),
      );
    }

    if (options?.limit !== undefined) {
      filtered = filtered.slice(
        0,
        options.limit,
      );
    }

    return filtered;
  }

  /* ---- Batch ---- */

  async getMany<TValue = unknown>(
    keys: readonly string[],
    _options?: CacheGetManyOptions,
  ): Promise<
    ReadonlyMap<string, CacheGetResult<TValue>>
  > {
    const results = new Map<
      string,
      CacheGetResult<TValue>
    >();

    for (const key of keys) {
      results.set(
        key,
        await this.get<TValue>(key),
      );
    }

    return results;
  }

  async setMany<TValue = unknown>(
    entries: ReadonlyMap<string, TValue>,
    options?: CacheSetManyOptions,
  ): Promise<readonly CacheSetResult[]> {
    const results: CacheSetResult[] = [];

    for (const [key, value] of entries) {
      results.push(
        await this.set<TValue>(key, value, options),
      );
    }

    return results;
  }

  async deleteMany(
    keys: readonly string[],
    _options?: { readonly namespace?: string },
  ): Promise<{
    readonly deleted: number;
    readonly keys: readonly string[];
  }> {
    let deleted = 0;
    const deletedKeys: string[] = [];

    for (const key of keys) {
      const result = await this.delete(key);
      if (result.deleted) {
        deleted++;
        deletedKeys.push(key);
      }
    }

    return { deleted, keys: deletedKeys };
  }

  /* ---- TTL ---- */

  async ttl(
    key: string,
    _options?: CacheGetOptions,
  ): Promise<number | null> {
    const entry = this.store.get(key);

    if (!entry) return null;
    if (entry.expiresAt === null) return null;

    const remaining = entry.expiresAt - Date.now();
    return remaining > 0 ? remaining : null;
  }

  async expire(
    key: string,
    ttl: CacheTTL,
    _options?: CacheGetOptions,
  ): Promise<boolean> {
    const entry = this.store.get(key);

    if (!entry) return false;

    // Re-create the entry with new expiry
    this.store.set(key, {
      ...entry,
      expiresAt: Date.now() + ttl,
    });

    return true;
  }

  /* ---- Helpers ---- */

  private isExpired(entry: MemoryEntry): boolean {
    if (entry.expiresAt === null) return false;
    return Date.now() > entry.expiresAt;
  }

  private evictIfNeeded(): void {
    if (this.store.size < this.maxEntries) return;

    // Remove the oldest entry (first inserted)
    const firstKey = this.store.keys().next().value;
    if (firstKey !== undefined) {
      this.store.delete(firstKey);
    }
  }

  private patternToRegex(pattern: string): RegExp {
    const escaped = pattern
      .replace(/[.+^${}()|[\]\\]/g, "\\$&")
      .replace(/\*/g, ".*")
      .replace(/\?/g, ".");
    return new RegExp(`^${escaped}$`);
  }
}

/* -------------------------------------------------------------------------- */
/* Factory                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Creates an in-memory cache adapter.
 */
export function createMemoryCacheAdapter(options?: {
  readonly maxEntries?: number;
  readonly defaultTtl?: CacheTTL;
}): MemoryCacheAdapter {
  return new MemoryCacheAdapter(options);
}
