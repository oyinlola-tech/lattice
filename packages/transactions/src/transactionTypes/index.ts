/**
 * Core transaction type definitions.
 *
 * @module transactionTypes
 */

export {
  type TransactionState,
  type TransactionPropagation,
  type TransactionIsolationLevel,
} from "./transactionState.js";

export {
  type Transaction,
  type TransactionOptions,
  type TransactionRetryOptions,
} from "./transaction.interface.js";

export {
  type TransactionHandle,
  type TransactionAdapterCapabilities,
  type TransactionAdapter,
  type Savepoint,
  type TransactionContext,
} from "./transactionAdapter.js";

export {
  type TransactionHookContext,
  type TransactionErrorContext,
  type TransactionHooks,
  type TransactionRegistry,
  type TransactionResult,
  TRANSACTION_EVENTS,
  type TransactionEvent,
  type TransactionEventHandler,
} from "./transactionHooks.js";
