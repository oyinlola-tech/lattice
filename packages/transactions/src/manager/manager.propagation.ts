/**
 * Transaction propagation strategies.
 *
 * @module manager/manager.propagation
 */

import type { Transaction } from "../transactionTypes/transaction.interface.js";
import type { TransactionOptions } from "../transactionTypes/transaction.interface.js";
import type { TransactionAdapter } from "../transactionTypes/transactionAdapter.js";
import type { TransactionContext } from "../transactionTypes/transactionAdapter.js";
import type { TransactionHooks } from "../transactionTypes/transactionHooks.js";
import { createTransaction } from "../transaction/transaction.core.js";
import { TransactionPropagationError } from "../transactionErrors/transactionError.types.js";

/**
 * Handle transaction propagation when a transaction already exists.
 */
export async function handlePropagation(
  current: Transaction,
  propagation: string,
  opts: TransactionOptions | undefined,
  adapter: TransactionAdapter,
  context: TransactionContext,
  hooks?: TransactionHooks,
): Promise<Transaction> {
  switch (propagation) {
    case "required":
      return current;

    case "requires_new": {
      const newTxn = createTransaction(opts);
      if (hooks?.beforeBegin) await hooks.beforeBegin({ transaction: newTxn });
      const handle = await adapter.begin(opts);
      (newTxn as unknown as { _setHandle: (h: unknown) => void })._setHandle(handle);
      if (hooks?.afterBegin) await hooks.afterBegin({ transaction: newTxn });
      return newTxn;
    }

    case "supports":
      return current;

    case "not_supported":
      return current;

    case "mandatory":
      return current;

    case "never":
      throw new TransactionPropagationError("Transaction exists but propagation is 'never'");

    case "nested":
      return createNestedTransaction(current, opts, adapter);

    default:
      throw new TransactionPropagationError(`Unknown propagation: ${propagation}`);
  }
}

/**
 * Create a nested transaction using savepoints.
 */
async function createNestedTransaction(
  parent: Transaction,
  opts: TransactionOptions | undefined,
  adapter: TransactionAdapter,
): Promise<Transaction> {
  if (!adapter.capabilities.savepoints || !adapter.createSavepoint) {
    throw new TransactionPropagationError("Nested transactions require savepoint support");
  }

  const child = createTransaction(opts, parent.id);
  const savepointName = `sp_${child.id}`;

  const handle = (parent as unknown as { _getHandle: () => unknown })._getHandle();
  await adapter.createSavepoint(handle, savepointName);
  (child as unknown as { _setHandle: (h: unknown) => void })._setHandle({ parent: handle, savepoint: savepointName });

  return child;
}
