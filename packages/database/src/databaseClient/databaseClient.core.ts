/**
 * @zudoliblib/database — Database Client Core
 *
 * Prisma-backed database client implementation.
 */

import { PrismaClient, Prisma } from "@prisma/client";
import { DatabaseError } from "@zudoliblib/errors";
import type {
  DatabaseClient as DatabaseClientContract,
  DatabaseConnectionOptions,
  DatabaseHealth,
  DatabaseLogger,
  DatabaseStatus,
  TransactionCallback,
  TransactionOptions,
} from "../databaseType/databaseType.type.js";
import { createDefaultLogger } from "./databaseClient.logger.js";

export type PrismaClientLike = PrismaClient;

export interface DatabaseClientOptions extends DatabaseConnectionOptions {
  readonly logger?: DatabaseLogger;
  readonly prisma?: PrismaClientLike;
}

export type DatabaseTransactionContext = Prisma.TransactionClient;

/** Prisma-backed database client. */
export class DatabaseClient implements DatabaseClientContract<DatabaseTransactionContext> {
  private readonly prisma: PrismaClientLike;
  private readonly logger: DatabaseLogger;
  private readonly options: DatabaseClientOptions;
  private status: DatabaseStatus = "disconnected";
  private connectedAt?: Date;

  constructor(options: DatabaseClientOptions = {}) {
    this.options = options;
    this.logger = options.logger ?? createDefaultLogger();
    this.prisma =
      options.prisma ??
      new PrismaClient({
        log: options.logging
          ? [
              { emit: "event", level: "query" },
              { emit: "stdout", level: "error" },
              { emit: "stdout", level: "warn" },
            ]
          : [{ emit: "stdout", level: "error" }],
      });
    this.registerQueryLogging();
  }

  public getPrisma(): PrismaClientLike {
    return this.prisma;
  }

  public async connect(): Promise<void> {
    if (this.status === "connected" || this.status === "connecting") return;
    this.status = "connecting";
    try {
      await this.withTimeout(
        this.prisma.$connect(),
        this.options.connectionTimeoutMs ?? 10_000,
        "Database connection timed out.",
      );
      this.status = "connected";
      this.connectedAt = new Date();
      this.logger.info("Database connected.");
    } catch (error) {
      this.status = "error";
      const normalized = this.normalizeError(
        error,
        "Database connection failed.",
      );
      this.logger.error(normalized.message, normalized);
      throw normalized;
    }
  }

  public async disconnect(): Promise<void> {
    if (this.status === "disconnected") return;
    this.status = "disconnecting";
    try {
      await this.prisma.$disconnect();
      this.status = "disconnected";
      this.connectedAt = undefined;
      this.logger.info("Database disconnected.");
    } catch (error) {
      this.status = "error";
      const normalized = this.normalizeError(
        error,
        "Database disconnection failed.",
      );
      this.logger.error(normalized.message, normalized);
      throw normalized;
    }
  }

  public async ping(): Promise<void> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch (error) {
      this.status = "error";
      throw this.normalizeError(error, "Database ping failed.");
    }
  }

  public getStatus(): DatabaseStatus {
    return this.status;
  }
  public getConnectedAt(): Date | undefined {
    return this.connectedAt;
  }

  public async healthCheck(): Promise<DatabaseHealth> {
    const startedAt = Date.now();
    try {
      await this.ping();
      return {
        status: "connected",
        latencyMs: Date.now() - startedAt,
        checkedAt: new Date(),
      };
    } catch (error) {
      const normalized = this.normalizeError(
        error,
        "Database health check failed.",
      );
      return {
        status: "error",
        latencyMs: Date.now() - startedAt,
        checkedAt: new Date(),
        error: normalized.message,
      };
    }
  }

  public async transaction<TResult>(
    callback: TransactionCallback<DatabaseTransactionContext, TResult>,
    options: TransactionOptions = {},
  ): Promise<TResult> {
    if (typeof callback !== "function")
      throw new TypeError("A transaction callback is required.");
    await this.ensureConnected();
    const transactionOptions = this.buildTransactionOptions(options);
    try {
      return await this.prisma.$transaction(
        async (transaction) => callback(transaction),
        transactionOptions,
      );
    } catch (error) {
      const normalized = this.normalizeError(
        error,
        "Database transaction failed.",
      );
      this.logger.error(normalized.message, normalized);
      throw normalized;
    }
  }

  public async executeRaw(query: Prisma.Sql): Promise<number> {
    await this.ensureConnected();
    try {
      return await this.prisma.$executeRaw(query);
    } catch (error) {
      throw this.normalizeError(error, "Raw database execution failed.");
    }
  }

  public async queryRaw<TResult = unknown>(
    query: Prisma.Sql,
  ): Promise<TResult> {
    await this.ensureConnected();
    try {
      return (await this.prisma.$queryRaw(query)) as TResult;
    } catch (error) {
      throw this.normalizeError(error, "Raw database query failed.");
    }
  }

  public async ensureConnected(): Promise<void> {
    if (this.status !== "connected") await this.connect();
  }

  public async destroy(): Promise<void> {
    await this.disconnect();
  }

  private registerQueryLogging(): void {
    if (!this.options.logging) return;
    const prisma = this.prisma as PrismaClient & {
      $on?: (
        event: "query",
        callback: (event: {
          query: string;
          params: string;
          duration: number;
          target: string;
        }) => void,
      ) => void;
    };
    prisma.$on?.("query", (event) => {
      this.logger.debug("Database query executed.", {
        durationMs: event.duration,
        target: event.target,
      });
    });
  }

  private buildTransactionOptions(options: TransactionOptions) {
    return {
      maxWait: options.maxWaitMs,
      timeout: options.timeoutMs,
      isolationLevel: options.isolationLevel
        ? this.mapIsolationLevel(options.isolationLevel)
        : undefined,
    };
  }

  private mapIsolationLevel(
    level: NonNullable<TransactionOptions["isolationLevel"]>,
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
      default:
        throw new TypeError(
          `Unsupported transaction isolation level: ${String(level)}`,
        );
    }
  }

  private async withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
    message: string,
  ): Promise<T> {
    if (timeoutMs <= 0) return promise;
    let timer: ReturnType<typeof setTimeout>;
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        reject(new DatabaseError(message));
      }, timeoutMs);
    });
    try {
      return await Promise.race([promise, timeout]);
    } finally {
      clearTimeout(timer!);
    }
  }

  private normalizeError(
    error: unknown,
    fallbackMessage: string,
  ): DatabaseError {
    if (error instanceof DatabaseError) return error;
    return new DatabaseError(
      error instanceof Error ? error.message : fallbackMessage,
      { cause: error },
    );
  }
}

/** Creates a database client. */
export function createDatabaseClient(
  options: DatabaseClientOptions = {},
): DatabaseClient {
  return new DatabaseClient(options);
}
