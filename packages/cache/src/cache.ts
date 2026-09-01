/**
 * @oyinlola141/lattice-cache — Cache Service
 * High-level cache service combining adapter, serializer, key builder, tags, invalidation, locking, and metrics.
 */

import type {
  CacheAdapter,
  CacheConfig,
  CacheDeleteResult,
  CacheGetResult,
  CacheHealth,
  CacheHealthChecker,
  CacheOrComputeOptions,
  CacheOrComputeResult,
  CacheSetResult,
  CacheStats,
  CacheStore,
  CacheTag,
} from "./types.js";
import type { CacheKeyBuilder } from "./types-keys.js";
import { DEFAULT_TTL_MS } from "./constants.js";
import { DefaultKeyBuilder } from "./key-builder.js";
import { createCacheStore, DefaultCacheStore } from "./store.js";
import { createTagStore, InMemoryTagStore } from "./tags.js";
import {
  CacheInvalidationManager,
  createInvalidationManager,
} from "./invalidation.js";
import { CacheLockManager, createLockManager } from "./lock.js";
import { createCacheMetrics, InMemoryCacheMetrics } from "./metrics.js";

export class CacheService implements CacheHealthChecker {
  private readonly store: CacheStore;
  private readonly keyBuilder: CacheKeyBuilder;
  private readonly tagStore: InMemoryTagStore;
  private readonly invalidation: CacheInvalidationManager;
  private readonly lockManager: CacheLockManager;
  private readonly metrics: InMemoryCacheMetrics | null;
  private readonly defaultTtl: number;
  private readonly enabled: boolean;

  constructor(options: {
    readonly adapter: CacheAdapter;
    readonly config?: CacheConfig;
    readonly keyBuilder?: CacheKeyBuilder;
  }) {
    this.enabled = options.config?.enabled ?? true;
    this.defaultTtl = options.config?.defaultTtl ?? DEFAULT_TTL_MS;
    this.metrics =
      options.config?.collectStats !== false ? createCacheMetrics() : null;
    this.store = createCacheStore({
      adapter: options.adapter,
      metrics: this.metrics as unknown as InMemoryCacheMetrics,
    });
    this.keyBuilder =
      options.keyBuilder ??
      new DefaultKeyBuilder({
        prefix: options.config?.prefix,
        separator: options.config?.separator,
        namespace: options.config?.namespace,
      });
    this.tagStore = createTagStore();
    this.invalidation = createInvalidationManager({
      adapter: options.adapter,
      tagStore: this.tagStore,
    });
    this.lockManager = createLockManager();
  }

  async get<TValue = unknown>(
    key: string,
    options?: { readonly namespace?: string },
  ): Promise<CacheGetResult<TValue>> {
    if (!this.enabled) return { hit: false, value: null };
    return this.store.get<TValue>(this.keyBuilder.build(key, options));
  }

  async set<TValue = unknown>(
    key: string,
    value: TValue,
    options?: {
      readonly ttl?: number;
      readonly tags?: readonly CacheTag[];
      readonly namespace?: string;
    },
  ): Promise<CacheSetResult> {
    if (!this.enabled) return { success: false, key, expiresAt: null };
    const fullKey = this.keyBuilder.build(key, options);
    const result = await this.store.set<TValue>(fullKey, value, {
      ttl: options?.ttl ?? this.defaultTtl,
      ...options,
    });
    if (options?.tags && options.tags.length > 0)
      await this.tagStore.add(fullKey, options.tags);
    return result;
  }

  async delete(
    key: string,
    options?: { readonly namespace?: string },
  ): Promise<CacheDeleteResult> {
    if (!this.enabled) return { deleted: false, key };
    return this.store.delete(this.keyBuilder.build(key, options));
  }

  async has(
    key: string,
    options?: { readonly namespace?: string },
  ): Promise<boolean> {
    if (!this.enabled) return false;
    return this.store.has(this.keyBuilder.build(key, options));
  }

  async clear(options?: {
    readonly namespace?: string;
    readonly pattern?: string;
  }): Promise<{ readonly cleared: number }> {
    if (!this.enabled) return { cleared: 0 };
    return this.store.clear(options);
  }

  async getOrSet<TValue>(
    key: string,
    fn: () => Promise<TValue>,
    options?: CacheOrComputeOptions,
  ): Promise<CacheOrComputeResult<TValue>> {
    if (!this.enabled) return { value: await fn(), cached: false };
    if (!options?.forceRefresh) {
      const cached = await this.get<TValue>(key, options);
      if (cached.hit) return { value: cached.value as TValue, cached: true };
    }
    const value = await fn();
    await this.set<TValue>(key, value, options);
    return { value, cached: false };
  }

  async invalidateByTag(
    tags: readonly CacheTag[],
  ): Promise<{ readonly cleared: number }> {
    return this.invalidation.invalidateByTag(tags);
  }

  async invalidateByPattern(
    pattern: string,
  ): Promise<{ readonly cleared: number }> {
    return this.invalidation.invalidateByPattern(pattern);
  }

  async withLock<T>(
    key: string,
    fn: () => Promise<T>,
    options?: { readonly ttl?: number; readonly retryAttempts?: number },
  ): Promise<T> {
    return this.lockManager.withLock(key, fn, {
      ttl: options?.ttl,
      retry: options?.retryAttempts
        ? { attempts: options.retryAttempts, delay: 100 }
        : undefined,
    });
  }

  getStats(): CacheStats | null {
    return this.metrics?.getStats() ?? null;
  }

  async healthCheck(): Promise<CacheHealth> {
    const start = performance.now();
    try {
      await this.store.has("__health__");
      return {
        healthy: true,
        adapter: this.store.name,
        latencyMs: performance.now() - start,
        checkedAt: new Date(),
      };
    } catch (error) {
      return {
        healthy: false,
        adapter: this.store.name,
        checkedAt: new Date(),
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async connect(): Promise<void> {
    await this.store.connect?.();
  }
  async disconnect(): Promise<void> {
    await this.store.disconnect?.();
  }
}

export function createCacheService(options: {
  readonly adapter: CacheAdapter;
  readonly config?: CacheConfig;
  readonly keyBuilder?: CacheKeyBuilder;
}): CacheService {
  return new CacheService(options);
}
