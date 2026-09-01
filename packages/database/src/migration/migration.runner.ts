import { DatabaseError } from "@oyinlola141/lattice-errors";

import type {
  DatabaseClient,
  DatabaseTransactionContext,
} from "../databaseClient/databaseClient.core.js";

import { Prisma } from "@prisma/client";

/**
 * Migration definition.
 *
 * Each migration must have a unique, monotonically ordered version.
 */
export interface Migration {
  readonly version: number;
  readonly name: string;

  /**
   * Applies the migration.
   */
  readonly up: (database: DatabaseTransactionContext) => Promise<void>;

  /**
   * Reverts the migration.
   */
  readonly down?: (database: DatabaseTransactionContext) => Promise<void>;
}

/**
 * Persisted migration record.
 */
export interface MigrationRecord {
  readonly version: number;
  readonly name: string;
  readonly appliedAt: Date;
}

/**
 * Migration execution result.
 */
export interface MigrationResult {
  readonly applied: readonly MigrationRecord[];
  readonly skipped: readonly MigrationRecord[];
}

/**
 * Migration status.
 */
export interface MigrationStatus {
  readonly currentVersion: number;
  readonly latestVersion: number;
  readonly pending: readonly Migration[];
  readonly applied: readonly MigrationRecord[];
}

/**
 * Migration runner options.
 */
export interface MigrationRunnerOptions {
  readonly tableName?: string;
  readonly lockKey?: string;
}

/**
 * Default migration table.
 */
export const DEFAULT_MIGRATION_TABLE = "_migrations";

/**
 * Default migration advisory lock.
 */
export const DEFAULT_MIGRATION_LOCK = "database:migrations";

/**
 * Runs and tracks database migrations.
 */
export class MigrationRunner {
  private readonly client: DatabaseClient;

  private readonly migrations: readonly Migration[];

  private readonly tableName: string;

  private readonly lockKey: string;

  constructor(
    client: DatabaseClient,
    migrations: readonly Migration[],
    options: MigrationRunnerOptions = {},
  ) {
    if (!client) {
      throw new TypeError("A database client is required.");
    }

    this.client = client;

    this.migrations = normalizeMigrations(migrations);

    this.tableName = options.tableName ?? DEFAULT_MIGRATION_TABLE;

    this.lockKey = options.lockKey ?? DEFAULT_MIGRATION_LOCK;

    validateIdentifier(this.tableName, "migration table name");
  }

  /**
   * Returns migration status.
   */
  public async status(): Promise<MigrationStatus> {
    await this.ensureMigrationTable();

    const applied = await this.getAppliedMigrations();

    const appliedVersions = new Set(
      applied.map((migration) => migration.version),
    );

    const pending = this.migrations.filter(
      (migration) => !appliedVersions.has(migration.version),
    );

    return {
      currentVersion: getCurrentVersion(applied),
      latestVersion: getLatestVersion(this.migrations),
      pending,
      applied,
    };
  }

  /**
   * Applies all pending migrations.
   */
  public async migrate(): Promise<MigrationResult> {
    await this.ensureMigrationTable();

    const applied = await this.getAppliedMigrations();

    const appliedVersions = new Set(
      applied.map((migration) => migration.version),
    );

    const pending = this.migrations.filter(
      (migration) => !appliedVersions.has(migration.version),
    );

    if (pending.length === 0) {
      return {
        applied: [],
        skipped: applied,
      };
    }

    const newlyApplied: MigrationRecord[] = [];

    await this.client.transaction(async (transaction) => {
      await this.acquireMigrationLock(transaction);

      for (const migration of pending) {
        await this.executeMigration(transaction, migration);

        const record = await this.recordMigration(transaction, migration);

        newlyApplied.push(record);
      }
    });

    return {
      applied: newlyApplied,
      skipped: applied,
    };
  }

  /**
   * Rolls back the most recently applied migration.
   */
  public async rollback(): Promise<MigrationRecord | null> {
    await this.ensureMigrationTable();

    const applied = await this.getAppliedMigrations();

    if (applied.length === 0) {
      return null;
    }

    const latest = applied[applied.length - 1];

    if (!latest) {
      return null;
    }

    const migration = this.migrations.find(
      (candidate) => candidate.version === latest.version,
    );

    if (!migration) {
      throw new DatabaseError(
        `Migration "${latest.name}" is recorded as applied but is not registered.`,
        {
          metadata: {
            version: latest.version,
          },
        },
      );
    }

    if (!migration.down) {
      throw new DatabaseError(
        `Migration "${migration.name}" does not define a rollback operation.`,
        {
          metadata: {
            version: migration.version,
          },
        },
      );
    }

    await this.client.transaction(async (transaction) => {
      await this.acquireMigrationLock(transaction);

      await migration.down!(transaction);

      await this.deleteMigrationRecord(transaction, migration.version);
    });

    return latest;
  }

