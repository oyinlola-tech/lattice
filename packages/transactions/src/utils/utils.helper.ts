/**
 * Utility helpers for the transactions package.
 *
 * @module utils/utils
 */

import type { Transaction } from "../transactionTypes/transaction.interface.js";
import type { TransactionState } from "../transactionTypes/transactionState.js";

/**
 * Check if a transaction is in a terminal state (committed, rolled_back, or failed).
 */
export function isTerminalState(state: TransactionState): boolean {
  return state === "committed" || state === "rolled_back" || state === "failed";
}

/**
 * Check if a transaction can still be modified (active or pending).
 */
export function isModifiable(transaction: Transaction): boolean {
  return transaction.state === "active" || transaction.state === "pending";
}

/**
 * Get a human-readable summary of a transaction.
 */
export function summarizeTransaction(transaction: Transaction): string {
  const duration = Date.now() - transaction.startedAt;
  return [
    `Transaction ${transaction.id}`,
    `state=${transaction.state}`,
    `duration=${duration}ms`,
    transaction.parentId ? `parent=${transaction.parentId}` : "",
    transaction.isRollbackOnly() ? "rollback-only" : "",
  ].filter(Boolean).join(", ");
}
