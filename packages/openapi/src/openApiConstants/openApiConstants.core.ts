/**
 * @oyinlola141/lattice-openapi/openApiConstants
 *
 * Shared constants for OpenAPI generation.
 */

/**
 * Default OpenAPI specification version.
 */
export const DEFAULT_OPENAPI_VERSION = "3.1.0" as const;

/**
 * Maximum operation ID length allowed by OpenAPI.
 */
export const MAX_OPERATION_ID_LENGTH = 128;

/**
 * Component reference prefix.
 */
export const COMPONENT_REF_PREFIX = "#/components";

/**
 * Default media type for request/response bodies.
 */
export const DEFAULT_MEDIA_TYPE = "application/json";

/**
 * Status code categories.
 */
export const STATUS_CODE_CATEGORIES = {
  INFORMATIONAL: "1XX",
  SUCCESS: "2XX",
  REDIRECT: "3XX",
  CLIENT_ERROR: "4XX",
  SERVER_ERROR: "5XX",
} as const;

/**
 * Default server URL.
 */
export const DEFAULT_SERVER_URL = "http://localhost";

/**
 * Cache TTL for generated documents (5 minutes).
 */
export const DOCUMENT_CACHE_TTL_MS = 5 * 60 * 1000;
