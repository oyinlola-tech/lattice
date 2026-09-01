/**
 * Node.js HTTP adapter types and validation.
 *
 * @module httpAdapter/node/types
 */

import type { Server } from "node:http";

import type { HttpAdapterOptions } from "../http.adapter.js";

import type { TrustProxy } from "../../httpTrustProxy/httpTrustProxy.core.js";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface NodeAdapterOptions extends HttpAdapterOptions {
  readonly host?: string;

  readonly port?: number;

  readonly server?: Server;

  readonly maxBodySize?: number;

  readonly trustProxy?: boolean | number | string | readonly string[];

  readonly requestTimeout?: number;

  readonly headersTimeout?: number;

  readonly keepAliveTimeout?: number;

  readonly connectionTimeout?: number;
}

/**
 * Options for creating a Node.js request context.
 */
export interface NodeRequestOptions {
  /**
   * Maximum body size in bytes.
   */
  readonly maxBodySize?: number;

  /**
   * Trust proxy configuration for X-Forwarded-* headers.
   * - false: Never trust (default, most secure)
   * - true: Trust all (only for direct connections)
   * - number: Trust N proxies from the right
   * - string[]: Trust specific IP addresses
   */
  readonly trustProxy?: TrustProxy;
}

export interface NodeServerAddress {
  readonly host: string;

  readonly port: number;

  readonly family: string;
}

export interface NodeAdapterEvents {
  readonly onError?: (error: Error) => void;

  readonly onListening?: (address: NodeServerAddress) => void;

  readonly onClose?: () => void;
}

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

export const DEFAULT_HOST = "127.0.0.1";

export const DEFAULT_PORT = 3000;

export const DEFAULT_MAX_BODY_SIZE = 10 * 1024 * 1024;

/* -------------------------------------------------------------------------- */
/* Validation                                                                 */
/* -------------------------------------------------------------------------- */

export function validatePort(port: number): number {
  if (!Number.isInteger(port) || port < 0 || port > 65535) {
    throw new RangeError(
      "HTTP server port must be an integer between 0 and 65535.",
    );
  }

  return port;
}

export function validateMaxBodySize(size: number): number {
  if (!Number.isSafeInteger(size) || size < 0) {
    throw new RangeError(
      "Maximum request body size must be a non-negative safe integer.",
    );
  }

  return size;
}

export function validateTimeout(value: number, name: string): number {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${name} must be a non-negative finite number.`);
  }

  return value;
}
