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
