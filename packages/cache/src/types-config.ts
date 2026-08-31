import type { CacheNamespace } from "./types-keys.js";
import type { CacheTTL } from "./types-values.js";
import type { CacheOperation } from "./types-metrics.js";

export interface CacheConfig {
  readonly enabled?: boolean;
  readonly defaultTtl?: CacheTTL;
  readonly namespace?: CacheNamespace;
  readonly prefix?: string;
  readonly separator?: string;
  readonly failSilently?: boolean;
  readonly collectStats?: boolean;
}

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
  readonly details?: Readonly<Record<string, unknown>>;
  readonly operation?: CacheOperation;
  readonly key?: CacheKey;
}

import type { CacheKey } from "./types-keys.js";