  /**
   * Rolls back all applied migrations in reverse order.
   */
  public async rollbackAll(): Promise<readonly MigrationRecord[]> {
    await this.ensureMigrationTable();

    const applied = await this.getAppliedMigrations();

    if (applied.length === 0) {
      return [];
    }

    const rolledBack: MigrationRecord[] = [];

    await this.client.transaction(async (transaction) => {
      await this.acquireMigrationLock(transaction);

      for (let index = applied.length - 1; index >= 0; index -= 1) {
        const record = applied[index];

        if (!record) {
          continue;
        }

        const migration = this.migrations.find(
          (candidate) => candidate.version === record.version,
        );

        if (!migration) {
          throw new DatabaseError(
            `Migration "${record.name}" is not registered.`,
            {
              metadata: {
                version: record.version,
              },
            },
          );
        }

        if (!migration.down) {
          throw new DatabaseError(
            `Migration "${migration.name}" does not define a rollback operation.`,
            {
              metadata: {
                version: migration.version,
              },
            },
          );
        }

        await migration.down(transaction);

        await this.deleteMigrationRecord(transaction, migration.version);

        rolledBack.push(record);
      }
    });

    return rolledBack;
  }

  /**
   * Ensures the migration table exists.
   */
  public async ensureMigrationTable(): Promise<void> {
    const table = quoteIdentifier(this.tableName);

    try {
      await this.client.executeRaw(
        Prisma.sql`
          CREATE TABLE IF NOT EXISTS ${table} (
            "version" INTEGER PRIMARY KEY,
            "name" VARCHAR(255) NOT NULL,
            "applied_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
          )
        `,
      );
    } catch (error) {
      throw new DatabaseError("Failed to initialize the migration table.", {
        cause: error,
        metadata: {
          tableName: this.tableName,
        },
      });
    }
  }

  /**
   * Returns all applied migrations.
   */
  public async getAppliedMigrations(): Promise<readonly MigrationRecord[]> {
    const table = quoteIdentifier(this.tableName);

    try {
      const rows = await this.client.queryRaw<
        readonly {
          version: number;
          name: string;
          applied_at: Date;
        }[]
      >(
        Prisma.sql`
            SELECT
              "version",
              "name",
              "applied_at"
            FROM ${table}
            ORDER BY "version" ASC
          `,
      );

      return rows.map((row) => ({
        version: Number(row.version),
        name: row.name,
        appliedAt: new Date(row.applied_at),
      }));
    } catch (error) {
      throw new DatabaseError("Failed to read migration history.", {
        cause: error,
        metadata: {
          tableName: this.tableName,
        },
      });
    }
  }

  /**
   * Executes one migration.
   */
  private async executeMigration(
    transaction: DatabaseTransactionContext,
    migration: Migration,
  ): Promise<void> {
    try {
      await migration.up(transaction);
    } catch (error) {
      throw new DatabaseError(`Migration "${migration.name}" failed.`, {
        cause: error,
        metadata: {
          version: migration.version,
          name: migration.name,
        },
      });
    }
  }

  /**
   * Records a successfully applied migration.
   */
  private async recordMigration(
    transaction: DatabaseTransactionContext,
    migration: Migration,
  ): Promise<MigrationRecord> {
    const table = quoteIdentifier(this.tableName);

    try {
      await transaction.$executeRawUnsafe(
        `
          INSERT INTO ${table}
            ("version", "name")
          VALUES
            ($1, $2)
        `,
        migration.version,
        migration.name,
      );

      return {
        version: migration.version,
        name: migration.name,
        appliedAt: new Date(),
      };
    } catch (error) {
      throw new DatabaseError(
        `Failed to record migration "${migration.name}".`,
        {
          cause: error,
          metadata: {
            version: migration.version,
          },
        },
      );
    }
  }

