/**
 * @zudojs/rpc/constants
 *
 * Shared constants for the RPC package.
 */

/**
 * Default timeout for RPC operations (30 seconds).
 */
export const DEFAULT_RPC_TIMEOUT = 30_000;

/**
 * Maximum payload size for RPC messages (1MB).
 */
export const MAX_RPC_PAYLOAD_SIZE = 1024 * 1024;

/**
 * Maximum number of pending requests allowed in the client.
 */
export const MAX_PENDING_REQUESTS = 1024;

/**
 * Maximum number of middleware entries allowed in a stack.
 */
export const MAX_MIDDLEWARE = 32;

/**
 * Maximum number of procedures allowed in a registry.
 */
export const MAX_PROCEDURES = 4096;

/**
 * Procedure name pattern: dot-separated lowercase identifiers.
 */
export const PROCEDURE_NAME_PATTERN =
  /^[a-z][a-zA-Z0-9]*(\.[a-z][a-zA-Z0-9]*)+$/;
