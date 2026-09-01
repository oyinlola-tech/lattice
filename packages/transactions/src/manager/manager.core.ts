/**
 * Transaction manager — coordinates begin, commit, rollback, and context.
 *
 * @module manager/manager
 */

import type {
  Transaction,
  TransactionOptions,
} from "../transactionTypes/transaction.interface.js";
import type { TransactionAdapter } from "../transactionTypes/transactionAdapter.js";
import type { TransactionContext } from "../transactionTypes/transactionAdapter.js";
import type { TransactionHooks } from "../transactionTypes/transactionHooks.js";
import { createTransaction } from "../transaction/transaction.core.js";
import {
  TransactionAdapterError,
  TransactionRollbackError,
} from "../transactionErrors/transactionError.types.js";
import { handlePropagation } from "./manager.propagation.js";
import { commitTransaction, rollbackTransaction } from "./manager.commit.js";

/** Options for creating a transaction manager. */
export interface TransactionManagerOptions {
  readonly adapter: TransactionAdapter;
  readonly context?: TransactionContext;
  readonly hooks?: TransactionHooks;
}

/**
 * Create a transaction manager.
 */
export function createTransactionManager(options: TransactionManagerOptions) {
  const { adapter, hooks } = options;

  const resolveContext = (): TransactionContext => {
    if (options.context) return options.context;
    const mod =
      require("../context/context.core.js") as typeof import("../context/context.core.js");
    return mod.getDefaultContext();
  };

  return {
    async begin(opts?: TransactionOptions): Promise<Transaction> {
      const context = resolveContext();
      const current = context.get();

      if (current) {
        return handlePropagation(
          current,
          opts?.propagation ?? "required",
          opts,
          adapter,
          context,
          hooks,
        );
      }

      const transaction = createTransaction(opts);

      if (hooks?.beforeBegin) await hooks.beforeBegin({ transaction });

      try {
        const handle = await adapter.begin(opts);
        (
          transaction as unknown as { _setHandle: (h: unknown) => void }
        )._setHandle(handle);
      } catch (error) {
        (
          transaction as unknown as { _transition: (s: string) => void }
        )._transition("failed");
        throw new TransactionAdapterError("Failed to begin transaction", error);
      }

      if (hooks?.afterBegin) await hooks.afterBegin({ transaction });

      if (opts?.timeout && opts.timeout > 0) {
        const timer = setTimeout(() => {
          (
            transaction as unknown as { _markTimedOut: () => void }
          )._markTimedOut();
          transaction.markRollbackOnly("timeout");
        }, opts.timeout);
        const clearTimer = () => clearTimeout(timer);
        transaction.afterCommit(async () => clearTimer());
        transaction.afterRollback(async () => clearTimer());
      }

      return transaction;
    },

    async run<T>(
      callback: (transaction: Transaction) => Promise<T>,
      opts?: TransactionOptions,
    ): Promise<T> {
      const context = resolveContext();
      const transaction = await this.begin(opts);

      return context.run(transaction, async () => {
        try {
          const result = await callback(transaction);
          if (transaction.state === "active") {
            await this.commit(transaction);
          }
          return result;
        } catch (error) {
          if (
            transaction.state === "active" ||
            (transaction.state as string) === "committing"
          ) {
            try {
              await this.rollback(transaction, error);
            } catch (rollbackError) {
              throw new TransactionRollbackError(transaction.id, {
                cause: rollbackError,
                originalError: error,
              });
            }
          }
          throw error;
        }
      });
    },

    async commit(transaction: Transaction): Promise<void> {
      return commitTransaction(transaction, adapter, hooks);
    },

    async rollback(transaction: Transaction, reason?: unknown): Promise<void> {
      return rollbackTransaction(transaction, adapter, reason, hooks);
    },

    getCurrent(): Transaction | undefined {
      return resolveContext().get();
    },
  };
}
