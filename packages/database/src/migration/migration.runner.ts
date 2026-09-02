import { DatabaseError } from "@oyinlola141/lattice-errors";
import type { DatabaseClient, DatabaseTransactionContext } from "../databaseClient/databaseClient.core.js";
import { Prisma } from "@prisma/client";

import type { Migration, MigrationRecord, MigrationRunnerOptions } from "./migration.types.js";
import {
  DEFAULT_MIGRATION_TABLE,
  DEFAULT_MIGRATION_LOCK,
  normalizeMigrations,
  getCurrentVersion,
  getLatestVersion,
  quoteIdentifier,
  hashLockKey,
} from "./migration.helpers.js";

export * from "./migration.types.js";
export {
  DEFAULT_MIGRATION_TABLE,
  DEFAULT_MIGRATION_LOCK,
  normalizeMigrations,
  getCurrentVersion,
  getLatestVersion,
  validateMigration,
} from "./migration.helpers.js";

/**
 * Runs and tracks database migrations.
 */
export class MigrationRunner {
  private readonly client: DatabaseClient;
  private readonly migrations: readonly Migration[];
  private readonly tableName: string;
  private readonly lockKey: string;

  constructor(client: DatabaseClient, migrations: readonly Migration[], options: MigrationRunnerOptions = {}) {
    if (!client) throw new TypeError("A database client is required.");
    this.client = client;
    this.migrations = normalizeMigrations(migrations);
    this.tableName = options.tableName ?? DEFAULT_MIGRATION_TABLE;
    this.lockKey = options.lockKey ?? DEFAULT_MIGRATION_LOCK;
    this.validateTableName();
  }

  private validateTableName(): void {
    const validateIdentifier = (id: string, name: string): void => {
      if (typeof id !== "string" || !/^[A-Za-z_][A-Za-z0-9_]*$/.test(id)) {
        throw new TypeError(`Invalid ${name}: "${id}".`);
      }
    };
    validateIdentifier(this.tableName, "migration table name");
  }

  public async status(): Promise<import("./migration.types.js").MigrationStatus> {
    await this.ensureMigrationTable();
    const applied = await this.getAppliedMigrations();
    const appliedVersions = new Set(applied.map((m) => m.version));
    const pending = this.migrations.filter((m) => !appliedVersions.has(m.version));
    return {
      currentVersion: getCurrentVersion(applied),
      latestVersion: getLatestVersion(this.migrations),
      pending,
      applied,
    };
  }

  public async migrate(): Promise<import("./migration.types.js").MigrationResult> {
    await this.ensureMigrationTable();
    const applied = await this.getAppliedMigrations();
    const appliedVersions = new Set(applied.map((m) => m.version));
    const pending = this.migrations.filter((m) => !appliedVersions.has(m.version));
    if (pending.length === 0) return { applied: [], skipped: applied };

    const newlyApplied: MigrationRecord[] = [];
    await this.client.transaction(async (transaction) => {
      await this.acquireMigrationLock(transaction);
      for (const migration of pending) {
        await this.executeMigration(transaction, migration);
        const record = await this.recordMigration(transaction, migration);
        newlyApplied.push(record);
      }
    });
    return { applied: newlyApplied, skipped: applied };
  }

  public async rollback(): Promise<MigrationRecord | null> {
    await this.ensureMigrationTable();
    const applied = await this.getAppliedMigrations();
    if (applied.length === 0) return null;

    const latest = applied[applied.length - 1];
    if (!latest) return null;

    const migration = this.migrations.find((c) => c.version === latest.version);
    if (!migration) {
      throw new DatabaseError(`Migration "${latest.name}" is recorded as applied but is not registered.`, {
        metadata: { version: latest.version },
      });
    }
    if (!migration.down) {
      throw new DatabaseError(`Migration "${migration.name}" does not define a rollback operation.`, {
        metadata: { version: migration.version },
      });
    }

    await this.client.transaction(async (transaction) => {
      await this.acquireMigrationLock(transaction);
      await migration.down!(transaction);
      await this.deleteMigrationRecord(transaction, migration.version);
    });
    return latest;
  }

