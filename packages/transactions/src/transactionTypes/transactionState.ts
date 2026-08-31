/**
 * Transaction state machine, propagation strategies, and isolation levels.
 *
 * @module transactionTypes/transactionState
 */

/** Lifecycle states of a transaction. */
export type TransactionState =
  | "pending"
  | "active"
  | "committing"
  | "committed"
  | "rolling_back"
  | "rolled_back"
  | "failed";

/** Transaction propagation strategies for nested calls. */
export type TransactionPropagation =
  | "required"
  | "requires_new"
  | "supports"
  | "not_supported"
  | "mandatory"
  | "never"
  | "nested";

/** Database isolation levels. */
export type TransactionIsolationLevel =
  | "read_uncommitted"
  | "read_committed"
  | "repeatable_read"
  | "serializable";
