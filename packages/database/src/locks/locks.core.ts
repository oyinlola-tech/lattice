import { DatabaseError } from "@zudolib/errors";

import type {
  DatabaseClient,
  DatabaseTransactionContext,
} from "../databaseClient/databaseClient.core.js";

/**
 * Supported lock modes.
 */
export type DatabaseLockMode =
  "for-update" | "for-no-key-update" | "for-share" | "for-key-share";

/**
 * Options for acquiring a database lock.
 */
export interface DatabaseLockOptions {
  readonly mode?: DatabaseLockMode;
  readonly timeoutMs?: number;
  readonly skipLocked?: boolean;
  readonly noWait?: boolean;
}

/**
 * Result returned after executing work while holding a lock.
 */
export interface DatabaseLockResult<TResult> {
  readonly result: TResult;
  readonly lockKey: string;
  readonly mode: DatabaseLockMode;
}

/**
 * Application-level lock abstraction.
 *
 * Database row locks are normally acquired inside a transaction.
 * This class provides safe SQL generation for PostgreSQL-compatible
 * databases without interpolating untrusted values into SQL.
 */
export class DatabaseLockManager {
  private readonly client: DatabaseClient;

  constructor(client: DatabaseClient) {
    if (!client) {
      throw new TypeError("A database client is required.");
    }

    this.client = client;
  }

  /**
   * Executes work inside a transaction after acquiring a PostgreSQL
   * advisory transaction lock.
   *
   * The lock is automatically released by PostgreSQL when the
   * transaction ends.
   */
  public async withAdvisoryLock<TResult>(
    lockKey: string,
    callback: (transaction: DatabaseTransactionContext) => Promise<TResult>,
    options: DatabaseLockOptions = {},
  ): Promise<TResult> {
    validateLockKey(lockKey);

    if (typeof callback !== "function") {
      throw new DatabaseError("A lock callback is required.");
    }

    return this.client.transaction(async (transaction) => {
      await acquireAdvisoryLock(transaction, lockKey, options);

      return callback(transaction);
    });
  }

  /**
   * Acquires a row-level lock and executes work against the supplied
   * table and identifier.
   *
   * The table name is validated as an SQL identifier before being
   * interpolated into the query.
   */
  public async withRowLock<TResult>(
    tableName: string,
    id: string | number,
    callback: (transaction: DatabaseTransactionContext) => Promise<TResult>,
    options: DatabaseLockOptions = {},
  ): Promise<TResult> {
    validateIdentifier(tableName, "table name");

    validateId(id);

    if (typeof callback !== "function") {
      throw new DatabaseError("A lock callback is required.");
    }

    return this.client.transaction(async (transaction) => {
      await lockRow(transaction, tableName, id, options);

      return callback(transaction);
    });
  }

  /**
   * Returns the underlying database client.
   */
  public getClient(): DatabaseClient {
    return this.client;
  }
}

/**
 * Creates a lock manager.
 */
export function createLockManager(client: DatabaseClient): DatabaseLockManager {
  return new DatabaseLockManager(client);
}

/**
 * Acquires a PostgreSQL advisory transaction lock.
 *
 * The lock key is converted to a deterministic 64-bit advisory key.
 */
export async function acquireAdvisoryLock(
  transaction: DatabaseTransactionContext,
  lockKey: string,
  options: DatabaseLockOptions = {},
): Promise<void> {
  validateLockKey(lockKey);

  const key = normalizeAdvisoryKey(lockKey);

  try {
    if (options.noWait) {
      const acquired = await transaction.$queryRaw<
        readonly [
          {
            acquired: boolean;
          },
        ]
      >`
          SELECT pg_try_advisory_xact_lock(
            ${key}
          ) AS acquired
        `;

      if (!acquired[0]?.acquired) {
        throw new DatabaseError(
          `Database advisory lock "${lockKey}" is already held.`,
        );
      }

      return;
    }

    await transaction.$executeRaw`
      SELECT pg_advisory_xact_lock(
        ${key}
      )
    `;
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw error;
    }

    throw new DatabaseError(
      `Failed to acquire database advisory lock "${lockKey}".`,
      {
        cause: error,
        metadata: {
          lockKey,
          mode: options.mode ?? "for-update",
        },
      },
    );
  }
}

/**
 * Acquires a row-level PostgreSQL lock.
 */
export async function lockRow(
  transaction: DatabaseTransactionContext,
  tableName: string,
  id: string | number,
  options: DatabaseLockOptions = {},
): Promise<void> {
  validateIdentifier(tableName, "table name");

  validateId(id);

  const mode = options.mode ?? "for-update";

  const clause = buildLockClause(mode, options);

  try {
    await transaction.$executeRawUnsafe(
      `SELECT 1 FROM "${tableName}" WHERE "id" = $1 ${clause}`,
      id,
    );
  } catch (error) {
    throw new DatabaseError(`Failed to acquire row lock on "${tableName}".`, {
      cause: error,
      metadata: {
        tableName,
        id,
        mode,
      },
    });
  }
}

/**
 * Builds a safe PostgreSQL lock clause.
 */
export function buildLockClause(
  mode: DatabaseLockMode,
  options: DatabaseLockOptions = {},
): string {
  const lockMode = getLockModeSql(mode);

  const modifiers: string[] = [];

  if (options.noWait) {
    modifiers.push("NOWAIT");
  } else if (options.skipLocked) {
    modifiers.push("SKIP LOCKED");
  }

  return [lockMode, ...modifiers].join(" ");
}

/**
 * Maps the public lock mode to PostgreSQL SQL.
 */
function getLockModeSql(mode: DatabaseLockMode): string {
  switch (mode) {
    case "for-update":
      return "FOR UPDATE";

    case "for-no-key-update":
      return "FOR NO KEY UPDATE";

    case "for-share":
      return "FOR SHARE";

    case "for-key-share":
      return "FOR KEY SHARE";

    default:
      throw new TypeError(`Unsupported database lock mode: ${String(mode)}`);
  }
}

/**
 * Converts an application lock key into a deterministic signed
 * 64-bit integer represented as a bigint.
 */
export function normalizeAdvisoryKey(lockKey: string): bigint {
  validateLockKey(lockKey);

  const bytes = new TextEncoder().encode(lockKey);

  let hash = 1469598103934665603n;

  for (const byte of bytes) {
    hash ^= BigInt(byte);

    hash = BigInt.asIntN(64, hash * 1099511628211n);
  }

  return BigInt.asIntN(64, hash);
}

/**
 * Validates an advisory lock key.
 */
function validateLockKey(lockKey: string): void {
  if (typeof lockKey !== "string" || lockKey.trim().length === 0) {
    throw new TypeError("A non-empty database lock key is required.");
  }

  if (lockKey.length > 255) {
    throw new TypeError("Database lock keys cannot exceed 255 characters.");
  }
}

/**
 * Validates an SQL identifier.
 */
function validateIdentifier(value: string, name: string): void {
  if (typeof value !== "string" || value.length === 0) {
    throw new TypeError(`A valid ${name} is required.`);
  }

  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(value)) {
    throw new TypeError(`Invalid ${name}: "${value}".`);
  }
}

/**
 * Validates a database identifier value.
 */
function validateId(id: string | number): void {
  if (typeof id === "string" && id.trim().length === 0) {
    throw new TypeError("A non-empty database identifier is required.");
  }

  if (typeof id === "number" && !Number.isFinite(id)) {
    throw new TypeError("A finite database identifier is required.");
  }
}
