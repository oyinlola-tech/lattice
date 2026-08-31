/**
 * Core type definitions for the Lattice cache package.
 *
 * The cache package is intentionally provider agnostic. Redis, Valkey,
 * in-memory stores, Memcached, database-backed caches, and custom adapters
 * can implement the same contracts.
 */

/* -------------------------------------------------------------------------- */
/* Cache Keys                                                                 */
/* -------------------------------------------------------------------------- */

export type CacheKey = string;

export type CacheNamespace = string;

/**
 * A fully qualified cache key.
 */
export interface CacheKeyParts {
  readonly namespace?: CacheNamespace;
  readonly key: CacheKey;
}

/**
 * Options used when generating a cache key.
 */
export interface CacheKeyOptions {
  readonly namespace?: CacheNamespace;
  readonly prefix?: string;
  readonly separator?: string;
}

/* -------------------------------------------------------------------------- */
/* Cache Values                                                               */
/* -------------------------------------------------------------------------- */

export type CacheValue =
  | string
  | number
  | boolean
  | null
  | Record<string, unknown>
  | readonly unknown[];

/**
 * Any value that can be stored by a cache adapter.
 *
 * Adapters may serialize objects differently, but the public cache contract
 * remains provider independent.
 */
export type SerializableCacheValue = CacheValue;

/* -------------------------------------------------------------------------- */
/* Expiration                                                                 */
/* -------------------------------------------------------------------------- */

export type CacheTTL = number;

/**
 * TTL configuration.
 *
 * A positive number represents milliseconds.
 * `undefined` means the adapter default.
 * `null` means no expiration when supported by the adapter.
 */
export type CacheExpiration =
  | CacheTTL
  | null
  | undefined;

/**
 * Expiration metadata returned by a cache adapter.
 */
export interface CacheExpirationInfo {
  readonly ttl: number | null;
  readonly expiresAt: Date | null;
}

/* -------------------------------------------------------------------------- */
/* Cache Operations                                                           */
/* -------------------------------------------------------------------------- */

export interface CacheSetOptions {
  readonly ttl?: CacheTTL;
  readonly namespace?: CacheNamespace;
  readonly tags?: readonly string[];
  readonly overwrite?: boolean;
  readonly metadata?: Readonly<
    Record<string, unknown>
  >;
}

export interface CacheGetOptions {
  readonly namespace?: CacheNamespace;
}

export interface CacheDeleteOptions {
  readonly namespace?: CacheNamespace;
}

export interface CacheHasOptions {
  readonly namespace?: CacheNamespace;
}

export interface CacheClearOptions {
  readonly namespace?: CacheNamespace;
  readonly pattern?: string;
}

export interface CacheKeysOptions {
  readonly namespace?: CacheNamespace;
  readonly pattern?: string;
  readonly limit?: number;
}

export interface CacheGetManyOptions {
  readonly namespace?: CacheNamespace;
}

export interface CacheSetManyOptions {
  readonly ttl?: CacheTTL;
  readonly namespace?: CacheNamespace;
  readonly overwrite?: boolean;
}

export interface CacheDeleteManyOptions {
  readonly namespace?: CacheNamespace;
}

/* -------------------------------------------------------------------------- */
/* Cache Entries                                                              */
/* -------------------------------------------------------------------------- */

export interface CacheEntry<
  TValue = unknown,
> {
  readonly key: CacheKey;
  readonly value: TValue;
  readonly createdAt?: Date;
  readonly expiresAt?: Date | null;
  readonly tags?: readonly string[];
  readonly metadata?: Readonly<
    Record<string, unknown>
  >;
}

export interface CacheEntryMetadata {
  readonly createdAt?: Date;
  readonly expiresAt?: Date | null;
  readonly tags?: readonly string[];
  readonly metadata?: Readonly<
    Record<string, unknown>
  >;
}

/* -------------------------------------------------------------------------- */
/* Cache Results                                                              */
/* -------------------------------------------------------------------------- */

