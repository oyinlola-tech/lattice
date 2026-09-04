/**
 * @zudojs/database — Transactions
 *
 * Managed transaction execution with retry support.
 */

export {
  TransactionManager,
  createTransactionManager,
  withTransaction,
  withTransactionRetry,
  createTransactionContext,
  createTransactionId,
  isTransactionActive,
  isTransactionCommitted,
  isTransactionFailed,
  type TransactionStatus,
  type TransactionContext,
  type ManagedTransactionOptions,
} from "./transaction.core.js";
