import {
  PrismaClient,
  Prisma,
} from "@prisma/client";

import {
  DatabaseError,
} from "@lattice/errors";

import type {
  DatabaseClient as DatabaseClientContract,
  DatabaseConnectionOptions,
  DatabaseHealth,
  DatabaseLogger,
  DatabaseStatus,
  TransactionCallback,
  TransactionOptions,
} from "./types.js";

export type PrismaClientLike =
  PrismaClient;

export interface DatabaseClientOptions
  extends DatabaseConnectionOptions {
  readonly logger?: DatabaseLogger;
  readonly prisma?: PrismaClientLike;
}

export type DatabaseTransactionContext =
  Prisma.TransactionClient;

/**
 * Prisma-backed database client.
 *
 * This class owns the Prisma connection lifecycle and provides a
 * stable database abstraction to the rest of the application.
 */
export class DatabaseClient
  implements
    DatabaseClientContract<DatabaseTransactionContext> {
  private readonly prisma: PrismaClientLike;

  private readonly logger: DatabaseLogger;

  private readonly options: DatabaseClientOptions;

  private status:
    DatabaseStatus =
      "disconnected";

  private connectedAt?: Date;

  constructor(
    options: DatabaseClientOptions = {},
  ) {
    this.options = options;

    this.logger =
      options.logger ??
      createDefaultLogger();

    this.prisma =
      options.prisma ??
      new PrismaClient({
        log: options.logging
          ? [
              {
                emit: "event",
                level: "query",
              },
              {
                emit: "stdout",
                level: "error",
              },
              {
                emit: "stdout",
                level: "warn",
              },
            ]
          : [
              {
                emit: "stdout",
                level: "error",
              },
            ],
      });

    this.registerQueryLogging();
  }

  /**
   * Returns the underlying Prisma client.
   *
   * Infrastructure code may use this when it needs a Prisma-specific
   * operation that is intentionally outside the generic abstraction.
   */
  public getPrisma(): PrismaClientLike {
    return this.prisma;
  }

  /**
   * Establishes the database connection.
   */
  public async connect(): Promise<void> {
    if (
      this.status ===
      "connected"
    ) {
      return;
    }

    if (
      this.status ===
      "connecting"
    ) {
      return;
    }

    this.status =
      "connecting";

    try {
      await this.withTimeout(
        this.prisma.$connect(),
        this.options
          .connectionTimeoutMs ??
          10_000,
        "Database connection timed out.",
      );

      this.status =
        "connected";

      this.connectedAt =
        new Date();

      this.logger.info(
        "Database connected.",
      );
    } catch (error) {
      this.status =
        "error";

      const normalized =
        this.normalizeError(
          error,
          "Database connection failed.",
        );

      this.logger.error(
        normalized.message,
        normalized,
      );

      throw normalized;
    }
  }

  /**
   * Closes the database connection.
   */
  public async disconnect(): Promise<void> {
    if (
      this.status ===
      "disconnected"
    ) {
      return;
    }

    this.status =
      "disconnecting";

    try {
      await this.prisma.$disconnect();

      this.status =
        "disconnected";

      this.connectedAt =
        undefined;

      this.logger.info(
        "Database disconnected.",
      );
    } catch (error) {
      this.status =
        "error";

      const normalized =
        this.normalizeError(
          error,
          "Database disconnection failed.",
        );

      this.logger.error(
        normalized.message,
        normalized,
      );

      throw normalized;
    }
  }

  /**
   * Verifies that the database is reachable.
   */
  public async ping(): Promise<void> {
    try {
      await this.prisma.$queryRaw`
        SELECT 1
      `;
    } catch (error) {
      const normalized =
        this.normalizeError(
          error,
          "Database ping failed.",
        );

      this.status =
        "error";

      throw normalized;
    }
  }

  /**
   * Returns the current lifecycle status.
   */
  public getStatus(): DatabaseStatus {
    return this.status;
  }

  /**
   * Returns the time at which the current connection was established.
   */
  public getConnectedAt():
    | Date
    | undefined {
    return this.connectedAt;
  }

  /**
   * Performs a database health check.
   */
  public async healthCheck(): Promise<DatabaseHealth> {
    const startedAt =
      Date.now();

    try {
      await this.ping();

      return {
        status: "connected",
        latencyMs:
          Date.now() -
          startedAt,
        checkedAt:
          new Date(),
      };
    } catch (error) {
      const normalized =
        this.normalizeError(
          error,
          "Database health check failed.",
        );

      return {
        status: "error",
        latencyMs:
          Date.now() -
          startedAt,
        checkedAt:
          new Date(),
        error:
          normalized.message,
      };
    }
  }

  /**
   * Executes work inside a Prisma transaction.
   */
  public async transaction<TResult>(
    callback: TransactionCallback<
      DatabaseTransactionContext,
      TResult
    >,
    options: TransactionOptions = {},
  ): Promise<TResult> {
    if (
      typeof callback !==
      "function"
    ) {
      throw new TypeError(
        "A transaction callback is required.",
      );
    }

    await this.ensureConnected();

    const transactionOptions =
      this.buildTransactionOptions(
        options,
      );

    try {
      return await this.prisma.$transaction(
        async (transaction) =>
          callback(
            transaction,
          ),
        transactionOptions,
      );
    } catch (error) {
      const normalized =
        this.normalizeError(
          error,
          "Database transaction failed.",
        );

      this.logger.error(
        normalized.message,
        normalized,
      );

      throw normalized;
    }
  }

  /**
   * Executes a raw SQL statement.
   */
  public async executeRaw(
    query: Prisma.Sql,
  ): Promise<number> {
    await this.ensureConnected();

    try {
      return await this.prisma.$executeRaw(
        query,
      );
    } catch (error) {
      throw this.normalizeError(
        error,
        "Raw database execution failed.",
      );
    }
  }

  /**
   * Executes a raw SQL query.
   */
  public async queryRaw<
    TResult = unknown,
  >(
    query: Prisma.Sql,
  ): Promise<TResult> {
    await this.ensureConnected();

    try {
      return (await this.prisma.$queryRaw(
        query,
      )) as TResult;
    } catch (error) {
      throw this.normalizeError(
        error,
        "Raw database query failed.",
      );
    }
  }

  /**
   * Ensures the client is connected before an operation.
   */
  public async ensureConnected(): Promise<void> {
    if (
      this.status !==
      "connected"
    ) {
      await this.connect();
    }
  }

  /**
   * Destroys the client and releases resources.
   */
  public async destroy(): Promise<void> {
    await this.disconnect();
  }

  /**
   * Registers Prisma query logging when enabled.
   */
  private registerQueryLogging(): void {
    if (
      !this.options.logging
    ) {
      return;
    }

    const prisma =
      this.prisma as PrismaClient & {
        $on?: (
          event: "query",
          callback: (
            event: {
              query: string;
              params: string;
              duration: number;
              target: string;
            },
          ) => void,
        ) => void;
      };

    prisma.$on?.(
      "query",
      (event) => {
        this.logger.debug(
          "Database query executed.",
          {
            durationMs:
              event.duration,
            target:
              event.target,
          },
        );
      },
    );
  }

  /**
   * Builds Prisma transaction options.
   */
  private buildTransactionOptions(
    options: TransactionOptions,
  ): {
    maxWait?: number;
    timeout?: number;
    isolationLevel?: Prisma.TransactionIsolationLevel;
  } {
    return {
      maxWait:
        options.maxWaitMs,
      timeout:
        options.timeoutMs,
      isolationLevel:
        options.isolationLevel
          ? this.mapIsolationLevel(
              options.isolationLevel,
            )
          : undefined,
    };
  }

  /**
   * Maps the package isolation level to Prisma's enum.
   */
  private mapIsolationLevel(
    level: NonNullable<
      TransactionOptions["isolationLevel"]
    >,
  ): Prisma.TransactionIsolationLevel {
    switch (level) {
      case "ReadUncommitted":
        return Prisma.TransactionIsolationLevel.ReadUncommitted;

      case "ReadCommitted":
        return Prisma.TransactionIsolationLevel.ReadCommitted;

      case "RepeatableRead":
        return Prisma.TransactionIsolationLevel.RepeatableRead;

      case "Serializable":
        return Prisma.TransactionIsolationLevel.Serializable;

      case "Snapshot":
        return Prisma.TransactionIsolationLevel.Snapshot;

      default:
        throw new TypeError(
          `Unsupported transaction isolation level: ${String(
            level,
          )}`,
        );
    }
  }

  /**
   * Runs an operation with a timeout.
   */
  private async withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
    message: string,
  ): Promise<T> {
    if (
      timeoutMs <= 0
    ) {
      return promise;
    }

    let timer:
      ReturnType<
        typeof setTimeout
      >;

    const timeout =
      new Promise<never>(
        (_, reject) => {
          timer =
            setTimeout(
              () => {
                reject(
                  new DatabaseError(
                    message,
                  ),
                );
              },
              timeoutMs,
            );
        },
      );

    try {
      return await Promise.race(
        [
          promise,
          timeout,
        ],
      );
    } finally {
      clearTimeout(
        timer!,
      );
    }
  }

  /**
   * Converts unknown database failures into the shared error type.
   */
  private normalizeError(
    error: unknown,
    fallbackMessage: string,
  ): DatabaseError {
    if (
      error instanceof
      DatabaseError
    ) {
      return error;
    }

    return new DatabaseError(
      error instanceof Error
        ? error.message
        : fallbackMessage,
      {
        cause: error,
      },
    );
  }
}

/**
 * Creates a database client.
 */
export function createDatabaseClient(
  options: DatabaseClientOptions = {},
): DatabaseClient {
  return new DatabaseClient(
    options,
  );
}

/**
 * Creates a minimal logger for environments where no application
 * logger has been configured yet.
 */
function createDefaultLogger(): DatabaseLogger {
  return {
    debug: (
      message,
      metadata,
    ) => {
      if (
        process.env.NODE_ENV !==
        "production"
      ) {
        console.debug(
          message,
          metadata,
        );
      }
    },

    info: (
      message,
      metadata,
    ) => {
      if (
        process.env.NODE_ENV !==
        "production"
      ) {
        console.info(
          message,
          metadata,
        );
      }
    },

    warn: (
      message,
      metadata,
    ) => {
      console.warn(
        message,
        metadata,
      );
    },

    error: (
      message,
      error,
      metadata,
    ) => {
      console.error(
        message,
        error,
        metadata,
      );
    },
  };
}