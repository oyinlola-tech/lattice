import { DatabaseError } from "@zudolib/errors";

import type {
  DatabaseTransactionContext,
  DatabaseClient,
} from "../databaseClient/databaseClient.core.js";

import type {
  TransactionCallback,
  TransactionOptions,
} from "../databaseType/databaseType.type.js";

/**
 * Contract for a unit of work.
 *
 * A unit of work groups multiple repository operations into a single
 * database transaction so they either all succeed or all roll back.
 */
export interface UnitOfWork {
  execute<TResult>(
    callback: TransactionCallback<DatabaseTransactionContext, TResult>,
    options?: TransactionOptions,
  ): Promise<TResult>;
}

/**
 * Configuration for a unit of work.
 */
export interface UnitOfWorkOptions {
  readonly client: DatabaseClient;
}

/**
 * Prisma-backed unit of work.
 */
export class DatabaseUnitOfWork implements UnitOfWork {
  private readonly client: DatabaseClient;

  constructor(options: UnitOfWorkOptions) {
    if (!options?.client) {
      throw new TypeError("A database client is required.");
    }

    this.client = options.client;
  }

  /**
   * Executes a callback inside a transaction.
   */
  public async execute<TResult>(
    callback: TransactionCallback<DatabaseTransactionContext, TResult>,
    options?: TransactionOptions,
  ): Promise<TResult> {
    if (typeof callback !== "function") {
      throw new DatabaseError("A unit of work callback is required.");
    }

    return this.client.transaction(async (transaction) => {
      try {
        return await callback(transaction);
      } catch (error) {
        if (error instanceof DatabaseError) {
          throw error;
        }

        throw new DatabaseError(
          error instanceof Error
            ? error.message
            : "Unit of work execution failed.",
          {
            cause: error,
            metadata: {
              operation: "unit-of-work",
            },
          },
        );
      }
    }, options);
  }

  /**
   * Returns the database client used by this unit of work.
   */
  public getClient(): DatabaseClient {
    return this.client;
  }
}

/**
 * Creates a database unit of work.
 */
export function createUnitOfWork(client: DatabaseClient): DatabaseUnitOfWork {
  return new DatabaseUnitOfWork({
    client,
  });
}

/**
 * Executes a callback as a single database transaction.
 *
 * This convenience function is useful when a full UnitOfWork instance
 * does not need to be retained.
 */
export async function executeUnitOfWork<TResult>(
  client: DatabaseClient,
  callback: TransactionCallback<DatabaseTransactionContext, TResult>,
  options?: TransactionOptions,
): Promise<TResult> {
  const unitOfWork = createUnitOfWork(client);

  return unitOfWork.execute(callback, options);
}
