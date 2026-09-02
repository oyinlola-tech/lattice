# @oyinlola141/lattice-storage

Storage abstractions — connection pools, base repositories, object storage, JSON serializer, distributed locking, lifecycle manager, and health checks.

## When to use

Import this when you need:

- a base repository with CRUD out of the box
- a connection pool with health checks
- an object storage interface (local FS included)
- distributed locks for critical sections
- lifecycle management for storage components

## Installation

```bash
npm install @oyinlola141/lattice-storage
```

## Public API

```typescript
import {
  ConnectionPool,
  BaseRepository,
  LocalObjectStorage,
  JsonSerializer,
  InMemoryLockManager,
  StorageLifecycleManager,
  HealthChecker,
  type BaseRepositoryOptions,
  type StorageHealthReport,
  type ComponentHealth,
} from "@oyinlola141/lattice-storage";
```

## Usage

```typescript
import {
  BaseRepository,
  LocalObjectStorage,
  InMemoryLockManager,
} from "@oyinlola141/lattice-storage";

class UserRepo extends BaseRepository<User> {
  constructor() {
    super("users");
  }
}

const bucket = new LocalObjectStorage({ root: "/var/data" });
await bucket.put("uploads/x.png", buffer);
```

## License

MIT
