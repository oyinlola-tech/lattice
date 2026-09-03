# @zudo/transactions

Transaction lifecycle and coordination with state machine, AsyncLocalStorage context propagation, savepoints, hooks, and adapter abstraction.

## Installation

```bash
npm install @zudo/transactions
```

## Quick Start

```typescript
import { createTransactionManager } from "@zudo/transactions";

const manager = createTransactionManager({
  adapter: databaseAdapter,
});

await manager.run(async (tx) => {
  await tx.execute("INSERT INTO users ...");
  await tx.execute("INSERT INTO profiles ...");
});
```

## Features

- Transaction state machine
- AsyncLocalStorage context propagation
- Savepoints for nested transactions
- Before/after hooks
- Adapter abstraction for multiple databases
- Automatic rollback on errors

## Use Cases

- Database transaction management
- Distributed transaction coordination
- Unit of Work pattern
- Audit logging with transaction context
