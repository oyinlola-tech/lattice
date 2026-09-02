# @oyinlola141/lattice-database

Database infrastructure — clients, repositories, transactions, query builders, and connection pools. Adapter-based so you can swap drivers.

## When to use

Import this when you need:

- a unified client interface across Postgres, MySQL, SQLite
- repositories that own their queries
- transaction context propagation via `AsyncLocalStorage`
- typed query results
- migrations (via the migrations subfolder)

For higher-level business transactions that span multiple adapters, use `@oyinlola141/lattice-transactions`.

## Installation

```bash
npm install @oyinlola141/lattice-database
```

## Public API

```typescript
import {
  createDatabase,
  Database,
  BaseRepository,
  createRepository,
  type DatabaseClient,
  type DatabaseConfig,
  type QueryResult,
  type Transaction,
  type Migration,
  noopDatabaseLogger,
} from "@oyinlola141/lattice-database";
```

## Usage

```typescript
import {
  createDatabase,
  createRepository,
} from "@oyinlola141/lattice-database";

const db = createDatabase({ driver: "pg", url: process.env.DB_URL });
await db.connect();

class UserRepo extends createRepository<User>(db, "users") {
  findByEmail(email: string) {
    return this.findOne({ where: { email } });
  }
}
```

## License

MIT
