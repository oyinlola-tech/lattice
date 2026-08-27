import type {
  PaginationInput,
  PaginationMeta,
  PaginatedResult,
} from "./types";

/**
 * Default pagination values.
 */
export const DEFAULT_PAGE = 1;

export const DEFAULT_LIMIT = 20;

export const MAX_LIMIT = 100;

/**
 * Normalized pagination configuration.
 */
export interface NormalizedPagination {
  readonly page: number;
  readonly limit: number;
  readonly offset: number;
}

/**
 * Cursor pagination request.
 */
export interface CursorPaginationInput {
  readonly cursor?: string | null;
  readonly limit?: number;
}

/**
 * Cursor pagination metadata.
 */
export interface CursorPaginationMeta {
  readonly limit: number;
  readonly hasNextPage: boolean;
  readonly hasPreviousPage: boolean;
  readonly nextCursor?: string;
  readonly previousCursor?: string;
}

/**
 * Cursor paginated result.
 */
export interface CursorPaginatedResult<
  TEntity,
> {
  readonly data: readonly TEntity[];
  readonly meta: CursorPaginationMeta;
}

/**
 * Normalizes page and limit values.
 */
export function normalizePagination(
  input?: PaginationInput,
): NormalizedPagination {
  const page =
    normalizePage(
      input?.page,
    );

  const limit =
    normalizeLimit(
      input?.limit,
    );

  return {
    page,
    limit,
    offset:
      calculateOffset(
        page,
        limit,
      ),
  };
}

/**
 * Normalizes a page number.
 */
export function normalizePage(
  page?: number,
): number {
  if (
    page === undefined ||
    !Number.isFinite(page)
  ) {
    return DEFAULT_PAGE;
  }

  return Math.max(
    1,
    Math.floor(page),
  );
}

/**
 * Normalizes a page size.
 */
export function normalizeLimit(
  limit?: number,
): number {
  if (
    limit === undefined ||
    !Number.isFinite(limit)
  ) {
    return DEFAULT_LIMIT;
  }

  return Math.min(
    MAX_LIMIT,
    Math.max(
      1,
      Math.floor(limit),
    ),
  );
}

/**
 * Calculates the database offset for a page.
 */
export function calculateOffset(
  page: number,
  limit: number,
): number {
  return (
    (normalizePage(page) - 1) *
    normalizeLimit(limit)
  );
}

/**
 * Calculates the total number of pages.
 */
