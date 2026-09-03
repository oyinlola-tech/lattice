# @zudolib/cache

Cache abstraction with memory adapter, tags, locking, and metrics for Zudolib applications.

## Installation

```bash
npm install @zudolib/cache
```

## Quick Start

```typescript
import { createMemoryCache } from "@zudolib/cache";

const cache = createMemoryCache({
  ttl: 60000,
  maxSize: 1000,
});

const user = await cache.get("user:123");
if (!user) {
  user = await fetchUserFromDb("123");
  await cache.set("user:123", user);
}
```

## Features

- Pluggable cache adapters (memory, Redis, etc.)
- TTL and size-based eviction
- Cache tags for bulk invalidation
- Distributed locking
- Cache metrics and hit ratios

## Use Cases

- API response caching
- Database query caching
- Session storage
- Rate limit counters
