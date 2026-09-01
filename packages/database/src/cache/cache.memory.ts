import {
  DatabaseError,
} from "@oyinlola141/lattice-errors";

/**
 * Cache entry stored by the database cache.
 */
export interface CacheEntry<
  TValue,
> {
  readonly value: TValue;
  readonly createdAt: number;
  readonly expiresAt?: number;
}

/**
 * Options for a cache operation.
 */
export interface CacheOptions {
  readonly ttlMs?: number;
}

/**
 * Statistics exposed by the cache.
 */
export interface CacheStats {
  readonly size: number;
  readonly hits: number;
  readonly misses: number;
  readonly hitRate: number;
}

/**
 * Generic cache contract.
 */
export interface DatabaseCache<
  TValue = unknown,
> {
  get(
    key: string,
  ): TValue | undefined;

  set(
    key: string,
    value: TValue,
    options?: CacheOptions,
  ): void;

  has(
    key: string,
  ): boolean;

  delete(
    key: string,
  ): boolean;

  clear(): void;
}

/**
 * In-memory cache implementation for database read results.
 *
 * This cache is intentionally process-local. It should not be used
 * where multiple application instances require shared cache state.
 */
export class MemoryDatabaseCache<
  TValue = unknown,
>
  implements DatabaseCache<TValue>
{
  private readonly entries =
    new Map<
      string,
      CacheEntry<TValue>
    >();

  private hits = 0;

  private misses = 0;

  private readonly defaultTtlMs?: number;

  constructor(
    options: CacheOptions = {},
  ) {
    this.defaultTtlMs =
      normalizeTtl(
        options.ttlMs,
      );
  }

  /**
   * Gets a cached value.
   */
  public get(
    key: string,
  ): TValue | undefined {
    validateKey(
      key,
    );

    const entry =
      this.entries.get(
        key,
      );

    if (!entry) {
      this.misses += 1;

      return undefined;
    }

    if (
      isExpired(entry)
    ) {
      this.entries.delete(
        key,
      );

      this.misses += 1;

      return undefined;
    }

    this.hits += 1;

    return entry.value;
  }

  /**
   * Sets a cached value.
   */
  public set(
    key: string,
    value: TValue,
    options: CacheOptions = {},
  ): void {
    validateKey(
      key,
    );

    const ttlMs =
      normalizeTtl(
        options.ttlMs ??
          this.defaultTtlMs,
      );

    const createdAt =
      Date.now();

    this.entries.set(
      key,
      {
        value,
        createdAt,
        expiresAt:
          ttlMs === undefined
            ? undefined
            : createdAt +
              ttlMs,
      },
    );
  }

  /**
   * Checks whether a valid cached value exists.
   */
  public has(
    key: string,
  ): boolean {
    validateKey(
      key,
    );

    const entry =
      this.entries.get(
        key,
      );

    if (!entry) {
      return false;
    }

    if (
      isExpired(entry)
    ) {
      this.entries.delete(
        key,
      );

      return false;
    }

    return true;
  }

  /**
   * Deletes a cache entry.
   */
  public delete(
    key: string,
  ): boolean {
    validateKey(
      key,
    );

    return this.entries.delete(
      key,
    );
  }

  /**
   * Clears the entire cache.
   */
  public clear(): void {
    this.entries.clear();
  }

  /**
   * Removes expired entries.
   */
  public prune(): number {
    let removed = 0;

    for (
      const [
        key,
        entry,
      ] of this.entries
    ) {
      if (
        isExpired(entry)
      ) {
        this.entries.delete(
          key,
        );

        removed += 1;
      }
    }

    return removed;
  }

  /**
   * Returns the number of valid entries.
   */
  public get size(): number {
    this.prune();

    return this.entries.size;
  }

  /**
   * Returns cache statistics.
   */
  public getStats(): CacheStats {
    this.prune();

    const total =
      this.hits +
      this.misses;

    return {
      size:
        this.entries.size,
      hits:
        this.hits,
      misses:
        this.misses,
      hitRate:
        total === 0
          ? 0
          : this.hits /
            total,
    };
  }

  /**
   * Resets hit/miss counters.
   */
  public resetStats(): void {
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Returns all currently valid cache keys.
   */
  public keys(): readonly string[] {
    this.prune();

    return Object.freeze([
      ...this.entries.keys(),
    ]);
  }
}

/**
 * Creates an in-memory database cache.
 */
export function createDatabaseCache<
  TValue = unknown,
>(
  options: CacheOptions = {},
): MemoryDatabaseCache<TValue> {
  return new MemoryDatabaseCache<TValue>(
    options,
  );
}

/**
 * Builds a stable cache key from a namespace and parts.
 */
export function createCacheKey(
  namespace: string,
  ...parts: readonly unknown[]
): string {
  validateKey(
    namespace,
  );

  return [
    namespace,
    ...parts.map(
      serializeCachePart,
    ),
  ].join(":");
}

/**
 * Serializes a cache key component deterministically.
 */
export function serializeCachePart(
  value: unknown,
): string {
  if (
    value === null
  ) {
    return "null";
  }

  if (
    value === undefined
  ) {
    return "undefined";
  }

  if (
    typeof value ===
      "string" ||
    typeof value ===
      "number" ||
    typeof value ===
      "boolean" ||
    typeof value ===
      "bigint"
  ) {
    return String(
      value,
    );
  }

  if (
    value instanceof Date
  ) {
    return value.toISOString();
  }

  try {
    return JSON.stringify(
      value,
      Object.keys(
        value as Record<
          string,
          unknown
        >,
      ).sort(),
    );
  } catch (error) {
    throw new DatabaseError(
      "Unable to serialize database cache key.",
      {
        cause: error,
      },
    );
  }
}

/**
 * Wraps a cache around an asynchronous loader.
 */
export async function getOrSet<
  TValue,
>(
  cache: DatabaseCache<TValue>,
  key: string,
  loader: () => Promise<TValue>,
  options?: CacheOptions,
): Promise<TValue> {
  validateKey(
    key,
  );

  if (
    typeof loader !==
    "function"
  ) {
    throw new TypeError(
      "A cache loader function is required.",
    );
  }

  const cached =
    cache.get(
      key,
    );

  if (
    cached !== undefined
  ) {
    return cached;
  }

  const value =
    await loader();

  cache.set(
    key,
    value,
    options,
  );

  return value;
}

/**
 * Invalidates all entries whose keys start with a prefix.
 *
 * This is useful when a write invalidates a group of related reads.
 */
export function invalidateByPrefix(
  cache: MemoryDatabaseCache,
  prefix: string,
): number {
  validateKey(
    prefix,
  );

  let removed = 0;

  for (
    const key of cache.keys()
  ) {
    if (
      key.startsWith(prefix)
    ) {
      if (
        cache.delete(key)
      ) {
        removed += 1;
      }
    }
  }

  return removed;
}

/**
 * Checks whether a cache entry has expired.
 */
function isExpired<TValue>(
  entry: CacheEntry<TValue>,
): boolean {
  return (
    entry.expiresAt !==
      undefined &&
    entry.expiresAt <=
      Date.now()
  );
}

/**
 * Normalizes a TTL value.
 */
function normalizeTtl(
  ttlMs?: number,
): number | undefined {
  if (
    ttlMs === undefined
  ) {
    return undefined;
  }

  if (
    !Number.isFinite(ttlMs)
  ) {
    throw new TypeError(
      "Cache TTL must be a finite number.",
    );
  }

  if (
    ttlMs < 0
  ) {
    throw new TypeError(
      "Cache TTL cannot be negative.",
    );
  }

  return Math.floor(
    ttlMs,
  );
}

/**
 * Validates a cache key.
 */
function validateKey(
  key: string,
): void {
  if (
    typeof key !==
      "string" ||
    key.trim().length ===
      0
  ) {
    throw new TypeError(
      "A non-empty cache key is required.",
    );
  }
}