  /**
   * Removes a migration record.
   */
  private async deleteMigrationRecord(
    transaction: DatabaseTransactionContext,
    version: number,
  ): Promise<void> {
    const table = quoteIdentifier(this.tableName);

    try {
      await transaction.$executeRawUnsafe(
        `
          DELETE FROM ${table}
          WHERE "version" = $1
        `,
        version,
      );
    } catch (error) {
      throw new DatabaseError(
        `Failed to remove migration record for version ${version}.`,
        {
          cause: error,
          metadata: {
            version,
          },
        },
      );
    }
  }

  /**
   * Acquires the migration advisory lock.
   */
  private async acquireMigrationLock(
    transaction: DatabaseTransactionContext,
  ): Promise<void> {
    try {
      const lock = hashLockKey(this.lockKey);

      await transaction.$executeRaw`
        SELECT pg_advisory_xact_lock(
          ${lock}
        )
      `;
    } catch (error) {
      throw new DatabaseError(
        "Failed to acquire the database migration lock.",
        {
          cause: error,
          metadata: {
            lockKey: this.lockKey,
          },
        },
      );
    }
  }
}

/**
 * Creates a migration runner.
 */
export function createMigrationRunner(
  client: DatabaseClient,
  migrations: readonly Migration[],
  options?: MigrationRunnerOptions,
): MigrationRunner {
  return new MigrationRunner(client, migrations, options);
}

/**
 * Normalizes and validates migrations.
 */
export function normalizeMigrations(
  migrations: readonly Migration[],
): readonly Migration[] {
  if (!Array.isArray(migrations)) {
    throw new TypeError("Migrations must be an array.");
  }

  const normalized = migrations
    .map((migration) => {
      validateMigration(migration);

      return Object.freeze({
        ...migration,
      });
    })
    .sort((first, second) => first.version - second.version);

  for (let index = 1; index < normalized.length; index += 1) {
    const previous = normalized[index - 1];

    const current = normalized[index];

    if (previous && current && previous.version === current.version) {
      throw new TypeError(`Duplicate migration version: ${current.version}.`);
    }
  }

  return Object.freeze(normalized);
}

/**
 * Validates one migration.
 */
export function validateMigration(migration: Migration): void {
  if (!migration || typeof migration !== "object") {
    throw new TypeError("A migration definition is required.");
  }

  if (!Number.isInteger(migration.version) || migration.version <= 0) {
    throw new TypeError("Migration version must be a positive integer.");
  }

  if (
    typeof migration.name !== "string" ||
    migration.name.trim().length === 0
  ) {
    throw new TypeError("Migration name is required.");
  }

  if (migration.name.length > 255) {
    throw new TypeError("Migration name cannot exceed 255 characters.");
  }

  if (typeof migration.up !== "function") {
    throw new TypeError(
      `Migration "${migration.name}" requires an up function.`,
    );
  }

  if (migration.down !== undefined && typeof migration.down !== "function") {
    throw new TypeError(
      `Migration "${migration.name}" has an invalid down function.`,
    );
  }
}

/**
 * Returns the latest registered migration version.
 */
export function getLatestVersion(migrations: readonly Migration[]): number {
  if (migrations.length === 0) {
    return 0;
  }

  return migrations[migrations.length - 1]!.version;
}

/**
 * Returns the current applied migration version.
 */
export function getCurrentVersion(
  migrations: readonly MigrationRecord[],
): number {
  if (migrations.length === 0) {
    return 0;
  }

  return migrations[migrations.length - 1]!.version;
}

/**
 * Quotes a validated SQL identifier.
 */
function quoteIdentifier(identifier: string): string {
  validateIdentifier(identifier, "identifier");

  return `"${identifier}"`;
}

/**
 * Validates an SQL identifier.
 */
function validateIdentifier(identifier: string, name: string): void {
  if (
    typeof identifier !== "string" ||
    !/^[A-Za-z_][A-Za-z0-9_]*$/.test(identifier)
  ) {
    throw new TypeError(`Invalid ${name}: "${identifier}".`);
  }
}

/**
 * Creates a deterministic signed 64-bit advisory lock key.
 */
function hashLockKey(value: string): bigint {
  let hash = 1469598103934665603n;

  const bytes = new TextEncoder().encode(value);

  for (const byte of bytes) {
    hash ^= BigInt(byte);

    hash = BigInt.asIntN(64, hash * 1099511628211n);
  }

  return BigInt.asIntN(64, hash);
}
