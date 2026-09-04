import { DatabaseError } from "@zudojs/errors";

import type {
  DatabaseOperationOptions,
  PaginatedResult,
  PaginationInput,
  PaginationMeta,
  QueryOptions,
  Repository,
  SortInput,
} from "../databaseType/databaseType.type.js";

/**
 * Generic Prisma-style delegate contract.
 *
 * This keeps the repository base class independent from generated
 * Prisma model types while still supporting standard CRUD operations.
 */
export interface RepositoryDelegate<
  TEntity,
  TId = string,
  TCreateInput = Partial<TEntity>,
  TUpdateInput = Partial<TEntity>,
  TWhereInput = unknown,
> {
  findUnique(args: { where: unknown }): Promise<TEntity | null>;

  findFirst(args: { where?: TWhereInput }): Promise<TEntity | null>;

  findMany(args?: {
    where?: TWhereInput;
    skip?: number;
    take?: number;
    orderBy?: unknown;
  }): Promise<readonly TEntity[]>;

  create(args: { data: TCreateInput }): Promise<TEntity>;

  update(args: { where: unknown; data: TUpdateInput }): Promise<TEntity>;

  delete(args: { where: unknown }): Promise<TEntity>;

  count(args?: { where?: TWhereInput }): Promise<number>;

  upsert?(args: {
    where: unknown;
    create: TCreateInput;
    update: TUpdateInput;
  }): Promise<TEntity>;
}

/**
 * Options for constructing a repository.
 */
export interface BaseRepositoryOptions {
  readonly modelName?: string;
}

/**
 * Generic base repository implementation.
 *
 * Concrete repositories should extend this class and provide the
 * appropriate Prisma delegate plus any domain-specific behavior.
 */
export abstract class BaseRepository<
  TEntity,
  TId = string,
  TCreateInput = Partial<TEntity>,
  TUpdateInput = Partial<TEntity>,
  TWhereInput = Record<string, unknown>,
