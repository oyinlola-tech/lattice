/**
 * Database connection lifecycle states.
 */
export type DatabaseStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "disconnecting"
  | "error";

/**
 * Supported transaction isolation levels.
 */
export type TransactionIsolationLevel =
  | "ReadUncommitted"
  | "ReadCommitted"
  | "RepeatableRead"
  | "Serializable"
  | "Snapshot";

/**
 * Database operation types.
 */
export type DatabaseOperation =
  | "create"
  | "read"
  | "update"
  | "delete"
  | "upsert"
  | "count"
  | "aggregate"
  | "transaction"
  | "raw";

/**
 * Options shared by database operations.
 */
export interface DatabaseOperationOptions {
  readonly signal?: AbortSignal;
  readonly timeoutMs?: number;
  readonly metadata?: Readonly<
    Record<string, unknown>
  >;
}

/**
 * Options used when establishing a database connection.
 */
export interface DatabaseConnectionOptions {
  readonly url?: string;
  readonly connectionTimeoutMs?: number;
  readonly queryTimeoutMs?: number;
  readonly maxConnections?: number;
  readonly minConnections?: number;
  readonly ssl?: boolean;
  readonly logging?: boolean;
}

/**
 * Database health information.
 */
export interface DatabaseHealth {
  readonly status: DatabaseStatus;
  readonly latencyMs?: number;
  readonly checkedAt: Date;
  readonly error?: string;
}

/**
 * Database metrics.
 */
export interface DatabaseMetrics {
  readonly activeConnections: number;
  readonly idleConnections: number;
  readonly totalConnections: number;
  readonly totalQueries: number;
  readonly failedQueries: number;
  readonly averageQueryTimeMs: number;
}

/**
 * Transaction configuration.
 */
export interface TransactionOptions
  extends DatabaseOperationOptions {
  readonly isolationLevel?: TransactionIsolationLevel;
  readonly timeoutMs?: number;
  readonly maxWaitMs?: number;
}

/**
 * Generic transaction callback.
 */
export type TransactionCallback<
  TContext,
  TResult,
> = (
  context: TContext,
) => Promise<TResult>;

/**
 * Generic database client contract.
 *
 * Concrete implementations can wrap Prisma, another ORM, or a
 * lower-level database driver without leaking implementation details
 * throughout the application.
 */
export interface DatabaseClient<
  TTransactionContext = unknown,
> {
  connect(): Promise<void>;

  disconnect(): Promise<void>;

  ping(): Promise<void>;

  getStatus(): DatabaseStatus;

  healthCheck(): Promise<DatabaseHealth>;

  transaction<TResult>(
    callback: TransactionCallback<
      TTransactionContext,
      TResult
    >,
    options?: TransactionOptions,
  ): Promise<TResult>;
}

/**
 * Generic repository contract.
 */
export interface Repository<
  TEntity,
  TId = string,
  TCreateInput = Partial<TEntity>,
  TUpdateInput = Partial<TEntity>,
  TFilter = unknown,
> {
  findById(
    id: TId,
    options?: DatabaseOperationOptions,
  ): Promise<TEntity | null>;

  findOne(
    filter: TFilter,
    options?: DatabaseOperationOptions,
  ): Promise<TEntity | null>;

  findMany(
    filter?: TFilter,
    options?: DatabaseOperationOptions,
  ): Promise<readonly TEntity[]>;

  create(
    input: TCreateInput,
    options?: DatabaseOperationOptions,
  ): Promise<TEntity>;

  update(
    id: TId,
    input: TUpdateInput,
    options?: DatabaseOperationOptions,
  ): Promise<TEntity>;

  delete(
    id: TId,
    options?: DatabaseOperationOptions,
  ): Promise<void>;

  exists(
    filter: TFilter,
    options?: DatabaseOperationOptions,
  ): Promise<boolean>;

  count(
    filter?: TFilter,
    options?: DatabaseOperationOptions,
  ): Promise<number>;
}

/**
 * Pagination request.
 */
export interface PaginationInput {
  readonly page?: number;
  readonly limit?: number;
}

/**
 * Pagination metadata.
 */
