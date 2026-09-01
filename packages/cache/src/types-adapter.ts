import type { CacheKey, CacheNamespace } from "./types-keys.js";
import type { CacheTTL } from "./types-values.js";
import type {
  CacheClearOptions,
  CacheDeleteManyOptions,
  CacheDeleteOptions,
  CacheGetManyOptions,
  CacheGetOptions,
  CacheHasOptions,
  CacheKeysOptions,
  CacheSetManyOptions,
  CacheSetOptions,
} from "./types-operations.js";
import type {
  CacheClearResult,
  CacheDeleteManyResult,
  CacheDeleteResult,
  CacheGetResult,
  CacheSetResult,
} from "./types-results.js";

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
  has(key: CacheKey, options?: CacheHasOptions): Promise<boolean>;
  clear(options?: CacheClearOptions): Promise<CacheClearResult>;
  keys?(options?: CacheKeysOptions): Promise<readonly CacheKey[]>;
  getMany?<TValue = unknown>(
    keys: readonly CacheKey[],
    options?: CacheGetManyOptions,
  ): Promise<ReadonlyMap<CacheKey, CacheGetResult<TValue>>>;
  setMany?<TValue = unknown>(
    entries: ReadonlyMap<CacheKey, TValue>,
    options?: CacheSetManyOptions,
  ): Promise<readonly CacheSetResult[]>;
  deleteMany?(
    keys: readonly CacheKey[],
    options?: CacheDeleteManyOptions,
  ): Promise<CacheDeleteManyResult>;
  ttl?(key: CacheKey, options?: CacheGetOptions): Promise<number | null>;
  expire?(
    key: CacheKey,
    ttl: CacheTTL,
    options?: CacheGetOptions,
  ): Promise<boolean>;
}

export interface CacheStore extends CacheAdapter {}

export type CacheAdapterFactory<TOptions = unknown> = (
  options: TOptions,
) => CacheAdapter | Promise<CacheAdapter>;
