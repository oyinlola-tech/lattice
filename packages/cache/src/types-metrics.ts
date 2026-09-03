import type { CacheKey } from "./types-keys.js";

import type { CacheOperation } from "@zudo/errors";
export type { CacheOperation } from "@zudo/errors";

export interface CacheMetrics {
  incrementHit(key?: CacheKey): void;
  incrementMiss(key?: CacheKey): void;
  incrementSet(key?: CacheKey): void;
  incrementDelete(key?: CacheKey): void;
  incrementError(key?: CacheKey): void;
  observeLatency(operation: CacheOperation, latencyMs: number): void;
}

export interface CacheMiddlewareContext {
  readonly key: CacheKey;
  readonly operation: CacheOperation;
  readonly startedAt: Date;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export type CacheMiddleware = (
  context: CacheMiddlewareContext,
  next: () => Promise<unknown>,
) => Promise<unknown>;
