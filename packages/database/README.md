# @zudo/database

Database abstraction layer with clients, repositories, transactions, and query building for Lattice applications.

## Installation

```bash
npm install @zudo/database
```

## Quick Start

```typescript
import { createDatabaseClient } from "@zudo/database";

const client = await createDatabaseClient({
  connection: { url: "postgresql://localhost/mydb" },
});

const users = await client.repository("User").findMany();
```

## Features

- Database-agnostic query builder
- Repository pattern with CRUD operations
- Transaction management with savepoints
- Connection pooling and health checks
- Migration runner
- Seed runner for test data
- Unit of Work pattern

## Use Cases

- Data access layer for applications
- Multi-database support (PostgreSQL, MySQL, SQLite)
- Transaction coordination across repositories
- Database migrations and seeding
