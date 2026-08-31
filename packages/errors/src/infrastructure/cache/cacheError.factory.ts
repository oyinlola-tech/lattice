/**
 * Cache error factory functions.
 */

import { ErrorCode } from "../../base/types/errorCode.type.js";
import { CacheError, CacheOperation, type CacheErrorOptions } from "./cacheError.base.js";

/** Creates a cache connection error. */
export function cacheConnectionError(
  message = "Failed to connect to cache.",
  options: Omit<CacheErrorOptions, "operation"> = {},
): CacheError {
  return new CacheError(message, {
    ...options,
    code: ErrorCode.CONNECTION_FAILED,
    operation: CacheOperation.UNKNOWN,
  });
}

/** Creates a cache timeout error. */
export function cacheTimeoutError(
  message = "Cache operation timed out.",
  options: Omit<CacheErrorOptions, "operation"> = {},
): CacheError {
  return new CacheError(message, {
    ...options,
    code: ErrorCode.TIMEOUT,
    operation: CacheOperation.UNKNOWN,
  });
}

/** Creates a cache serialization error. */
export function cacheSerializationError(
  message = "Failed to serialize cache value.",
  options: Omit<CacheErrorOptions, "operation"> = {},
): CacheError {
  return new CacheError(message, {
    ...options,
    code: ErrorCode.OPERATION_FAILED,
    operation: CacheOperation.SET,
  });
}

/** Creates a cache deserialization error. */
export function cacheDeserializationError(
  message = "Failed to deserialize cache value.",
  options: Omit<CacheErrorOptions, "operation"> = {},
): CacheError {
  return new CacheError(message, {
    ...options,
    code: ErrorCode.OPERATION_FAILED,
    operation: CacheOperation.GET,
  });
}

/** Creates a cache invalid key error. */
export function cacheInvalidKeyError(key: string, message?: string): CacheError {
  return new CacheError(message ?? `Invalid cache key: "${key}".`, {
    code: ErrorCode.INVALID_INPUT,
    operation: CacheOperation.UNKNOWN,
    key,
    statusCode: 400,
    expose: true,
  });
}

/** Creates a cache adapter not configured error. */
export function cacheAdapterNotConfiguredError(adapter?: string): CacheError {
  return new CacheError(
    adapter ? `Cache adapter "${adapter}" is not configured.` : "No cache adapter is configured.",
    {
      code: ErrorCode.CONFIGURATION_MISSING,
      operation: CacheOperation.UNKNOWN,
      adapter,
      statusCode: 500,
      expose: false,
    },
  );
}
