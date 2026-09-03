import { DatabaseError } from "@zudolib/errors";

import type {
  DatabaseClient,
  DatabaseTransactionContext,
} from "../databaseClient/databaseClient.core.js";

import type {
  TransactionCallback,
  TransactionIsolationLevel,
  TransactionOptions,
} from "../databaseType/databaseType.type.js";

/**
 * Transaction state.
 */
export type TransactionStatus =
  "idle" | "active" | "committed" | "rolled-back" | "failed";

/**
 * Runtime transaction information.
 */
export interface TransactionContext {
  readonly transactionId: string;
  readonly startedAt: Date;
  readonly status: TransactionStatus;
  readonly isolationLevel?: TransactionIsolationLevel;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

/**
 * Options for creating a managed transaction.
 */
export interface ManagedTransactionOptions extends TransactionOptions {
  readonly transactionId?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

/**
 * Generates a transaction identifier.
 */
export function createTransactionId(): string {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return `${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 15)}`;
}

/**
 * Manages transaction execution and lifecycle metadata.
 */
export class TransactionManager {
  private readonly client: DatabaseClient;

  constructor(client: DatabaseClient) {
    if (!client) {
      throw new TypeError("A database client is required.");
    }

    this.client = client;
  }

  /**
   * Executes a callback inside a managed transaction.
   */
  public async execute<TResult>(
    callback: (
      transaction: DatabaseTransactionContext,
      context: TransactionContext,
    ) => Promise<TResult>,
    options: ManagedTransactionOptions = {},
  ): Promise<TResult> {
    if (typeof callback !== "function") {
      throw new DatabaseError("A transaction callback is required.");
    }

    const context: TransactionContext = Object.freeze({
      transactionId: options.transactionId ?? createTransactionId(),
      startedAt: new Date(),
      status: "idle",
      isolationLevel: options.isolationLevel,
      metadata: options.metadata
        ? Object.freeze({
            ...options.metadata,
          })
        : undefined,
    });

    let currentStatus: TransactionStatus = "idle";

    try {
      currentStatus = "active";

      const result = await this.client.transaction(async (transaction) => {
        return callback(
          transaction,
          Object.freeze({
            ...context,
            status: currentStatus,
          }),
        );
      }, options);

      currentStatus = "committed";

      return result;
    } catch (error) {
      currentStatus = "failed";

      if (error instanceof DatabaseError) {
        throw error;
      }

      throw new DatabaseError(
        error instanceof Error ? error.message : "Database transaction failed.",
        {
          cause: error,
          metadata: {
            transactionId: context.transactionId,
            status: currentStatus,
            ...(options.metadata ?? {}),
          },
        },
      );
    }
  }

  /**
   * Returns the database client used by the manager.
   */
  public getClient(): DatabaseClient {
    return this.client;
  }
}

/**
 * Creates a transaction manager.
 */
export function createTransactionManager(
  client: DatabaseClient,
): TransactionManager {
  return new TransactionManager(client);
}

/**
 * Executes a managed database transaction.
 */
export async function withTransaction<TResult>(
  client: DatabaseClient,
  callback: (
    transaction: DatabaseTransactionContext,
    context: TransactionContext,
  ) => Promise<TResult>,
  options?: ManagedTransactionOptions,
): Promise<TResult> {
  const manager = createTransactionManager(client);

  return manager.execute(callback, options);
}

/**
 * Executes a transaction with retry support.
 *
 * Only errors explicitly identified as retryable by the supplied
 * predicate are retried.
 */
export async function withTransactionRetry<TResult>(
  client: DatabaseClient,
  callback: (
    transaction: DatabaseTransactionContext,
    context: TransactionContext,
  ) => Promise<TResult>,
  options: ManagedTransactionOptions & {
    readonly retries?: number;
    readonly retryDelayMs?: number;
    readonly shouldRetry?: (error: unknown, attempt: number) => boolean;
  } = {},
): Promise<TResult> {
  const retries = Math.max(0, Math.floor(options.retries ?? 0));

  const retryDelayMs = Math.max(0, options.retryDelayMs ?? 100);

  let attempt = 0;

  while (true) {
    try {
      return await withTransaction(client, callback, options);
    } catch (error) {
      const shouldRetry = options.shouldRetry?.(error, attempt) ?? false;

      if (!shouldRetry || attempt >= retries) {
        throw error;
      }

      attempt += 1;

      const delay = retryDelayMs * Math.pow(2, attempt - 1);

      if (delay > 0) {
        await sleep(delay);
      }
    }
  }
}

/**
 * Creates an immutable transaction context.
 */
export function createTransactionContext(
  options: ManagedTransactionOptions = {},
): TransactionContext {
  return Object.freeze({
    transactionId: options.transactionId ?? createTransactionId(),
    startedAt: new Date(),
    status: "idle",
    isolationLevel: options.isolationLevel,
    metadata: options.metadata
      ? Object.freeze({
          ...options.metadata,
        })
      : undefined,
  });
}

/**
 * Determines whether a transaction is currently active.
 */
export function isTransactionActive(context: TransactionContext): boolean {
  return context.status === "active";
}

/**
 * Determines whether a transaction completed successfully.
 */
export function isTransactionCommitted(context: TransactionContext): boolean {
  return context.status === "committed";
}

/**
 * Determines whether a transaction failed.
 */
export function isTransactionFailed(context: TransactionContext): boolean {
  return context.status === "failed";
}

/**
 * Waits for a specified number of milliseconds.
 */
function sleep(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}
