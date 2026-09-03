/**
 * @zudo/storage
 *
 * Storage infrastructure for the Zudo framework.
 *
 * Provides database, object storage, repository, serialization, locking,
 * and lifecycle abstractions with driver-independent interfaces.
 *
 * @example
 * ```ts
 * import { Database, ConnectionPool, BaseRepository } from '@zudo/storage';
 *
 * // Use database abstraction
 * const result = await database.query({ text: 'SELECT * FROM users' });
 *
 * // Use repository pattern
 * class UserRepository extends BaseRepository<User, string> {
 *   async findByEmail(email: string) {
 *     return this.database.query({
 *       text: 'SELECT * FROM users WHERE email = $1',
 *       parameters: [email],
 *     });
 *   }
 * }
 * ```
 *
 * @packageDocumentation
 */

/* ─── Types ──────────────────────────────────────────────────────────────── */
export type {
  ConnectionState,
  TransactionState,
  IsolationLevel,
  QueryParameter,
  Query,
  QueryResult,
  ExecuteResult,
  FieldInfo,
  Connection,
  ConnectionPoolOptions,
  PoolStats,
  TransactionOptions,
  Transaction,
  StorageHealth,
  Database,
  ObjectPutOptions,
  ObjectMetadata,
  ObjectData,
  ObjectStorage,
  ListObjectsResult,
  Repository,
  SerializationFormat,
  Serializer,
  Lock,
  LockOptions,
  LockManager,
  StorageLifecyclePhase,
  StorageLifecycle,
  StorageContext,
} from "./types/index.js";

export { ConnectionPool } from "./database/index.js";

export { BaseRepository } from "./repository/index.js";
export type { BaseRepositoryOptions } from "./repository/index.js";

export { LocalObjectStorage } from "./objectStorage/index.js";

export { JsonSerializer } from "./serialization/index.js";

export { InMemoryLockManager } from "./locking/index.js";

export { StorageLifecycleManager } from "./lifecycle/index.js";

export { HealthChecker } from "./health/index.js";
export type { StorageHealthReport, ComponentHealth } from "./health/index.js";
