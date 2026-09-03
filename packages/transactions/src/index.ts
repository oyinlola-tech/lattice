/**
 * @zudolib/transactions
 *
 * Generic transaction abstraction for the Zudo framework.
 *
 * Provides transaction lifecycle management, async context propagation,
 * adapter contracts, savepoints, hooks, and rollback-only semantics.
 *
 * @module @zudolib/transactions
 */

export * from "./transactionTypes/index.js";
export * from "./transactionErrors/index.js";
export * from "./transaction/index.js";
export * from "./context/index.js";
export * from "./adapter/index.js";
export * from "./hooks/index.js";
export * from "./registry/index.js";
export * from "./utils/index.js";

export {
  createTransactionManager,
  type TransactionManagerOptions,
} from "./manager/index.js";
