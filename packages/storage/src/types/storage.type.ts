/**
 * @lattice/storage — Core Types
 *
 * All interfaces and type definitions for the storage infrastructure.
 */

/* ─── Database ────────────────────────────────────────────────────────────── */

/** Database connection state. */
export type ConnectionState =
  | "idle"
  | "connecting"
  | "connected"
  | "disconnecting"
  | "disconnected"
  | "error";

/** Database transaction state. */
export type TransactionState = "active" | "committed" | "rolledback" | "failed";

/** Transaction isolation levels. */
export type IsolationLevel =
  | "read-uncommitted"
  | "read-committed"
  | "repeatable-read"
  | "serializable";

/** Query parameter types. */
export type QueryParameter =
  | string
  | number
  | boolean
  | null
  | Date
  | Buffer
  | Uint8Array
  | bigint
  | QueryParameter[];

/** A SQL query with parameters. */
export interface Query {
  readonly text: string;
  readonly parameters?: readonly QueryParameter[];
}

/** Result of a query that returns rows. */
export interface QueryResult<T = Record<string, unknown>> {
  readonly rows: readonly T[];
  readonly rowCount: number;
  readonly fields: readonly FieldInfo[];
  /** Duration of the query in milliseconds. */
  readonly durationMs?: number;
}

/** Result of a command (INSERT, UPDATE, DELETE). */
export interface ExecuteResult {
  readonly rowCount: number;
  /** Duration of the command in milliseconds. */
  readonly durationMs?: number;
}

/** Field metadata from a query result. */
export interface FieldInfo {
  readonly name: string;
  readonly oid?: number;
  readonly dataType?: string;
}

/* ─── Connection ──────────────────────────────────────────────────────────── */

/** Database connection. */
export interface Connection {
  /** Unique connection identifier. */
  readonly id: string;
  /** Current connection state. */
  readonly state: ConnectionState;
  /** Execute a query that returns rows. */
  query<T = Record<string, unknown>>(query: Query): Promise<QueryResult<T>>;
  /** Execute a command (INSERT, UPDATE, DELETE). */
  execute(query: Query): Promise<ExecuteResult>;
  /** Check if the connection is alive. */
  ping(): Promise<boolean>;
  /** Gracefully close the connection. */
  close(): Promise<void>;
}

/** Options for creating a connection pool. */
export interface ConnectionPoolOptions {
  /** Minimum number of connections to maintain. */
  readonly min: number;
  /** Maximum number of connections allowed. */
  readonly max: number;
  /** Timeout in ms to acquire a connection from the pool. */
  readonly acquireTimeout: number;
  /** Timeout in ms for idle connections before release. */
  readonly idleTimeout: number;
  /** Timeout in ms for establishing a new connection. */
  readonly connectionTimeout: number;
  /** Maximum lifetime of a connection in ms (0 = unlimited). */
  readonly maxLifetime: number;
}

/** Connection pool statistics. */
export interface PoolStats {
  readonly total: number;
  readonly idle: number;
  readonly active: number;
  readonly waiting: number;
}

/* ─── Transaction ─────────────────────────────────────────────────────────── */

/** Options for starting a transaction. */
export interface TransactionOptions {
  /** Transaction isolation level. */
  readonly isolationLevel?: IsolationLevel;
  /** Timeout in ms for the transaction. */
  readonly timeout?: number;
  /** Read-only transaction flag. */
  readonly readOnly?: boolean;
}

/** A database transaction. */
export interface Transaction {
  /** Unique transaction identifier. */
  readonly id: string;
  /** Current transaction state. */
  readonly state: TransactionState;
  /** Execute a query within this transaction. */
  query<T = Record<string, unknown>>(query: Query): Promise<QueryResult<T>>;
  /** Execute a command within this transaction. */
  execute(query: Query): Promise<ExecuteResult>;
  /** Create a savepoint within this transaction. */
  savepoint(name: string): Promise<void>;
  /** Rollback to a savepoint. */
  rollbackToSavepoint(name: string): Promise<void>;
}

/* ─── Database Abstraction ────────────────────────────────────────────────── */

/** Health status of a storage component. */
export interface StorageHealth {
  readonly healthy: boolean;
  readonly latencyMs: number;
  readonly status: string;
  readonly details?: Record<string, unknown>;
}

/** Database abstraction interface. */
export interface Database {
  /** Establish database connection. */
  connect(): Promise<void>;
  /** Gracefully close all connections. */
  disconnect(): Promise<void>;
  /** Execute a query that returns rows. */
  query<T = Record<string, unknown>>(query: Query): Promise<QueryResult<T>>;
  /** Execute a command (INSERT, UPDATE, DELETE). */
  execute(query: Query): Promise<ExecuteResult>;
  /** Execute operations within a transaction. */
  transaction<T>(
    callback: (tx: Transaction) => Promise<T>,
    options?: TransactionOptions,
  ): Promise<T>;
  /** Check database health. */
  healthCheck(): Promise<StorageHealth>;
  /** Get pool statistics. */
  getPoolStats(): PoolStats;
}

/* ─── Object Storage ──────────────────────────────────────────────────────── */

/** Options for putting an object. */
export interface ObjectPutOptions {
  /** Content type of the object. */
  readonly contentType?: string;
  /** Metadata to associate with the object. */
  readonly metadata?: Record<string, string>;
  /** Cache control directive. */
  readonly cacheControl?: string;
}

