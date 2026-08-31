/**
 * Transaction interface, options, and retry configuration.
 *
 * @module transactionTypes/transaction
 */

import type { TransactionState, TransactionPropagation, TransactionIsolationLevel } from "./transactionState.js";

/** Options for starting a transaction. */
export interface TransactionOptions {
  /** Isolation level. */
  readonly isolation?: TransactionIsolationLevel;
  /** Propagation strategy for nested transactions. */
  readonly propagation?: TransactionPropagation;
  /** Timeout in ms. 0 = no timeout. */
  readonly timeout?: number;
  /** Whether this is a read-only transaction. */
  readonly readOnly?: boolean;
  /** Human-readable transaction name for observability. */
  readonly name?: string;
  /** Arbitrary metadata attached to the transaction. */
  readonly metadata?: Readonly<Record<string, unknown>>;
  /** Retry configuration. */
  readonly retry?: TransactionRetryOptions;
}

/** Retry configuration for transaction failures. */
export interface TransactionRetryOptions {
  /** Maximum number of retry attempts. Defaults to 0 (no retry). */
  readonly attempts?: number;
  /** Delay between retries in ms. */
  readonly delay?: number;
  /** Backoff strategy. */
  readonly backoff?: "fixed" | "exponential";
}

/** The core transaction interface. */
export interface Transaction {
  /** Unique transaction identifier. */
  readonly id: string;
  /** Parent transaction ID (for nested transactions). */
  readonly parentId?: string;
  /** Current lifecycle state. */
  readonly state: TransactionState;
  /** Options used to start this transaction. */
  readonly options: Readonly<TransactionOptions>;
  /** Timestamp when the transaction was created (ms since epoch). */
  readonly startedAt: number;
  /** Arbitrary metadata. */
  readonly metadata: ReadonlyMap<string, unknown>;
  /** Whether a timeout was detected. */
  readonly timedOut: boolean;
  /** Commit the transaction. */
  commit(): Promise<void>;
  /** Rollback the transaction. */
  rollback(reason?: unknown): Promise<void>;
  /** Mark the transaction as rollback-only (prevents commit). */
  markRollbackOnly(reason?: unknown): void;
  /** Whether the transaction is marked rollback-only. */
  isRollbackOnly(): boolean;
  /** Register a callback to run after commit. */
  afterCommit(callback: () => Promise<void>): void;
  /** Register a callback to run after rollback. */
  afterRollback(callback: () => Promise<void>): void;
}