> implements Repository<TEntity, TId, TCreateInput, TUpdateInput, TWhereInput> {
  protected readonly delegate: RepositoryDelegate<
    TEntity,
    TId,
    TCreateInput,
    TUpdateInput,
    TWhereInput
  >;

  protected readonly modelName: string;

  constructor(
    delegate: RepositoryDelegate<
      TEntity,
      TId,
      TCreateInput,
      TUpdateInput,
      TWhereInput
    >,
    options: BaseRepositoryOptions = {},
  ) {
    if (!delegate) {
      throw new TypeError("A repository delegate is required.");
    }

    this.delegate = delegate;

    this.modelName = options.modelName ?? "DatabaseEntity";
  }

  /**
   * Finds an entity by its primary identifier.
   */
  public async findById(
    id: TId,
    options?: DatabaseOperationOptions,
  ): Promise<TEntity | null> {
    this.validateId(id);

    return this.execute(
      "findById",
      () =>
        this.delegate.findUnique({
          where: {
            id,
          },
        }),
      options,
    );
  }

  /**
   * Finds the first entity matching a filter.
   */
  public async findOne(
    filter: TWhereInput,
    options?: DatabaseOperationOptions,
  ): Promise<TEntity | null> {
    this.validateFilter(filter);

    return this.execute(
      "findOne",
      () =>
        this.delegate.findFirst({
          where: filter,
        }),
      options,
    );
  }

  /**
   * Finds all entities matching a filter.
   */
  public async findMany(
    filter?: TWhereInput,
    options?: DatabaseOperationOptions,
  ): Promise<readonly TEntity[]> {
    if (filter !== undefined) {
      this.validateFilter(filter);
    }

    return this.execute(
      "findMany",
      () =>
        this.delegate.findMany({
          where: filter,
        }),
      options,
    );
  }

  /**
   * Finds entities using pagination and sorting.
   */
  public async findPaginated<TField extends string = string>(
    filter?: TWhereInput,
    options?: QueryOptions<TField>,
  ): Promise<PaginatedResult<TEntity>> {
    if (filter !== undefined) {
      this.validateFilter(filter);
    }

    const pagination = options?.pagination;

    const page = normalizePage(pagination);

    const limit = normalizeLimit(pagination);

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.execute(
        "findMany",
        () =>
          this.delegate.findMany({
            where: filter,
            skip,
            take: limit,
            orderBy: this.buildOrderBy(options?.sort),
          }),
        options,
      ),
      this.count(filter, options),
    ]);

    return {
      data,
      meta: createPaginationMeta(page, limit, total),
    };
  }

  /**
   * Creates a new entity.
   */
  public async create(
    input: TCreateInput,
    options?: DatabaseOperationOptions,
  ): Promise<TEntity> {
    if (input === undefined || input === null) {
      throw new DatabaseError(
        `Cannot create ${this.modelName}: input is required.`,
      );
    }

    return this.execute(
      "create",
      () =>
        this.delegate.create({
          data: input,
        }),
      options,
    );
  }

  /**
   * Updates an entity by its identifier.
   */
  public async update(
    id: TId,
    input: TUpdateInput,
    options?: DatabaseOperationOptions,
  ): Promise<TEntity> {
    this.validateId(id);

    if (input === undefined || input === null) {
      throw new DatabaseError(
        `Cannot update ${this.modelName}: input is required.`,
      );
    }

    return this.execute(
      "update",
      () =>
        this.delegate.update({
          where: {
            id,
          },
          data: input,
        }),
      options,
    );
  }

  /**
   * Deletes an entity by its identifier.
   */
  public async delete(
    id: TId,
    options?: DatabaseOperationOptions,
  ): Promise<void> {
    this.validateId(id);

    await this.execute(
      "delete",
      () =>
        this.delegate.delete({
          where: {
            id,
          },
        }),
      options,
    );
  }

  /**
   * Checks whether an entity exists.
   */
  public async exists(
    filter: TWhereInput,
    options?: DatabaseOperationOptions,
  ): Promise<boolean> {
    this.validateFilter(filter);

    const entity = await this.execute(
      "exists",
      () =>
        this.delegate.findFirst({
          where: filter,
        }),
      options,
    );

    return entity !== null;
  }

  /**
   * Counts entities matching a filter.
   */
  public async count(
    filter?: TWhereInput,
    options?: DatabaseOperationOptions,
  ): Promise<number> {
    if (filter !== undefined) {
      this.validateFilter(filter);
    }

    return this.execute(
      "count",
      () =>
        this.delegate.count({
          where: filter,
        }),
      options,
    );
  }

  /**
   * Updates an entity if it exists, otherwise creates it.
   */
  public async upsert(
    where: unknown,
    create: TCreateInput,
    update: TUpdateInput,
    options?: DatabaseOperationOptions,
  ): Promise<TEntity> {
    if (typeof this.delegate.upsert !== "function") {
      throw new DatabaseError(`Upsert is not supported by ${this.modelName}.`);
    }

    return this.execute(
      "upsert",
      () =>
        this.delegate.upsert!({
          where,
          create,
          update,
        }),
      options,
    );
  }

  /**
   * Executes a repository operation and normalizes database failures.
   */
  protected async execute<TResult>(
    operation: string,
    callback: () => Promise<TResult>,
    options?: DatabaseOperationOptions,
  ): Promise<TResult> {
    if (options?.signal?.aborted) {
      throw new DatabaseError(`${this.modelName} ${operation} was aborted.`);
    }

    const startedAt = Date.now();

    try {
      const promise = callback();

      if (options?.timeoutMs && options.timeoutMs > 0) {
        return await withTimeout(
          promise,
          options.timeoutMs,
          `${this.modelName} ${operation} timed out.`,
        );
      }

      return await promise;
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }

      throw new DatabaseError(
        error instanceof Error
          ? error.message
          : `${this.modelName} ${operation} failed.`,
        {
          cause: error,
          metadata: {
            model: this.modelName,
            operation,
            durationMs: Date.now() - startedAt,
            ...(options?.metadata ?? {}),
          },
        },
      );
    }
  }

  /**
   * Validates an entity identifier.
   */
  protected validateId(id: TId): void {
    if (
      id === undefined ||
      id === null ||
      (typeof id === "string" && id.trim().length === 0)
    ) {
      throw new DatabaseError(`${this.modelName} identifier is required.`);
    }
  }

  /**
   * Validates a repository filter.
   */
  protected validateFilter(filter: TWhereInput): void {
    if (filter === undefined || filter === null) {
      throw new DatabaseError(`${this.modelName} filter is required.`);
    }
  }

  /**
   * Converts generic sort definitions into Prisma-compatible orderBy.
   */
  protected buildOrderBy<TField extends string>(
    sort?: readonly SortInput<TField>[],
  ): ReadonlyArray<Record<string, string>> | undefined {
    if (!sort || sort.length === 0) {
      return undefined;
    }

    return sort.map((entry) => ({
      [entry.field]: entry.direction,
    }));
  }
}

/**
 * Creates pagination metadata.
 */
function createPaginationMeta(
  page: number,
  limit: number,
  total: number,
): PaginationMeta {
  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: totalPages > 0 && page < totalPages,
    hasPreviousPage: page > 1 && totalPages > 0,
  };
}

/**
 * Normalizes a requested page number.
 */
function normalizePage(input?: PaginationInput): number {
  return Math.max(1, Math.floor(input?.page ?? 1));
}

/**
 * Normalizes a requested page size.
 */
function normalizeLimit(input?: PaginationInput): number {
  return Math.min(100, Math.max(1, Math.floor(input?.limit ?? 20)));
}

/**
 * Resolves an operation with a timeout.
 */
async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  message: string,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;

  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new DatabaseError(message)), timeoutMs);
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timer!);
  }
}
