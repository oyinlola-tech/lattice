import type { DatabaseTransactionContext } from "../databaseClient/databaseClient.core.js";

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