export function calculateTotalPages(
  total: number,
  limit: number,
): number {
  const normalizedTotal =
    Math.max(
      0,
      Math.floor(total),
    );

  const normalizedLimit =
    normalizeLimit(
      limit,
    );

  if (
    normalizedTotal === 0
  ) {
    return 0;
  }

  return Math.ceil(
    normalizedTotal /
      normalizedLimit,
  );
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
    normalizePage(page);

  const normalizedLimit =
    normalizeLimit(limit);

  const normalizedTotal =
    Math.max(
      0,
      Math.floor(total),
    );

  const totalPages =
    calculateTotalPages(
      normalizedTotal,
      normalizedLimit,
    );

  return {
    page:
      normalizedPage,
    limit:
      normalizedLimit,
    total:
      normalizedTotal,
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
 * Creates a paginated result.
 */
export function createPaginatedResult<
  TEntity,
>(
  data: readonly TEntity[],
  page: number,
  limit: number,
  total: number,
): PaginatedResult<TEntity> {
  return {
    data: [
      ...data,
    ],
    meta:
      createPaginationMeta(
        page,
        limit,
        total,
      ),
  };
}

/**
 * Gets the next page number.
 */
export function getNextPage(
  meta: PaginationMeta,
): number | null {
  if (
    !meta.hasNextPage
  ) {
    return null;
  }

  return meta.page + 1;
}

/**
 * Gets the previous page number.
 */
export function getPreviousPage(
  meta: PaginationMeta,
): number | null {
  if (
    !meta.hasPreviousPage
  ) {
    return null;
  }

  return Math.max(
    1,
    meta.page - 1,
  );
}

/**
 * Checks whether a page number is valid for the result set.
 */
export function isValidPage(
  page: number,
  totalPages: number,
): boolean {
  if (
    !Number.isFinite(page) ||
    !Number.isFinite(
      totalPages,
    )
  ) {
    return false;
  }

  const normalizedPage =
    Math.floor(page);

  const normalizedTotalPages =
    Math.max(
      0,
      Math.floor(totalPages),
    );

  if (
    normalizedTotalPages ===
    0
  ) {
    return normalizedPage ===
      1;
  }

  return (
    normalizedPage >= 1 &&
    normalizedPage <=
      normalizedTotalPages
  );
}

/**
 * Calculates the item range represented by a page.
 *
 * For example, page 2 with a limit of 20 and total of 55 returns
 * `{ start: 21, end: 40 }`.
 */
export function getItemRange(
  page: number,
  limit: number,
  total: number,
): {
  readonly start: number;
  readonly end: number;
} {
  const normalizedPage =
    normalizePage(page);

  const normalizedLimit =
    normalizeLimit(limit);

  const normalizedTotal =
    Math.max(
      0,
      Math.floor(total),
    );

  if (
    normalizedTotal === 0
  ) {
    return {
      start: 0,
      end: 0,
    };
  }

  const start =
    calculateOffset(
      normalizedPage,
      normalizedLimit,
    ) + 1;

  const end = Math.min(
    start +
      normalizedLimit -
      1,
    normalizedTotal,
  );

  if (
    start >
    normalizedTotal
  ) {
    return {
      start:
        normalizedTotal,
      end:
        normalizedTotal,
    };
  }

  return {
    start,
    end,
  };
}

/**
 * Applies offset pagination to an in-memory collection.
 *
 * This is useful for adapters and tests that need the same pagination
 * semantics without querying the database directly.
 */
export function paginateCollection<
  TEntity,
>(
  items: readonly TEntity[],
  input?: PaginationInput,
): PaginatedResult<TEntity> {
  const pagination =
    normalizePagination(
      input,
    );

  const total =
    items.length;

  const data =
    items.slice(
      pagination.offset,
      pagination.offset +
        pagination.limit,
    );

  return createPaginatedResult(
    data,
    pagination.page,
    pagination.limit,
    total,
  );
}

/**
 * Normalizes cursor pagination input.
 */
export function normalizeCursorPagination(
  input?: CursorPaginationInput,
): Required<
  Pick<
    CursorPaginationInput,
    "limit"
  >
> &
  Pick<
    CursorPaginationInput,
    "cursor"
  > {
  return {
    cursor:
      input?.cursor ??
      null,
    limit:
      normalizeLimit(
        input?.limit,
      ),
  };
}

/**
 * Creates cursor pagination metadata.
 */
export function createCursorPaginationMeta(
  limit: number,
  options: {
    readonly hasNextPage: boolean;
    readonly hasPreviousPage?: boolean;
    readonly nextCursor?: string | null;
    readonly previousCursor?: string | null;
  },
): CursorPaginationMeta {
  return {
    limit:
      normalizeLimit(limit),
    hasNextPage:
      options.hasNextPage,
    hasPreviousPage:
      options.hasPreviousPage ??
      false,
    nextCursor:
      options.nextCursor ??
      undefined,
    previousCursor:
      options.previousCursor ??
      undefined,
  };
}

/**
 * Creates a cursor paginated result.
 */
export function createCursorPaginatedResult<
  TEntity,
>(
  data: readonly TEntity[],
  limit: number,
  options: {
    readonly hasNextPage: boolean;
    readonly hasPreviousPage?: boolean;
    readonly nextCursor?: string | null;
    readonly previousCursor?: string | null;
  },
): CursorPaginatedResult<TEntity> {
  return {
    data: [
      ...data,
    ],
    meta:
      createCursorPaginationMeta(
        limit,
        options,
      ),
  };
}

/**
 * Encodes a cursor value.
 */
export function encodeCursor(
  value: unknown,
): string {
  const serialized =
    JSON.stringify(value);

  if (
    typeof serialized !==
    "string"
  ) {
    throw new TypeError(
      "Cursor value could not be serialized.",
    );
  }

  return Buffer.from(
    serialized,
    "utf8",
  ).toString(
    "base64url",
  );
}

/**
 * Decodes a cursor value.
 */
export function decodeCursor<T = unknown>(
  cursor: string,
): T {
  if (
    typeof cursor !==
      "string" ||
    cursor.trim().length ===
      0
  ) {
    throw new TypeError(
      "A cursor value is required.",
    );
  }

  try {
    const decoded =
      Buffer.from(
        cursor,
        "base64url",
      ).toString(
        "utf8",
      );

    return JSON.parse(
      decoded,
    ) as T;
  } catch (error) {
    throw new TypeError(
      "Invalid pagination cursor.",
      {
        cause: error,
      },
    );
  }
}