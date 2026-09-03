/**
 * @zudoliblib/cache — Error Types
 *
 * All cache error types are defined in @zudoliblib/errors and re-exported here
 * for convenience. No local error classes are created in this package.
 */

export {
  CacheError,
  isCacheError,
  cacheConnectionError,
  cacheTimeoutError,
  cacheSerializationError,
  cacheDeserializationError,
  cacheInvalidKeyError,
  cacheAdapterNotConfiguredError,
  CacheOperation,
} from "@zudoliblib/errors";

export type { CacheErrorOptions } from "@zudoliblib/errors";
