/**
 * In-memory permission cache implementation.
 *
 * @module cache/cache
 */

import type {
  PermissionCache,
  PermissionDecision,
} from "../permissionTypes/index.js";

/** Cache entry with optional TTL. */
interface CacheEntry {
  readonly value: PermissionDecision;
  readonly expiresAt?: number;
}

/**
 * Create an in-memory permission cache.
 *
 * @param defaultTtlMs - Default TTL in milliseconds. Defaults to 60000 (1 minute).
 */
export function createMemoryPermissionCache(
  defaultTtlMs: number = 60000,
): PermissionCache {
  const store = new Map<string, CacheEntry>();

  return {
    async get(key: string): Promise<PermissionDecision | undefined> {
      const entry = store.get(key);
      if (!entry) return undefined;
      if (entry.expiresAt && Date.now() > entry.expiresAt) {
        store.delete(key);
        return undefined;
      }
      return entry.value;
    },

    async set(
      key: string,
      value: PermissionDecision,
      options?: { readonly ttl?: number },
    ): Promise<void> {
      const ttl = options?.ttl ?? defaultTtlMs;
      store.set(key, {
        value,
        expiresAt: ttl > 0 ? Date.now() + ttl : undefined,
      });
    },

    async delete(key: string): Promise<void> {
      store.delete(key);
    },

    async invalidateActor(actorId: string): Promise<void> {
      const prefix = `actor:${actorId}`;
      for (const key of store.keys()) {
        if (key.startsWith(prefix)) {
          store.delete(key);
        }
      }
    },
  };
}

/**
 * Generate a cache key for a permission check.
 */
export function permissionCacheKey(
  actorId: string,
  permission: string,
  resourceId?: string,
): string {
  const base = `actor:${actorId}:${permission}`;
  return resourceId ? `${base}:${resourceId}` : base;
}
