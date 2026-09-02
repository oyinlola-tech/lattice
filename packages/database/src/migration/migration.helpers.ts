import type { Migration, MigrationRecord } from "./migration.types.js";

/**
 * Default migration table.
 */
export const DEFAULT_MIGRATION_TABLE = "_migrations";

/**
 * Default migration advisory lock.
 */
export const DEFAULT_MIGRATION_LOCK = "database:migrations";

/**
 * Normalizes and validates migrations.
 */
export function normalizeMigrations(migrations: readonly Migration[]): readonly Migration[] {
  if (!Array.isArray(migrations)) {
    throw new TypeError("Migrations must be an array.");
  }

  const normalized = migrations
    .map((migration) => {
      validateMigration(migration);
      return Object.freeze({ ...migration });
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
  if (typeof migration.name !== "string" || migration.name.trim().length === 0) {
    throw new TypeError("Migration name is required.");
  }
  if (migration.name.length > 255) {
    throw new TypeError("Migration name cannot exceed 255 characters.");
  }
  if (typeof migration.up !== "function") {
    throw new TypeError(`Migration "${migration.name}" requires an up function.`);
  }
  if (migration.down !== undefined && typeof migration.down !== "function") {
    throw new TypeError(`Migration "${migration.name}" has an invalid down function.`);
  }
}

/**
 * Returns the latest registered migration version.
 */
export function getLatestVersion(migrations: readonly Migration[]): number {
  if (migrations.length === 0) return 0;
  return migrations[migrations.length - 1]!.version;
}

/**
 * Returns the current applied migration version.
 */
export function getCurrentVersion(migrations: readonly MigrationRecord[]): number {
  if (migrations.length === 0) return 0;
  return migrations[migrations.length - 1]!.version;
}

/**
 * Quotes a validated SQL identifier.
 */
export function quoteIdentifier(identifier: string): string {
  validateIdentifier(identifier, "identifier");
  return `"${identifier}"`;
}

/**
 * Validates an SQL identifier.
 */
export function validateIdentifier(identifier: string, name: string): void {
  if (typeof identifier !== "string" || !/^[A-Za-z_][A-Za-z0-9_]*$/.test(identifier)) {
    throw new TypeError(`Invalid ${name}: "${identifier}".`);
  }
}

/**
 * Creates a deterministic signed 64-bit advisory lock key.
 */
export function hashLockKey(value: string): bigint {
  let hash = 1469598103934665603n;
  const bytes = new TextEncoder().encode(value);
  for (const byte of bytes) {
    hash ^= BigInt(byte);
    hash = BigInt.asIntN(64, hash * 1099511628211n);
  }
  return BigInt.asIntN(64, hash);
}
