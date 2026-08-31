import type { CacheNamespace } from "./types-keys.js";
import type { CacheTTL } from "./types-values.js";

export interface CacheSetOptions {
  readonly ttl?: CacheTTL;
  readonly namespace?: CacheNamespace;
  readonly tags?: readonly string[];
  readonly overwrite?: boolean;
  readonly metadata?: Readonly<Record<string, unknown>>;
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
