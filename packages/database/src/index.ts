/**
 * @oyinlola141/lattice-database
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

// Types
export type {
  DatabaseOperationOptions,
  DatabaseStatus,
  TransactionIsolationLevel,
  DatabaseOperation,
  DatabaseConnectionOptions,
  DatabaseHealth as DatabaseHealthInfo,
  DatabaseMetrics,
  TransactionOptions,
  TransactionCallback,
  Repository,
  PaginationInput,
  PaginationMeta,
  PaginatedResult,
  SortDirection,
  SortInput,
  QueryOptions,
  DatabaseEntity,
  SoftDeletableEntity,
  AuditableEntity,
  DatabaseErrorInfo,
  DatabaseLogger,
} from "./databaseType/index.js";

export { noopDatabaseLogger } from "./databaseType/index.js";

// Client
export {
  DatabaseClient,
  createDatabaseClient,
  type DatabaseClientOptions,
  type DatabaseTransactionContext,
} from "./databaseClient/index.js";

// Connection
export {
  DatabaseConnectionManager,
  createConnectionManager,
  type DatabaseConnectionEvent,
  type DatabaseConnectionListener,
  type DatabaseConnectionEventDetails,
  type DatabaseConnectionManagerOptions,
} from "./databaseConnection/index.js";

// Database facade
export {
  Database,
  createDatabase,
  getDatabase,
  connectDatabase,
  disconnectDatabase,
  resetDatabase,
} from "./database/index.js";

// Repository
export {
  BaseRepository,
  type RepositoryDelegate,
  type BaseRepositoryOptions,
} from "./repository/index.js";

// Transactions
export {
  TransactionManager,
  createTransactionManager,
  withTransaction,
  withTransactionRetry,
  createTransactionContext,
  createTransactionId,
  isTransactionActive,
  isTransactionCommitted,
  isTransactionFailed,
  type TransactionStatus,
  type TransactionContext,
  type ManagedTransactionOptions,
} from "./transaction/index.js";

// Unit of Work
export {
  DatabaseUnitOfWork,
  createUnitOfWork,
  executeUnitOfWork,
  type UnitOfWork,
  type UnitOfWorkOptions,
} from "./unitOfWork/index.js";

// Query Builder
export {
  QueryBuilder,
  createQueryBuilder,
  type QueryCondition,
  type QueryFilter,
  type QueryOperator,
  type QueryBuilderState,
} from "./queryBuilder/index.js";

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
} from "./queryBuilder/index.js";

// Pagination
export {
  normalizePagination,
  normalizePage,
  normalizeLimit,
  calculateOffset,
  calculateTotalPages,
  createPaginationMeta,
  createPaginatedResult,
  getNextPage,
  getPreviousPage,
  isValidPage,
  getItemRange,
  paginateCollection,
  encodeCursor,
  decodeCursor,
  normalizeCursorPagination,
  createCursorPaginationMeta,
  createCursorPaginatedResult,
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  MAX_LIMIT,
  type NormalizedPagination,
  type CursorPaginationInput,
  type CursorPaginationMeta,
  type CursorPaginatedResult,
} from "./pagination/index.js";

// Relations
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
  type RelationDefinition,
  type RelationType,
  type RelationLoadOptions,
  type RelationInclude,
} from "./relations/index.js";

// Locks
export {
  DatabaseLockManager,
  createLockManager,
  acquireAdvisoryLock,
  lockRow,
  buildLockClause,
  normalizeAdvisoryKey,
  type DatabaseLockMode,
  type DatabaseLockOptions,
  type DatabaseLockResult,
} from "./locks/index.js";

// Cache
export {
  MemoryDatabaseCache,
  createDatabaseCache,
  createCacheKey,
  serializeCachePart,
  getOrSet,
  invalidateByPrefix,
  type CacheEntry,
  type CacheOptions,
  type CacheStats,
  type DatabaseCache,
} from "./cache/index.js";

// Migrations
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
} from "./migration/index.js";

// Seeds
export {
  SeedRunner,
  createSeedRunner,
  normalizeSeeds,
  validateSeed,
  DEFAULT_SEED_TABLE,
  DEFAULT_SEED_LOCK,
  type Seed,
  type SeedRecord,
  type SeedResult,
  type SeedRunnerOptions,
} from "./seed/index.js";

// Health
export {
  checkDatabaseHealth,
  checkDatabaseReadiness,
  assertDatabaseHealth,
  isDatabaseHealthy,
  DEFAULT_HEALTH_TIMEOUT_MS,
  type DatabaseHealthStatus,
  type DatabaseHealth,
  type DatabaseHealthOptions,
  type DatabaseReadiness,
} from "./health/index.js";
