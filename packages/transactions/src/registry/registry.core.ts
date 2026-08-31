/**
 * Transaction registry — tracks active transactions.
 *
 * @module registry/registry
 */

import type { Transaction } from "../transactionTypes/transaction.interface.js";
import type { TransactionRegistry } from "../transactionTypes/transactionHooks.js";

/**
 * Create an in-memory transaction registry.
 */
export function createTransactionRegistry(): TransactionRegistry {
  const active = new Map<string, Transaction>();

  return {
    register(transaction: Transaction): void {
      active.set(transaction.id, transaction);
    },

    unregister(transactionId: string): void {
      active.delete(transactionId);
    },

    get(transactionId: string): Transaction | undefined {
      return active.get(transactionId);
    },

    getActive(): readonly Transaction[] {
      return Array.from(active.values());
    },
  };
}
