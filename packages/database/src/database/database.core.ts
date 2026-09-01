import {
  createDatabaseClient,
  type DatabaseClient,
  type DatabaseClientOptions,
  type DatabaseTransactionContext,
} from "../databaseClient/databaseClient.core.js";

import type {
  DatabaseHealth,
  DatabaseStatus,
  TransactionCallback,
  TransactionOptions,
} from "../databaseType/databaseType.type.js";

/**
 * Database facade used by the application layer.
 *
 * This module provides a single database lifecycle entry point while
 * keeping the underlying Prisma client implementation inside the
 * database package.
 */
export class Database {
  private readonly client: DatabaseClient;

  constructor(options: DatabaseClientOptions = {}) {
    this.client = createDatabaseClient(options);
  }

  /**
   * Initializes the database connection.
   */
  public async connect(): Promise<void> {
    await this.client.connect();
  }

  /**
   * Closes the database connection.
   */
  public async disconnect(): Promise<void> {
    await this.client.disconnect();
  }

  /**
   * Ensures the database is connected.
   */
  public async ensureConnected(): Promise<void> {
    await this.client.ensureConnected();
  }

  /**
   * Checks database connectivity.
   */
  public async ping(): Promise<void> {
    await this.client.ping();
  }

  /**
   * Returns the current database status.
   */
  public getStatus(): DatabaseStatus {
    return this.client.getStatus();
  }

  /**
   * Returns database health information.
   */
  public async healthCheck(): Promise<DatabaseHealth> {
    return this.client.healthCheck();
  }

  /**
   * Executes work inside a database transaction.
   */
  public async transaction<TResult>(
    callback: TransactionCallback<DatabaseTransactionContext, TResult>,
    options?: TransactionOptions,
  ): Promise<TResult> {
    return this.client.transaction(callback, options);
  }

  /**
   * Returns the underlying database client.
   *
   * This should primarily be used by repository and infrastructure
   * implementations that require direct Prisma access.
   */
  public getClient(): DatabaseClient {
    return this.client;
  }

  /**
   * Returns the underlying Prisma client.
   */
  public getPrisma() {
    return this.client.getPrisma();
  }

  /**
   * Releases all database resources.
   */
  public async destroy(): Promise<void> {
    await this.client.destroy();
  }
}

/**
 * Creates a database facade.
 */
export function createDatabase(options: DatabaseClientOptions = {}): Database {
  return new Database(options);
}

/**
 * Default database instance.
 *
 * The instance is created lazily by consumers through the exported
 * factory rather than connecting during module import.
 */
let defaultDatabase: Database | undefined;

/**
 * Returns the shared application database instance.
 *
 * The connection is not established automatically. Call
 * `connect()` during application bootstrap.
 */
export function getDatabase(options: DatabaseClientOptions = {}): Database {
  if (!defaultDatabase) {
    defaultDatabase = createDatabase(options);
  }

  return defaultDatabase;
}

/**
 * Connects the shared application database.
 */
export async function connectDatabase(
  options: DatabaseClientOptions = {},
): Promise<Database> {
  const database = getDatabase(options);

  await database.connect();

  return database;
}

/**
 * Disconnects the shared application database.
 */
export async function disconnectDatabase(): Promise<void> {
  if (!defaultDatabase) {
    return;
  }

  await defaultDatabase.disconnect();
}

/**
 * Resets the shared database instance.
 *
 * Primarily useful for application shutdown, tests, and isolated
 * runtime environments.
 */
export async function resetDatabase(): Promise<void> {
  if (!defaultDatabase) {
    return;
  }

  await defaultDatabase.destroy();

  defaultDatabase = undefined;
}
