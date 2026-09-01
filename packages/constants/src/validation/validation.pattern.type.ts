/**
 * Common regex patterns for validation.
 *
 * @module validation/validationPattern
 */

/**
 * Pre-compiled regular expressions for common validation patterns.
 */
export const ValidationPattern = Object.freeze({
  /** RFC 5322 simplified email pattern */
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  /** UUID v4 */
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  /** IPv4 address */
  IPV4: /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/,
  /** IPv6 address (simplified) */
  IPV6: /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/,
  /** ISO 8601 date-time */
  ISO_DATE_TIME: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/,
  /** ISO 8601 date only */
  ISO_DATE: /^\d{4}-\d{2}-\d{2}$/,
  /** Alphanumeric string (no special chars) */
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
  /** Alphanumeric with hyphens and underscores */
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  /** Strong password: 8+ chars, uppercase, lowercase, digit, special */
  STRONG_PASSWORD:
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/,
  /** Hex colour code (3 or 6 digits) */
  HEX_COLOR: /^#(?:[0-9a-fA-F]{3}){1,2}$/,
  /** URL pattern (http/https) */
  URL: /^https?:\/\/[^\s/$.?#].[^\s]*$/i,
  /** Semantic version (v1.2.3) */
  SEMVER:
    /^\d+\.\d+\.\d+(?:-[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*)?(?:\+[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*)?$/,
  /** Phone number (international format with optional + prefix) */
  PHONE: /^\+?[1-9]\d{6,14}$/,
  /** File name (no path separators) */
  FILE_NAME: /^[^<>:"/\\|?*\x00-\x1f]+$/,
} as const);
