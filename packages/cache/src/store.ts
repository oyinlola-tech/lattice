/**
 * @lattice/cache — Store
 *
 * High-level cache store that wraps a `CacheAdapter` and adds
 * metrics collection, event emission, middleware support, and
 * error handling.
 */

import type {
  CacheAdapter,
  CacheClearOptions,
  CacheClearResult,
  CacheDeleteOptions,
  CacheDeleteResult,
  CacheEvent,
  CacheEventHandler,
  CacheEventSubscription,
  CacheGetManyOptions,
  CacheGetOptions,
  CacheGetResult,
  CacheHasOptions,
  CacheKeysOptions,
  CacheMiddleware,
  CacheMiddlewareContext,
  CacheSetManyOptions,
  CacheSetOptions,
  CacheSetResult,
  CacheStore,
} from "./types.js";
import { CacheError } from "./errors.js";
import type { CacheMetrics } from "./types.js";
import type { CacheOperation } from "@lattice/errors";

/* -------------------------------------------------------------------------- */
/* Default Store                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Wraps a `CacheAdapter` with metrics, events, middleware, and error handling.
 */
export class DefaultCacheStore implements CacheStore {
  readonly name: string;

  private readonly adapter: CacheAdapter;
  private readonly metrics?: CacheMetrics;
  private readonly middlewares: CacheMiddleware[] = [];
  private readonly handlers = new Map<
    string,
    Set<CacheEventHandler>
  >();

  constructor(options: {
    readonly adapter: CacheAdapter;
    readonly metrics?: CacheMetrics;
    readonly middlewares?: readonly CacheMiddleware[];
  }) {
    this.adapter = options.adapter;
    this.name = options.adapter.name;
    this.metrics = options.metrics;
    if (options.middlewares) {
      this.middlewares = [...options.middlewares];
    }
  }

  /* ---- Lifecycle ---- */

  connect(): Promise<void> {
    return this.adapter.connect?.() ?? Promise.resolve();
  }

  disconnect(): Promise<void> {
    return (
      this.adapter.disconnect?.() ?? Promise.resolve()
    );
  }

  /* ---- Read Operations ---- */

  async get<TValue = unknown>(
    key: string,
    options?: CacheGetOptions,
  ): Promise<CacheGetResult<TValue>> {      return this.executeWithMiddleware("get" as CacheOperation, key, () =>
      this.adapter.get<TValue>(key, options),
    );
  }

  async has(
    key: string,
    options?: CacheHasOptions,
  ): Promise<boolean> {      return this.executeWithMiddleware("has" as CacheOperation, key, () =>
      this.adapter.has(key, options),
    );
  }

  async keys(
    options?: CacheKeysOptions,
  ): Promise<readonly string[]> {      return this.executeWithMiddleware(
      "keys" as CacheOperation,
      "*",
      () => this.adapter.keys?.(options) ?? Promise.resolve([]),
    );
  }

  /* ---- Write Operations ---- */

  async set<TValue = unknown>(
    key: string,
    value: TValue,
    options?: CacheSetOptions,
  ): Promise<CacheSetResult> {      return this.executeWithMiddleware("set" as CacheOperation, key, () =>
      this.adapter.set<TValue>(key, value, options),
    );
  }

  async delete(
    key: string,
    options?: CacheDeleteOptions,
  ): Promise<CacheDeleteResult> {      return this.executeWithMiddleware("delete" as CacheOperation, key, () =>
      this.adapter.delete(key, options),
    );
  }

  async clear(
    options?: CacheClearOptions,
  ): Promise<CacheClearResult> {      return this.executeWithMiddleware(
      "clear" as CacheOperation,
      "*",
      () => this.adapter.clear(options),
    );
  }

  /* ---- Batch Operations ---- */

  async getMany<TValue = unknown>(
    keys: readonly string[],
    options?: CacheGetManyOptions,
  ): Promise<
    ReadonlyMap<string, CacheGetResult<TValue>>
  > {
    if (this.adapter.getMany) {
      return this.adapter.getMany<TValue>(keys, options);
    }

    const results = new Map<
      string,
      CacheGetResult<TValue>
    >();

    for (const key of keys) {
      results.set(
        key,
        await this.get<TValue>(key, options),
      );
    }

    return results;
  }

