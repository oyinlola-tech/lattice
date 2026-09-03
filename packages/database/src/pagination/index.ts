/**
 * @zudo/database — Pagination
 *
 * Offset and cursor pagination utilities.
 */

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
} from "./pagination.core.js";
