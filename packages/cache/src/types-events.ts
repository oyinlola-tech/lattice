import type { CacheKey } from "./types-keys.js";
import type { CacheTTL } from "./types-values.js";

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

export interface CacheHitEvent extends BaseCacheEvent {
  readonly type: "cache.hit";
  readonly latencyMs?: number;
}

export interface CacheMissEvent extends BaseCacheEvent {
  readonly type: "cache.miss";
  readonly latencyMs?: number;
}

export interface CacheSetEvent extends BaseCacheEvent {
  readonly type: "cache.set";
  readonly ttl?: CacheTTL;
}

export interface CacheDeleteEvent extends BaseCacheEvent {
  readonly type: "cache.delete";
  readonly deleted: boolean;
}

export interface CacheClearEvent extends BaseCacheEvent {
  readonly type: "cache.clear";
  readonly cleared: number;
}

export interface CacheErrorEvent extends BaseCacheEvent {
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

export type CacheEventHandler<TEvent extends CacheEvent = CacheEvent> = (
  event: TEvent,
) => void | Promise<void>;

export interface CacheEventSubscription {
  readonly unsubscribe: () => void;
}
