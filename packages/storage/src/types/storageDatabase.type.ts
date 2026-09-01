/**
 * Database types for the storage package.
 */

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
  "read-uncommitted" | "read-committed" | "repeatable-read" | "serializable";

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
  readonly min: number;
  readonly max: number;
  readonly acquireTimeout: number;
  readonly idleTimeout: number;
  readonly connectionTimeout: number;
  readonly maxLifetime: number;
}

/** Connection pool statistics. */
export interface PoolStats {
  readonly total: number;
  readonly idle: number;
  readonly active: number;
  readonly waiting: number;
}

/** Options for starting a transaction. */
export interface TransactionOptions {
  readonly isolationLevel?: IsolationLevel;
  readonly timeout?: number;
  readonly readOnly?: boolean;
}

/** A database transaction. */
export interface Transaction {
  readonly id: string;
  readonly state: TransactionState;
  query<T = Record<string, unknown>>(query: Query): Promise<QueryResult<T>>;
  execute(query: Query): Promise<ExecuteResult>;
  savepoint(name: string): Promise<void>;
  rollbackToSavepoint(name: string): Promise<void>;
}

/** Database abstraction interface. */
export interface Database {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  query<T = Record<string, unknown>>(query: Query): Promise<QueryResult<T>>;
  execute(query: Query): Promise<ExecuteResult>;
  transaction<T>(
    callback: (tx: Transaction) => Promise<T>,
    options?: TransactionOptions,
  ): Promise<T>;
  healthCheck(): Promise<StorageHealth>;
  getPoolStats(): PoolStats;
}

/** Health status of a storage component. */
export interface StorageHealth {
  readonly healthy: boolean;
  readonly latencyMs: number;
  readonly status: string;
  readonly details?: Record<string, unknown>;
}
