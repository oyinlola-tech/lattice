/**
 * High-level categories used to classify errors across Lattice.
 *
 * Categories describe where an error originated or what subsystem
 * is primarily responsible for handling it.
 */
export enum ErrorCategory {
  UNKNOWN = "unknown",

  VALIDATION = "validation",
  INPUT = "input",

  AUTHENTICATION = "authentication",
  AUTHORIZATION = "authorization",
  PERMISSION = "permission",

  RESOURCE = "resource",
  CONFLICT = "conflict",

  DATABASE = "database",
  CACHE = "cache",
  STORAGE = "storage",

  NETWORK = "network",
  EXTERNAL_SERVICE = "external_service",

  CONFIGURATION = "configuration",

  CRYPTOGRAPHY = "cryptography",

  FILE_SYSTEM = "file_system",

  RATE_LIMIT = "rate_limit",

  TIMEOUT = "timeout",

  BUSINESS = "business",
  OPERATION = "operation",

  SYSTEM = "system",
  INTERNAL = "internal",
  SERVICE = "service",
  CONTAINER = "container",
  MODULE = "module",
  RUNTIME = "runtime",
  EVENT = "event",
  LOGGING = "logging",
  MIDDLEWARE = "middleware",
  CQRS = "cqrs",
  MESSAGE = "message",
  QUEUE = "queue",
  JOB = "job",
  WORKER = "worker",
  API = "api",
  RPC = "rpc",
  SCHEDULER = "scheduler",
  OPENAPI = "openapi",
  PLUGIN = "plugin",
  DOCUMENTATION = "documentation",
}

/**
 * Determines whether a value is a valid error category.
 */
export function isErrorCategory(
  value: unknown,
): value is ErrorCategory {
  return (
    typeof value === "string" &&
    Object.values(
      ErrorCategory,
    ).includes(
      value as ErrorCategory,
    )
  );
}

/**
 * Converts an unknown value into a valid error category.
 */
export function normalizeErrorCategory(
  value: unknown,
  fallback: ErrorCategory =
    ErrorCategory.UNKNOWN,
): ErrorCategory {
  if (
    isErrorCategory(value)
  ) {
    return value;
  }

  return fallback;
}

/**
 * Returns whether the category represents a client-side problem.
 */
export function isClientErrorCategory(
  category: ErrorCategory,
): boolean {
  switch (category) {
    case ErrorCategory.VALIDATION:
    case ErrorCategory.INPUT:
    case ErrorCategory.AUTHENTICATION:
    case ErrorCategory.AUTHORIZATION:
    case ErrorCategory.PERMISSION:
    case ErrorCategory.RESOURCE:
    case ErrorCategory.CONFLICT:
    case ErrorCategory.RATE_LIMIT:
    case ErrorCategory.TIMEOUT:
      return true;

    default:
      return false;
  }
}

/**
 * Returns whether the category represents an infrastructure problem.
 */
export function isInfrastructureErrorCategory(
  category: ErrorCategory,
): boolean {
  switch (category) {
    case ErrorCategory.DATABASE:
    case ErrorCategory.CACHE:
    case ErrorCategory.STORAGE:
    case ErrorCategory.NETWORK:
    case ErrorCategory.EXTERNAL_SERVICE:
    case ErrorCategory.FILE_SYSTEM:
    case ErrorCategory.CONFIGURATION:
    case ErrorCategory.SYSTEM:
    case ErrorCategory.INTERNAL:
      return true;

    default:
      return false;
  }
}

/**
 * Returns whether the category is related to security.
 */
export function isSecurityErrorCategory(
  category: ErrorCategory,
): boolean {
  switch (category) {
    case ErrorCategory.AUTHENTICATION:
    case ErrorCategory.AUTHORIZATION:
    case ErrorCategory.PERMISSION:
    case ErrorCategory.CRYPTOGRAPHY:
      return true;

    default:
      return false;
  }
}

/**
 * Returns whether the category is normally safe to expose directly
 * to an API consumer.
 */
export function isPublicErrorCategory(
  category: ErrorCategory,
): boolean {
  switch (category) {
    case ErrorCategory.VALIDATION:
    case ErrorCategory.INPUT:
    case ErrorCategory.AUTHENTICATION:
    case ErrorCategory.AUTHORIZATION:
    case ErrorCategory.PERMISSION:
    case ErrorCategory.RESOURCE:
    case ErrorCategory.CONFLICT:
    case ErrorCategory.RATE_LIMIT:
    case ErrorCategory.TIMEOUT:
    case ErrorCategory.BUSINESS:
      return true;

    default:
      return false;
  }
}