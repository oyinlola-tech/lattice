/**
 * @lattice/cache — Error Types
 *
 * All cache error types are defined in @lattice/errors and re-exported here
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
} from "@lattice/errors";

export type { CacheErrorOptions } from "@lattice/errors";
