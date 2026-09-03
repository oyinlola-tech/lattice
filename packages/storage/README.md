# @oyinlola141/lattice-storage

Storage abstractions including database, object storage, repository, serialization, locking, and lifecycle.

## Installation

```bash
npm install @oyinlola141/lattice-storage
```

## Quick Start

```typescript
import { createStorage } from "@oyinlola141/lattice-storage";

const storage = createStorage({
  database: { url: process.env.DATABASE_URL },
  cache: { driver: "memory" },
});

const user = await storage.db.user.findUnique({ where: { id } });
```

## Features

- Unified storage abstraction
- Database client management
- Object storage (S3, local filesystem)
- Repository pattern
- Serialization support
- Distributed locking

## Use Cases

- Unified data access layer
- File and object storage
- Cache integration
- Locking for distributed systems
