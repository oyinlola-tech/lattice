# @oyinlola141/lattice-cache

Caching primitives, adapters, tag-based invalidation, locking, and metrics. In-memory adapter included; build your own for Redis, Memcached, etc.

## When to use

Import this when you need:

- a typed cache with TTL
- tag-based invalidation (`invalidateTag("users")`)
- single-flight (one in-flight request per key)
- lock manager for critical sections
- hit/miss metrics

## Installation

```bash
npm install @oyinlola141/lattice-cache
```

## Public API

```typescript
import {
  createCacheService,
  CacheService,
  createMemoryCacheAdapter,
  MemoryCacheAdapter,
  createCacheStore,
  DefaultCacheStore,
  createTagStore,
  InMemoryTagStore,
  createCacheMetrics,
  InMemoryCacheMetrics,
  createCacheKeyBuilder,
  type CacheAdapter,
  type CacheKey,
  type CacheEntry,
  type CacheOptions,
  type CacheStats,
  type TagSet,
} from "@oyinlola141/lattice-cache";
```

## Usage

```typescript
import {
  createCacheService,
  createMemoryCacheAdapter,
} from "@oyinlola141/lattice-cache";

const cache = createCacheService({
  adapter: createMemoryCacheAdapter(),
  defaultTtl: 60_000,
});

await cache.set("user:1", { id: 1 }, { tags: ["users"] });
const user = await cache.get<User>("user:1");
await cache.invalidateTag("users");
```

## License

MIT