export interface CacheGetResult<
  TValue = unknown,
> {
  readonly hit: boolean;
  readonly value: TValue | null;
  readonly entry?: CacheEntry<TValue>;
}

export interface CacheSetResult {
  readonly success: boolean;
  readonly key: CacheKey;
  readonly expiresAt: Date | null;
}

export interface CacheDeleteResult {
  readonly deleted: boolean;
  readonly key: CacheKey;
}

export interface CacheDeleteManyResult {
  readonly deleted: number;
  readonly keys: readonly CacheKey[];
}

export interface CacheClearResult {
  readonly cleared: number;
}

export interface CacheStats {
  readonly hits: number;
  readonly misses: number;
  readonly sets: number;
  readonly deletes: number;
  readonly errors: number;
  readonly size?: number;
  readonly hitRate: number;
}

/* -------------------------------------------------------------------------- */
/* Cache Adapter                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Low-level provider adapter.
 *
 * Implementations should translate these operations to the underlying
 * storage provider without leaking provider-specific types.
 */
export interface CacheAdapter {
  readonly name: string;

  connect?(): Promise<void>;

  disconnect?(): Promise<void>;

  get<TValue = unknown>(
    key: CacheKey,
    options?: CacheGetOptions,
  ): Promise<CacheGetResult<TValue>>;

  set<TValue = unknown>(
    key: CacheKey,
    value: TValue,
    options?: CacheSetOptions,
  ): Promise<CacheSetResult>;

  delete(
    key: CacheKey,
    options?: CacheDeleteOptions,
  ): Promise<CacheDeleteResult>;

  has(
    key: CacheKey,
    options?: CacheHasOptions,
  ): Promise<boolean>;

  clear(
    options?: CacheClearOptions,
  ): Promise<CacheClearResult>;

  keys?(
    options?: CacheKeysOptions,
  ): Promise<readonly CacheKey[]>;

  getMany?<TValue = unknown>(
    keys: readonly CacheKey[],
    options?: CacheGetManyOptions,
  ): Promise<
    ReadonlyMap<
      CacheKey,
      CacheGetResult<TValue>
    >
  >;

  setMany?<TValue = unknown>(
    entries: ReadonlyMap<
      CacheKey,
      TValue
    >,
    options?: CacheSetManyOptions,
  ): Promise<readonly CacheSetResult[]>;

  deleteMany?(
    keys: readonly CacheKey[],
    options?: CacheDeleteManyOptions,
  ): Promise<CacheDeleteManyResult>;

  ttl?(
    key: CacheKey,
    options?: CacheGetOptions,
  ): Promise<number | null>;

  expire?(
    key: CacheKey,
    ttl: CacheTTL,
    options?: CacheGetOptions,
  ): Promise<boolean>;
}

/* -------------------------------------------------------------------------- */
/* Cache Store                                                                */
/* -------------------------------------------------------------------------- */

/**
 * High-level cache store contract.
 */
export interface CacheStore
  extends CacheAdapter {}

/**
 * Factory for creating cache adapters.
 */
export type CacheAdapterFactory<
  TOptions = unknown,
> = (
  options: TOptions,
) => CacheAdapter | Promise<CacheAdapter>;

/* -------------------------------------------------------------------------- */
/* Cache Configuration                                                        */
/* -------------------------------------------------------------------------- */

export interface CacheConfig {
  readonly enabled?: boolean;
  readonly defaultTtl?: CacheTTL;
  readonly namespace?: CacheNamespace;
  readonly prefix?: string;
  readonly separator?: string;
  readonly adapter?: CacheAdapter;
  readonly failSilently?: boolean;
  readonly collectStats?: boolean;
}

/* -------------------------------------------------------------------------- */
/* Cache Events                                                               */
/* -------------------------------------------------------------------------- */

export type CacheEventType =
  | "cache.hit"
  | "cache.miss"
  | "cache.set"
  | "cache.delete"
  | "cache.clear"
  | "cache.error";

