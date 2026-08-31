/**
 * Validation limit constants.
 *
 * @module validation/validation
 */

/**
 * Maximum allowed lengths for common fields.
 */
export const ValidationLength = Object.freeze({
  /** Short identifier (e.g. slug, code) */
  SHORT: 64,
  /** Standard name field */
  NAME: 128,
  /** Email address */
  EMAIL: 255,
  /** Display name or title */
  DISPLAY: 255,
  /** Short description */
  DESCRIPTION_SHORT: 500,
  /** Long description or text body */
  DESCRIPTION_LONG: 5_000,
  /** URL */
  URL: 2_048,
  /** Password */
  PASSWORD: 128,
  /** Full text content */
  FULL_TEXT: 50_000,
} as const);

/**
 * Numeric range limits for validation.
 */
export const ValidationRange = Object.freeze({
  /** Minimum port number */
  MIN_PORT: 1,
  /** Maximum port number */
  MAX_PORT: 65_535,
  /** Minimum percentage */
  MIN_PERCENTAGE: 0,
  /** Maximum percentage */
  MAX_PERCENTAGE: 100,
  /** Minimum page number (1-based) */
  MIN_PAGE: 1,
  /** Maximum page size */
  MAX_PAGE_SIZE: 100,
  /** Minimum pagination offset */
  MIN_OFFSET: 0,
  /** Maximum timeout in seconds */
  MAX_TIMEOUT_SECONDS: 3_600,
  /** Minimum retry count */
  MIN_RETRIES: 0,
  /** Maximum retry count */
  MAX_RETRIES: 10,
} as const);
