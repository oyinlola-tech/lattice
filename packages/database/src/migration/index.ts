/**
 * @zudojs/database — Migrations
 *
 * Database migration runner with version tracking.
 */

export {
  MigrationRunner,
  createMigrationRunner,
  normalizeMigrations,
  validateMigration,
  getLatestVersion,
  getCurrentVersion,
  DEFAULT_MIGRATION_TABLE,
  DEFAULT_MIGRATION_LOCK,
  type Migration,
  type MigrationRecord,
  type MigrationResult,
  type MigrationStatus,
  type MigrationRunnerOptions,
} from "./migration.runner.js";