export interface BaseCacheEvent {
  readonly type: CacheEventType;
  readonly key?: CacheKey;
  readonly occurredAt: Date;
}

export interface CacheHitEvent
  extends BaseCacheEvent {
  readonly type: "cache.hit";
  readonly latencyMs?: number;
}

export interface CacheMissEvent
  extends BaseCacheEvent {
  readonly type: "cache.miss";
  readonly latencyMs?: number;
}

export interface CacheSetEvent
  extends BaseCacheEvent {
  readonly type: "cache.set";
  readonly ttl?: CacheTTL;
}

export interface CacheDeleteEvent
  extends BaseCacheEvent {
  readonly type: "cache.delete";
  readonly deleted: boolean;
}

export interface CacheClearEvent
  extends BaseCacheEvent {
  readonly type: "cache.clear";
  readonly cleared: number;
}

export interface CacheErrorEvent
  extends BaseCacheEvent {
  readonly type: "cache.error";
  readonly error: unknown;
}

export type CacheEvent =
  | CacheHitEvent
  | CacheMissEvent
  | CacheSetEvent
  | CacheDeleteEvent
  | CacheClearEvent
  | CacheErrorEvent;

/* -------------------------------------------------------------------------- */
/* Cache Event Handlers                                                       */
/* -------------------------------------------------------------------------- */

export type CacheEventHandler<
  TEvent extends CacheEvent = CacheEvent,
> = (
  event: TEvent,
) =>
  | void
  | Promise<void>;

export interface CacheEventSubscription {
  readonly unsubscribe: () => void;
}

/* -------------------------------------------------------------------------- */
/* Cache Tags                                                                 */
/* -------------------------------------------------------------------------- */

export type CacheTag = string;

export interface CacheTagOptions {
  readonly namespace?: CacheNamespace;
}

export interface CacheTagStore {
  add(
    key: CacheKey,
    tags: readonly CacheTag[],
    options?: CacheTagOptions,
  ): Promise<void>;

  remove(
    key: CacheKey,
    tags: readonly CacheTag[],
    options?: CacheTagOptions,
  ): Promise<void>;

  getKeys(
    tag: CacheTag,
    options?: CacheTagOptions,
  ): Promise<readonly CacheKey[]>;

  invalidate(
    tag: CacheTag,
    options?: CacheTagOptions,
  ): Promise<CacheClearResult>;
}

/* -------------------------------------------------------------------------- */
/* Cache Locking                                                              */
/* -------------------------------------------------------------------------- */

export interface CacheLockOptions {
  readonly ttl?: CacheTTL;
  readonly namespace?: CacheNamespace;
  readonly retry?: {
    readonly attempts: number;
    readonly delay: number;
  };
}

export interface CacheLock {
  readonly key: string;
  readonly token: string;
  readonly acquiredAt: Date;
  readonly expiresAt: Date | null;

  release(): Promise<boolean>;

  extend(
    ttl: CacheTTL,
  ): Promise<boolean>;
}

export interface CacheLockStore {
  acquire(
    key: string,
    options?: CacheLockOptions,
  ): Promise<CacheLock | null>;
}

/* -------------------------------------------------------------------------- */
/* Cache Health                                                               */
/* -------------------------------------------------------------------------- */

export interface CacheHealth {
  readonly healthy: boolean;
  readonly adapter: string;
  readonly latencyMs?: number;
  readonly checkedAt: Date;
  readonly error?: string;
}

export interface CacheHealthChecker {
  healthCheck(): Promise<CacheHealth>;
}

/* -------------------------------------------------------------------------- */
/* Cache Serialization                                                        */
/* -------------------------------------------------------------------------- */

export interface CacheSerializer<
  TValue = unknown,
  TSerialized = unknown,
> {
  serialize(
    value: TValue,
  ): TSerialized;

  deserialize(
    value: TSerialized,
  ): TValue;
}

/* -------------------------------------------------------------------------- */
/* Cache Key Builder                                                          */
/* -------------------------------------------------------------------------- */

