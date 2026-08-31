/**
 * Transaction commit and rollback orchestration.
 *
 * @module manager/manager.commit
 */

import type { Transaction } from "../transactionTypes/transaction.interface.js";
import type { TransactionAdapter } from "../transactionTypes/transactionAdapter.js";
import type { TransactionHooks } from "../transactionTypes/transactionHooks.js";
import { TransactionCommitError, TransactionRollbackError } from "../transactionErrors/transactionError.types.js";

/**
 * Commit a transaction with hooks and adapter coordination.
 */
export async function commitTransaction(
  transaction: Transaction,
  adapter: TransactionAdapter,
  hooks?: TransactionHooks,
): Promise<void> {
  if (transaction.state !== "active") return;

  if (hooks?.beforeCommit) {
    await hooks.beforeCommit({ transaction });
  }

  const handle = (transaction as unknown as { _getHandle: () => unknown })._getHandle();
  try {
    await adapter.commit(handle);
    await transaction.commit();
  } catch (error) {
    if ((transaction.state as string) === "committing") {
      (transaction as unknown as { _transition: (s: string) => void })._transition("failed");
    }
    if (hooks?.onError) {
      await hooks.onError({ transaction, error });
    }
    throw new TransactionCommitError(transaction.id, error);
  }

  if (hooks?.afterCommit) {
    await hooks.afterCommit({ transaction });
  }
}

/**
 * Rollback a transaction with hooks and adapter coordination.
 */
export async function rollbackTransaction(
  transaction: Transaction,
  adapter: TransactionAdapter,
  reason?: unknown,
  hooks?: TransactionHooks,
): Promise<void> {
  if (transaction.state === "committed" || transaction.state === "rolled_back" || transaction.state === "failed") {
    return;
  }

  if (hooks?.beforeRollback) {
    await hooks.beforeRollback({ transaction });
  }

  const handle = (transaction as unknown as { _getHandle: () => unknown })._getHandle();
  try {
    if (handle !== undefined) {
      await adapter.rollback(handle, reason);
    }
    await transaction.rollback(reason);
  } catch (error) {
    if (hooks?.onError) {
      await hooks.onError({ transaction, error });
    }
    throw new TransactionRollbackError(transaction.id, {
      cause: error,
      originalError: reason,
    });
  }

  if (hooks?.afterRollback) {
    await hooks.afterRollback({ transaction });
  }
}
