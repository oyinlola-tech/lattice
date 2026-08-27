/**
 * @lattice/database
 *
 * Shared database infrastructure for the Lattice platform.
 *
 * This package provides:
 *   • Database client and connection management
 *   • Repository abstractions
 *   • Transactions and units of work
 *   • Query building and filtering
 *   • Pagination utilities
 *   • Relation definitions
 *   • Database locking
 *   • Caching
 *   • Migrations
 *   • Seed management
 *   • Health and readiness checks
 */

/*
 * Core database types.
 */
export type {
  DatabaseConfig,
  DatabaseOperationOptions,
  DatabaseResult,
  DatabaseRow,
  DatabaseTransactionOptions,
} from "./types";

/*
 * Database client and connection infrastructure.
 */
export {
  DatabaseClient,
  createDatabaseClient,
} from "./client";

export {
  Database,
  createDatabase,
} from "./database";

export {
  DatabaseConnection,
  createDatabaseConnection,
} from "./connection";

/*
 * Repository infrastructure.
 */
export {
  Repository,
  BaseRepository,
} from "./repository";

/*
 * Transaction infrastructure.
 */
export {
  UnitOfWork,
  createUnitOfWork,
} from "./unit-of-work";

export {
  Transaction,
  createTransaction,
} from "./transaction";

/*
 * Query infrastructure.
 */
export {
  QueryBuilder,
  createQueryBuilder,
} from "./query-builder";

export type {
  QueryCondition,
  QueryFilter,
  QueryOperator,
  QueryOrder,
  QueryOptions,
} from "./query-builder";

/*
 * Pagination.
 */
export {
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  createPagination,
  normalizePagination,
  getPaginationOffset,
  getTotalPages,
  hasNextPage,
  hasPreviousPage,
} from "./pagination";

export type {
  PaginationInput,
  PaginationMeta,
  PaginationResult,
} from "./pagination";

/*
 * Filter helpers.
 */
export {
  equals,
  notEquals,
  inList,
  notInList,
  lessThan,
  lessThanOrEqual,
  greaterThan,
  greaterThanOrEqual,
  contains,
  startsWith,
  endsWith,
  isNull,
  isNotNull,
  and,
  or,
  not,
  condition,
  allOf,
  anyOf,
  fromObject,
  dateRange,
  oneOf,
  noneOf,
  optionalEquals,
  optionalContains,
  hasConditions,
  flattenAnd,
  cloneFilter,
} from "./filters";

/*
 * Relations.
 */
export {
  oneToOne,
  oneToMany,
  manyToOne,
  manyToMany,
  includeRelation,
  includeRelations,
  RelationRegistry,
  createRelationRegistry,
  validateRelation,
  isRelationType,
  isCollectionRelation,
  isSingleRelation,
} from "./relations";

export type {
  RelationDefinition,
  RelationType,
  RelationLoadOptions,
  RelationInclude,
} from "./relations";

/*
 * Database locks.
 */
export {
  DatabaseLockManager,
  createLockManager,
  acquireAdvisoryLock,
  lockRow,
  buildLockClause,
  normalizeAdvisoryKey,
} from "./locks";

export type {
  DatabaseLockMode,
  DatabaseLockOptions,
  DatabaseLockResult,
} from "./locks";

/*
 * Cache.
 */
export {
  MemoryDatabaseCache,
  createDatabaseCache,
  createCacheKey,
  serializeCachePart,
  getOrSet,
  invalidateByPrefix,
} from "./cache";

export type {
  CacheEntry,
  CacheOptions,
  CacheStats,
  DatabaseCache,
} from "./cache";

/*
 * Migrations.
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
} from "./migrations";

export type {
  Migration,
  MigrationRecord,
  MigrationResult,
  MigrationStatus,
  MigrationRunnerOptions,
} from "./migrations";

/*
 * Seeds.
 */
export {
  SeedRunner,
  createSeedRunner,
  normalizeSeeds,
  validateSeed,
  DEFAULT_SEED_TABLE,
  DEFAULT_SEED_LOCK,
} from "./seed";

export type {
  Seed,
  SeedRecord,
  SeedResult,
  SeedRunnerOptions,
} from "./seed";

/*
 * Database health.
 */
export {
  checkDatabaseHealth,
  checkDatabaseReadiness,
  assertDatabaseHealth,
  isDatabaseHealthy,
  DEFAULT_HEALTH_TIMEOUT_MS,
} from "./health";

export type {
  DatabaseHealthStatus,
  DatabaseHealth,
  DatabaseHealthOptions,
  DatabaseReadiness,
} from "./health";