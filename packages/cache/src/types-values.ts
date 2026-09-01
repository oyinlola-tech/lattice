import type { CacheKey, CacheNamespace } from "./types-keys.js";

export type CacheValue =
  | string
  | number
  | boolean
  | null
  | Record<string, unknown>
  | readonly unknown[];
export type SerializableCacheValue = CacheValue;
export type CacheTTL = number;
export type CacheExpiration = CacheTTL | null | undefined;

export interface CacheExpirationInfo {
  readonly ttl: number | null;
  readonly expiresAt: Date | null;
}

export interface CacheEntry<TValue = unknown> {
  readonly key: CacheKey;
  readonly value: TValue;
  readonly createdAt?: Date;
  readonly expiresAt?: Date | null;
  readonly tags?: readonly string[];
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export interface CacheEntryMetadata {
  readonly createdAt?: Date;
  readonly expiresAt?: Date | null;
  readonly tags?: readonly string[];
  readonly metadata?: Readonly<Record<string, unknown>>;
}