export interface CacheKeyBuilder {
  build(
    key: string,
    options?: CacheKeyOptions,
  ): CacheKey;

  namespace(
    namespace: CacheNamespace,
  ): CacheKeyBuilder;
}

/* -------------------------------------------------------------------------- */
/* Cache Metrics                                                              */
/* -------------------------------------------------------------------------- */

export interface CacheMetrics {
  incrementHit(
    key?: CacheKey,
  ): void;

  incrementMiss(
    key?: CacheKey,
  ): void;

  incrementSet(
    key?: CacheKey,
  ): void;

  incrementDelete(
    key?: CacheKey,
  ): void;

  incrementError(
    key?: CacheKey,
  ): void;

  observeLatency(
    operation: CacheOperation,
    latencyMs: number,
  ): void;
}

import type { CacheOperation } from "@lattice/errors";
export type { CacheOperation } from "@lattice/errors";

/* -------------------------------------------------------------------------- */
/* Cache Middleware                                                           */
/* -------------------------------------------------------------------------- */

export interface CacheMiddlewareContext {
  readonly key: CacheKey;
  readonly operation: CacheOperation;
  readonly startedAt: Date;
  readonly metadata?: Readonly<
    Record<string, unknown>
  >;
}

export type CacheMiddleware = (
  context: CacheMiddlewareContext,
  next: () => Promise<unknown>,
) => Promise<unknown>;

/* -------------------------------------------------------------------------- */
/* Cache Serialization Helpers                                                */
/* -------------------------------------------------------------------------- */

export interface CacheSerializationOptions {
  readonly serializer?: CacheSerializer;
  readonly compress?: boolean;
  readonly encryption?: boolean;
}

/* -------------------------------------------------------------------------- */
/* Cache Errors                                                               */
/* -------------------------------------------------------------------------- */

export type CacheErrorCode =
  | "CACHE_DISABLED"
  | "CACHE_CONNECTION_FAILED"
  | "CACHE_TIMEOUT"
  | "CACHE_SERIALIZATION_FAILED"
  | "CACHE_DESERIALIZATION_FAILED"
  | "CACHE_OPERATION_FAILED"
  | "CACHE_INVALID_KEY"
  | "CACHE_INVALID_TTL"
  | "CACHE_ADAPTER_NOT_CONFIGURED"
  | "CACHE_NOT_SUPPORTED";

export interface CacheErrorOptions {
  readonly cause?: unknown;
  readonly details?: Readonly<
    Record<string, unknown>
  >;
  readonly operation?: CacheOperation;
  readonly key?: CacheKey;
}

/* -------------------------------------------------------------------------- */
/* Cache Function Results                                                     */
/* -------------------------------------------------------------------------- */

export interface CacheOrComputeOptions
  extends CacheSetOptions {
  readonly forceRefresh?: boolean;
}

export interface CacheOrComputeResult<
  TValue,
> {
  readonly value: TValue;
  readonly cached: boolean;
}

/* -------------------------------------------------------------------------- */
/* Cache Batch Operations                                                     */
/* -------------------------------------------------------------------------- */

export interface CacheBatchOperation {
  readonly type:
    | "get"
    | "set"
    | "delete";

  readonly key: CacheKey;

  readonly value?: unknown;

  readonly options?:
    | CacheGetOptions
    | CacheSetOptions
    | CacheDeleteOptions;
}

export interface CacheBatchResult {
  readonly operation: CacheBatchOperation;
  readonly success: boolean;
  readonly result?: unknown;
  readonly error?: unknown;
}

/* -------------------------------------------------------------------------- */
/* Utility Types                                                              */
/* -------------------------------------------------------------------------- */

import type { MaybePromise as BaseMaybePromise } from "@lattice/types";

export type { BaseMaybePromise as MaybePromise };

export type CacheResult<
  TValue,
> =
  | {
      readonly success: true;
      readonly value: TValue;
    }
  | {
      readonly success: false;
      readonly error: unknown;
    };
