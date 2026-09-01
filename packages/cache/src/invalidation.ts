/**
 * @oyinlola141/lattice-cache — Invalidation
 *
 * Coordinates cache invalidation across tags, patterns, and keys.
 * Works with both the tag store and the cache adapter to ensure
 * consistent invalidation.
 */

import type {
  CacheAdapter,
  CacheClearResult,
  CacheKey,
  CacheNamespace,
  CacheTag,
  CacheTagStore,
} from "./types.js";
import type { InMemoryTagStore } from "./tags.js";

/* -------------------------------------------------------------------------- */
/* Invalidation Manager                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Coordinates cache invalidation across multiple strategies:
 * - Tag-based invalidation
 * - Pattern-based invalidation
 * - Direct key invalidation
 */
export class CacheInvalidationManager {
  private readonly adapter: CacheAdapter;
  private readonly tagStore: CacheTagStore;

  constructor(options: {
    readonly adapter: CacheAdapter;
    readonly tagStore: CacheTagStore;
  }) {
    this.adapter = options.adapter;
    this.tagStore = options.tagStore;
  }

  /* ---- Tag Invalidation ---- */

  /**
   * Invalidates all cache entries associated with the given tags.
   * Returns the number of keys that were affected.
   */
  async invalidateByTag(
    tags: readonly CacheTag[],
    options?: { readonly namespace?: CacheNamespace },
  ): Promise<CacheClearResult> {
    let totalCleared = 0;

    for (const tag of tags) {
      const keys =
        await this.tagStore.getKeys(tag, options);

      for (const key of keys) {
        await this.adapter.delete(key, options);
      }

      const result =
        await this.tagStore.invalidate(tag, options);
      totalCleared += result.cleared;
    }

    return { cleared: totalCleared };
  }

  /* ---- Pattern Invalidation ---- */

  /**
   * Invalidates all cache entries matching the given glob pattern.
   */
  async invalidateByPattern(
    pattern: string,
    options?: { readonly namespace?: CacheNamespace },
  ): Promise<CacheClearResult> {
    return this.adapter.clear({
      ...options,
      pattern,
    });
  }

  /* ---- Namespace Invalidation ---- */

  /**
   * Invalidates all cache entries in the given namespace.
   */
  async invalidateByNamespace(
    namespace: CacheNamespace,
  ): Promise<CacheClearResult> {
    return this.adapter.clear({ namespace });
  }

  /* ---- Direct Key Invalidation ---- */

  /**
   * Invalidates a specific cache key.
   */
  async invalidateKey(
    key: CacheKey,
    options?: { readonly namespace?: CacheNamespace },
  ): Promise<{ readonly deleted: boolean }> {
    const result = await this.adapter.delete(
      key,
      options,
    );
    return { deleted: result.deleted };
  }

  /* ---- Bulk Invalidation ---- */

  /**
   * Invalidates multiple cache keys at once.
   */
  async invalidateKeys(
    keys: readonly CacheKey[],
    options?: { readonly namespace?: CacheNamespace },
  ): Promise<{
    readonly deleted: number;
    readonly keys: readonly CacheKey[];
  }> {
    let deleted = 0;
    const deletedKeys: CacheKey[] = [];

    for (const key of keys) {
      const result = await this.adapter.delete(
        key,
        options,
      );
      if (result.deleted) {
        deleted++;
        deletedKeys.push(key);
      }
    }

    return { deleted, keys: deletedKeys };
  }

  /* ---- Full Flush ---- */

  /**
   * Clears all entries in the cache adapter and resets the tag store.
   */
  async flushAll(): Promise<CacheClearResult> {
    const result = await this.adapter.clear();

    if (
      typeof (this.tagStore as InMemoryTagStore)
        .clear === "function"
    ) {
      (
        this.tagStore as InMemoryTagStore
      ).clear();
    }

    return result;
  }
}

/* -------------------------------------------------------------------------- */
/* Factory                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Creates a cache invalidation manager.
 */
export function createInvalidationManager(options: {
  readonly adapter: CacheAdapter;
  readonly tagStore: CacheTagStore;
}): CacheInvalidationManager {
  return new CacheInvalidationManager(options);
}