  async setMany<TValue = unknown>(
    entries: ReadonlyMap<string, TValue>,
    options?: CacheSetManyOptions,
  ): Promise<readonly CacheSetResult[]> {
    if (this.adapter.setMany) {
      return this.adapter.setMany<TValue>(
        entries,
        options,
      );
    }

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
    options?: { readonly namespace?: string },
  ): Promise<{ readonly deleted: number; readonly keys: readonly string[] }> {
    if (this.adapter.deleteMany) {
      return this.adapter.deleteMany(keys, options);
    }

    let deleted = 0;
    const deletedKeys: string[] = [];

    for (const key of keys) {
      const result = await this.delete(key, options);
      if (result.deleted) {
        deleted++;
        deletedKeys.push(key);
      }
    }

    return { deleted, keys: deletedKeys };
  }

  /* ---- Events ---- */

  subscribe(
    eventType: CacheEvent["type"] | "*",
    handler: CacheEventHandler,
  ): CacheEventSubscription {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler);

    return {
      unsubscribe: () => {
        this.handlers.get(eventType)?.delete(handler);
      },
    };
  }

  /* ---- Internal ---- */

  private emit(event: CacheEvent): void {
    const specificHandlers = this.handlers.get(
      event.type,
    );
    const wildcardHandlers = this.handlers.get("*");

    const all = new Set<CacheEventHandler>([
      ...(specificHandlers ?? []),
      ...(wildcardHandlers ?? []),
    ]);

    for (const handler of all) {
      try {
        handler(event);
      } catch {
        // Swallow event handler errors to avoid breaking cache ops
      }
    }
  }

  private async executeWithMiddleware<T>(
    operation: CacheOperation,
    key: string,
    fn: () => Promise<T>,
  ): Promise<T> {
    const context: CacheMiddlewareContext = {
      key,
      operation,
      startedAt: new Date(),
    };

    const execute = async (): Promise<T> => {
      const start = performance.now();

      try {
        const result = await fn();
        const latencyMs = performance.now() - start;

        this.metrics?.observeLatency(
          operation,
          latencyMs,
        );

        if (operation === "get") {
          const hitResult = result as CacheGetResult;
          if (hitResult.hit) {
            this.metrics?.incrementHit(key);
            this.emit({
              type: "cache.hit",
              key,
              occurredAt: new Date(),
              latencyMs,
            });
          } else {
            this.metrics?.incrementMiss(key);
            this.emit({
              type: "cache.miss",
              key,
              occurredAt: new Date(),
              latencyMs,
            });
          }
        } else if (operation === "set") {
          this.metrics?.incrementSet(key);
          this.emit({
            type: "cache.set",
            key,
            occurredAt: new Date(),
          });
        } else if (operation === "delete") {
          this.metrics?.incrementDelete(key);
          this.emit({
            type: "cache.delete",
            key,
            occurredAt: new Date(),
            deleted: true,
          });
        } else if (operation === "clear") {
          this.emit({
            type: "cache.clear",
            occurredAt: new Date(),
            cleared: 0,
          });
        }

        return result;
      } catch (error) {
        this.metrics?.incrementError(key);
        this.emit({
          type: "cache.error",
          key,
          occurredAt: new Date(),
          error,
        });

        throw new CacheError(
          `Cache ${operation} failed for key "${key}".`,
          {
            cause: error,
            operation: operation as CacheOperation,
            key,
          },
        );
      }
    };

    // Execute through middleware chain
    let index = 0;
    const chain = async (): Promise<T> => {
      if (index >= this.middlewares.length) {
        return execute();
      }

      const middleware =
        this.middlewares[index];
      index++;
      if (middleware === undefined) {
        return execute();
      }
      return middleware(context, chain) as Promise<T>;
    };

    return chain();
  }
}

/* -------------------------------------------------------------------------- */
/* Factory                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Creates a `DefaultCacheStore` wrapping the given adapter.
 */
export function createCacheStore(options: {
  readonly adapter: CacheAdapter;
  readonly metrics?: CacheMetrics;
  readonly middlewares?: readonly CacheMiddleware[];
}): DefaultCacheStore {
  return new DefaultCacheStore(options);
}