export interface PaginationMeta {
  readonly page: number;
  readonly limit: number;
  readonly total: number;
  readonly totalPages: number;
  readonly hasNextPage: boolean;
  readonly hasPreviousPage: boolean;
}

/**
 * Paginated repository result.
 */
export interface PaginatedResult<
  TEntity,
> {
  readonly data: readonly TEntity[];
  readonly meta: PaginationMeta;
}

/**
 * Sorting direction.
 */
export type SortDirection =
  | "asc"
  | "desc";

/**
 * Generic sort definition.
 */
export interface SortInput<
  TField extends string = string,
> {
  readonly field: TField;
  readonly direction: SortDirection;
}

/**
 * Generic query options.
 */
export interface QueryOptions<
  TField extends string = string,
> extends DatabaseOperationOptions {
  readonly pagination?: PaginationInput;
  readonly sort?: readonly SortInput<TField>[];
}

/**
 * Database entity base contract.
 */
export interface DatabaseEntity<
  TId = string,
> {
  readonly id: TId;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/**
 * Soft-deletable entity contract.
 */
export interface SoftDeletableEntity
  extends DatabaseEntity {
  readonly deletedAt: Date | null;
}

/**
 * Auditable entity contract.
 */
export interface AuditableEntity
  extends DatabaseEntity {
  readonly createdBy?: string;
  readonly updatedBy?: string;
}

/**
 * Database error information.
 */
export interface DatabaseErrorInfo {
  readonly code?: string;
  readonly message: string;
  readonly operation?: DatabaseOperation;
  readonly model?: string;
  readonly field?: string;
  readonly constraint?: string;
  readonly cause?: unknown;
  readonly metadata?: Readonly<
    Record<string, unknown>
  >;
}

/**
 * Database logger contract.
 */
export interface DatabaseLogger {
  debug(
    message: string,
    metadata?: Readonly<
      Record<string, unknown>
    >,
  ): void;

  info(
    message: string,
    metadata?: Readonly<
      Record<string, unknown>
    >,
  ): void;

  warn(
    message: string,
    metadata?: Readonly<
      Record<string, unknown>
    >,
  ): void;

  error(
    message: string,
    error?: unknown,
    metadata?: Readonly<
      Record<string, unknown>
    >,
  ): void;
}

/**
 * Default no-op database logger.
 */
export const noopDatabaseLogger: DatabaseLogger =
  Object.freeze({
    debug: () => undefined,
    info: () => undefined,
    warn: () => undefined,
    error: () => undefined,
  });

/**
 * Normalizes pagination input.
 */
export function normalizePagination(
  input?: PaginationInput,
): Required<PaginationInput> {
  const page = Math.max(
    1,
    Math.floor(
      input?.page ?? 1,
    ),
  );

  const limit = Math.min(
    100,
    Math.max(
      1,
      Math.floor(
        input?.limit ?? 20,
      ),
    ),
  );

  return {
    page,
    limit,
  };
}

/**
 * Creates pagination metadata.
 */
export function createPaginationMeta(
  page: number,
  limit: number,
  total: number,
): PaginationMeta {
  const normalizedPage =
    Math.max(
      1,
      Math.floor(page),
    );

  const normalizedLimit =
    Math.max(
      1,
      Math.floor(limit),
    );

  const normalizedTotal =
    Math.max(
      0,
      Math.floor(total),
    );

  const totalPages =
    normalizedTotal === 0
      ? 0
      : Math.ceil(
          normalizedTotal /
            normalizedLimit,
        );

  return {
    page: normalizedPage,
    limit: normalizedLimit,
    total: normalizedTotal,
    totalPages,
    hasNextPage:
      totalPages > 0 &&
      normalizedPage <
        totalPages,
    hasPreviousPage:
      normalizedPage > 1 &&
      totalPages > 0,
  };
}

/**
 * Calculates the offset for a paginated query.
 */
export function getPaginationOffset(
  input?: PaginationInput,
): number {
  const {
    page,
    limit,
  } = normalizePagination(
    input,
  );

  return (
    (page - 1) *
    limit
  );
}