  public async rollbackAll(): Promise<readonly MigrationRecord[]> {
    await this.ensureMigrationTable();
    const applied = await this.getAppliedMigrations();
    if (applied.length === 0) return [];

    const rolledBack: MigrationRecord[] = [];
    await this.client.transaction(async (transaction) => {
      await this.acquireMigrationLock(transaction);
      for (let index = applied.length - 1; index >= 0; index -= 1) {
        const record = applied[index];
        if (!record) continue;

        const migration = this.migrations.find((c) => c.version === record.version);
        if (!migration) {
          throw new DatabaseError(`Migration "${record.name}" is not registered.`, {
            metadata: { version: record.version },
          });
        }
        if (!migration.down) {
          throw new DatabaseError(`Migration "${migration.name}" does not define a rollback operation.`, {
            metadata: { version: migration.version },
          });
        }

        await migration.down(transaction);
        await this.deleteMigrationRecord(transaction, migration.version);
        rolledBack.push(record);
      }
    });
    return rolledBack;
  }

  public async ensureMigrationTable(): Promise<void> {
    const table = quoteIdentifier(this.tableName);
    try {
      await this.client.executeRaw(
        Prisma.sql`CREATE TABLE IF NOT EXISTS ${table} (
          "version" INTEGER PRIMARY KEY,
          "name" VARCHAR(255) NOT NULL,
          "applied_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )`,
      );
    } catch (error) {
      throw new DatabaseError("Failed to initialize the migration table.", {
        cause: error,
        metadata: { tableName: this.tableName },
      });
    }
  }

  public async getAppliedMigrations(): Promise<readonly MigrationRecord[]> {
    const table = quoteIdentifier(this.tableName);
    try {
      const rows = await this.client.queryRaw<readonly { version: number; name: string; applied_at: Date }[]>(
        Prisma.sql`SELECT "version", "name", "applied_at" FROM ${table} ORDER BY "version" ASC`,
      );
      return rows.map((row) => ({
        version: Number(row.version),
        name: row.name,
        appliedAt: new Date(row.applied_at),
      }));
    } catch (error) {
      throw new DatabaseError("Failed to read migration history.", {
        cause: error,
        metadata: { tableName: this.tableName },
      });
    }
  }

  private async executeMigration(transaction: DatabaseTransactionContext, migration: Migration): Promise<void> {
    try {
      await migration.up(transaction);
    } catch (error) {
      throw new DatabaseError(`Migration "${migration.name}" failed.`, {
        cause: error,
        metadata: { version: migration.version, name: migration.name },
      });
    }
  }

  private async recordMigration(transaction: DatabaseTransactionContext, migration: Migration): Promise<MigrationRecord> {
    const table = quoteIdentifier(this.tableName);
    try {
      await transaction.$executeRawUnsafe(
        `INSERT INTO ${table} ("version", "name") VALUES ($1, $2)`,
        migration.version,
        migration.name,
      );
      return { version: migration.version, name: migration.name, appliedAt: new Date() };
    } catch (error) {
      throw new DatabaseError(`Failed to record migration "${migration.name}".`, {
        cause: error,
        metadata: { version: migration.version },
      });
    }
  }

  private async deleteMigrationRecord(transaction: DatabaseTransactionContext, version: number): Promise<void> {
    const table = quoteIdentifier(this.tableName);
    try {
      await transaction.$executeRawUnsafe(`DELETE FROM ${table} WHERE "version" = $1`, version);
    } catch (error) {
      throw new DatabaseError(`Failed to remove migration record for version ${version}.`, {
        cause: error,
        metadata: { version },
      });
    }
  }

  private async acquireMigrationLock(transaction: DatabaseTransactionContext): Promise<void> {
    try {
      const lock = hashLockKey(this.lockKey);
      await transaction.$executeRaw`SELECT pg_advisory_xact_lock(${lock})`;
    } catch (error) {
      throw new DatabaseError("Failed to acquire the database migration lock.", {
        cause: error,
        metadata: { lockKey: this.lockKey },
      });
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
