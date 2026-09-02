# @oyinlola141/lattice-transactions

Transaction lifecycle and coordination — state machine, `AsyncLocalStorage` context, savepoints, hooks, and an adapter abstraction that works across database, queue, and external services.

## When to use

Import this when you need:

- a single transaction context that spans multiple database calls
- savepoints for nested operations
- commit/rollback hooks (audit, event emission)
- a unified interface for database, queue, and external service transactions

## Installation

```bash
npm install @oyinlola141/lattice-transactions
```

## Public API

```typescript
import {
  createTransactionManager,
  runInTransaction,
  type Transaction,
  type TransactionManager,
  type TransactionState,
  type TransactionOptions,
  type TransactionAdapter,
  type Savepoint,
  type TransactionHook,
  type TransactionContext,
} from "@oyinlola141/lattice-transactions";
```

## Usage

```typescript
import {
  createTransactionManager,
  runInTransaction,
} from "@oyinlola141/lattice-transactions";

const txm = createTransactionManager({ adapter: pgAdapter });

await runInTransaction(txm, async (tx) => {
  await tx.query("INSERT INTO users ...");
  await tx.query("INSERT INTO audit ...");
});
```

## License

MIT
