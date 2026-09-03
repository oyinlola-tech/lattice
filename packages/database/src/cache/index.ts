/**
 * @zudo/database — Database Cache
 *
 * In-memory cache for database read results.
 */

export {
  MemoryDatabaseCache,
  createDatabaseCache,
  createCacheKey,
  serializeCachePart,
  getOrSet,
  invalidateByPrefix,
  type CacheEntry,
  type CacheOptions,
  type CacheStats,
  type DatabaseCache,
} from "./cache.memory.js";
