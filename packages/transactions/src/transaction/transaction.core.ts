/**
 * Core Transaction implementation with state machine enforcement.
 */

import { randomBytes } from "node:crypto";
import type {
  Transaction,
  TransactionOptions,
} from "../transactionTypes/transaction.interface.js";
import type { TransactionState } from "../transactionTypes/transactionState.js";
import {
  TransactionStateError,
  TransactionCommitError,
  TransactionRollbackError,
} from "../transactionErrors/transactionError.types.js";
import { createTransitionFunction } from "./transactionStateMachine.js";

/**
 * Generate a unique transaction ID.
 */
function generateTransactionId(): string {
  return `txn_${randomBytes(16).toString("hex")}`;
}

/**
 * Create a new Transaction instance.
 */
export function createTransaction(
  options: TransactionOptions = {},
  parentId?: string,
): Transaction {
  let state: TransactionState = "pending";
  let rollbackOnly = false;
  let rollbackOnlyReason: unknown;
  let timedOut = false;
  const afterCommitCallbacks: Array<() => Promise<void>> = [];
  const afterRollbackCallbacks: Array<() => Promise<void>> = [];
  let handle: unknown;

  const setHandle = (h: unknown): void => { handle = h; };
  const getHandle = (): unknown => handle;
  const transition = createTransitionFunction(
    () => state,
    (s) => { state = s; },
  );

  const metadata = new Map<string, unknown>(
    options.metadata ? Object.entries(options.metadata) : [],
  );

  const id = generateTransactionId();
  const startedAt = Date.now();

  const txn: Transaction = {
    get id(): string { return id; },
    get parentId(): string | undefined { return parentId; },
    get state(): TransactionState { return state; },
    get options(): Readonly<TransactionOptions> { return Object.freeze({ ...options }); },
    get startedAt(): number { return startedAt; },
    get metadata(): ReadonlyMap<string, unknown> { return metadata; },
    get timedOut(): boolean { return timedOut; },

    async commit(): Promise<void> {
      if (state !== "active") {
        throw new TransactionStateError(state, "commit");
      }
      if (rollbackOnly) {
        await txn.rollback(rollbackOnlyReason ?? "marked rollback-only");
        return;
      }
      transition("committing");
      try {
        transition("committed");
        for (const cb of afterCommitCallbacks) {
          try { await cb(); } catch { /* swallow */ }
        }
        afterCommitCallbacks.length = 0;
        afterRollbackCallbacks.length = 0;
      } catch (error) {
        transition("failed");
        throw new TransactionCommitError(id, error);
      }
    },

    async rollback(reason?: unknown): Promise<void> {
      if (state === "committed" || state === "rolled_back" || state === "failed") {
        return;
      }
      if (state !== "active" && state !== "committing" && state !== "pending") {
        throw new TransactionStateError(state, "rollback");
      }
      transition("rolling_back");
      try {
        transition("rolled_back");
        for (const cb of afterRollbackCallbacks) {
          try { await cb(); } catch { /* swallow */ }
        }
        afterCommitCallbacks.length = 0;
        afterRollbackCallbacks.length = 0;
      } catch (error) {
        transition("failed");
        throw new TransactionRollbackError(id, {
          cause: error,
          originalError: reason,
        });
      }
    },

    markRollbackOnly(reason?: unknown): void {
      rollbackOnly = true;
      rollbackOnlyReason = reason;
    },

    isRollbackOnly(): boolean {
      return rollbackOnly;
    },

    afterCommit(callback: () => Promise<void>): void {
      afterCommitCallbacks.push(callback);
    },

    afterRollback(callback: () => Promise<void>): void {
      afterRollbackCallbacks.push(callback);
    },
  };

  return Object.assign(txn, {
    /** @internal */ _setHandle: setHandle,
    /** @internal */ _getHandle: getHandle,
    /** @internal */ _transition: transition,
    /** @internal */ _markTimedOut: (): void => { timedOut = true; },
    /** @internal */ _getAfterCommitCallbacks: (): Array<() => Promise<void>> => afterCommitCallbacks,
    /** @internal */ _getAfterRollbackCallbacks: (): Array<() => Promise<void>> => afterRollbackCallbacks,
  });
}