/** Metadata about a stored object. */
export interface ObjectMetadata {
  /** Object key. */
  readonly key: string;
  /** Content type. */
  readonly contentType?: string;
  /** Object size in bytes. */
  readonly size: number;
  /** When the object was last modified. */
  readonly lastModified: Date;
  /** ETag for the object. */
  readonly etag?: string;
  /** Custom metadata. */
  readonly metadata?: Record<string, string>;
}

/** Data read from object storage. */
export interface ObjectData {
  /** Object metadata. */
  readonly metadata: ObjectMetadata;
  /** Object content as a readable stream. */
  readonly body: ReadableStream<Uint8Array>;
  /** Read entire content as Uint8Array (use only for small objects). */
  arrayBuffer(): Promise<ArrayBuffer>;
}

/** Object storage abstraction. */
export interface ObjectStorage {
  /** Store an object. */
  put(
    key: string,
    data: Uint8Array | ReadableStream<Uint8Array>,
    options?: ObjectPutOptions,
  ): Promise<ObjectMetadata>;
  /** Retrieve an object. */
  get(key: string): Promise<ObjectData | null>;
  /** Delete an object. */
  delete(key: string): Promise<void>;
  /** Check if an object exists. */
  exists(key: string): Promise<boolean>;
  /** Get object metadata without retrieving content. */
  metadata(key: string): Promise<ObjectMetadata | null>;
  /** List objects with a given prefix. */
  list(
    prefix?: string,
    options?: { readonly maxKeys?: number; readonly continuationToken?: string },
  ): Promise<ListObjectsResult>;
}

/** Result of listing objects. */
export interface ListObjectsResult {
  readonly objects: readonly ObjectMetadata[];
  readonly continuationToken?: string;
  readonly isTruncated: boolean;
}

/* ─── Repository ──────────────────────────────────────────────────────────── */

/** Generic repository interface for CRUD operations. */
export interface Repository<Entity, ID> {
  /** Find an entity by its ID. */
  findById(id: ID): Promise<Entity | null>;
  /** Find multiple entities by their IDs. */
  findByIds(ids: readonly ID[]): Promise<readonly Entity[]>;
  /** Create a new entity. */
  create(entity: Entity): Promise<Entity>;
  /** Update an entity by ID. */
  update(id: ID, changes: Partial<Entity>): Promise<Entity>;
  /** Delete an entity by ID. */
  delete(id: ID): Promise<void>;
  /** Check if an entity exists by ID. */
  exists(id: ID): Promise<boolean>;
}

/* ─── Serialization ───────────────────────────────────────────────────────── */

/** Serialization format. */
export type SerializationFormat = "json" | "msgpack" | "binary";

/** Serializer for encoding/decoding storage data. */
export interface Serializer {
  /** Serialize a value to bytes. */
  serialize<T>(value: T, format?: SerializationFormat): Uint8Array;
  /** Deserialize bytes to a value. */
  deserialize<T>(data: Uint8Array, format?: SerializationFormat): T;
}

/* ─── Locking ─────────────────────────────────────────────────────────────── */

/** Distributed lock. */
export interface Lock {
  /** Unique lock identifier. */
  readonly lockId: string;
  /** The resource key being locked. */
  readonly resource: string;
  /** When the lock was acquired. */
  readonly acquiredAt: Date;
  /** When the lock expires. */
  readonly expiresAt: Date;
  /** Release the lock. */
  release(): Promise<void>;
  /** Extend the lock's TTL. */
  extend(durationMs: number): Promise<void>;
}

/** Options for acquiring a lock. */
export interface LockOptions {
  /** Timeout in ms to wait for the lock. */
  readonly timeout: number;
  /** TTL in ms for the lock. */
  readonly ttl: number;
  /** Retry interval in ms. */
  readonly retryInterval?: number;
}

/** Lock manager for distributed locking. */
export interface LockManager {
  /** Acquire a lock on a resource. */
  acquire(resource: string, options?: LockOptions): Promise<Lock>;
  /** Try to acquire a lock without waiting. */
  tryAcquire(
    resource: string,
    ttlMs: number,
  ): Promise<Lock | null>;
  /** Check if a resource is locked. */
  isLocked(resource: string): Promise<boolean>;
}

/* ─── Lifecycle ───────────────────────────────────────────────────────────── */

/** Storage lifecycle phases. */
export type StorageLifecyclePhase =
  | "uninitialized"
  | "initializing"
  | "ready"
  | "draining"
  | "drained"
  | "shutdown";

/** Lifecycle hooks for storage components. */
export interface StorageLifecycle {
  /** Initialize the storage component. */
  initialize(): Promise<void>;
  /** Start accepting operations. */
  start(): Promise<void>;
  /** Check health. */
  healthCheck(): Promise<StorageHealth>;
  /** Drain in-flight operations. */
  drain(): Promise<void>;
  /** Gracefully shutdown. */
  shutdown(): Promise<void>;
  /** Get current lifecycle phase. */
  getPhase(): StorageLifecyclePhase;
}

/* ─── Storage Context ─────────────────────────────────────────────────────── */

/** Context for storage operations (carries tenant, trace, etc.). */
export interface StorageContext {
  /** Tenant identifier for multi-tenant systems. */
  readonly tenantId?: string;
  /** Trace ID for observability. */
  readonly traceId?: string;
  /** Request ID for correlation. */
  readonly requestId?: string;
  /** User ID for audit. */
  readonly userId?: string;
  /** Additional metadata. */
  readonly metadata?: Record<string, unknown>;
}
