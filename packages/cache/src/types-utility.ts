import type { CacheKey } from "./types-keys.js";
import type { MaybePromise as BaseMaybePromise } from "@zudojs/types";
import type {
  CacheDeleteOptions,
  CacheGetOptions,
  CacheSetOptions,
} from "./types-operations.js";

export type { BaseMaybePromise as MaybePromise };

export interface CacheOrComputeOptions extends CacheSetOptions {
  readonly forceRefresh?: boolean;
}

export interface CacheOrComputeResult<TValue> {
  readonly value: TValue;
  readonly cached: boolean;
}

export interface CacheBatchOperation {
  readonly type: "get" | "set" | "delete";
  readonly key: CacheKey;
  readonly value?: unknown;
  readonly options?: CacheGetOptions | CacheSetOptions | CacheDeleteOptions;
}

export interface CacheBatchResult {
  readonly operation: CacheBatchOperation;
  readonly success: boolean;
  readonly result?: unknown;
  readonly error?: unknown;
}

export type CacheResult<TValue> =
  | { readonly success: true; readonly value: TValue }
  | { readonly success: false; readonly error: unknown };
