/**
 * HTTP error type definitions.
 *
 * @module httpErrors/types
 */

import type { ErrorMetadata } from "@zudo/errors";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Options for creating an HTTP error.
 */
export interface HttpErrorOptions {
  /**
   * The original error that caused this error.
   */
  readonly cause?: unknown;

  /**
   * The error code.
   */
  readonly code?: string;

  /**
   * Additional error details.
   */
  readonly details?: unknown;

  /**
   * Custom response headers.
   */
  readonly headers?: Record<string, string>;

  /**
   * Whether to expose the error details to the client.
   */
  readonly expose?: boolean;

  /**
   * Additional error metadata.
   */
  readonly metadata?: ErrorMetadata;
}

/**
 * JSON representation of an HTTP error.
 */
export interface HttpErrorJSON {
  /**
   * The error name.
   */
  readonly name: string;

  /**
   * The error message.
   */
  readonly message: string;

  /**
   * The HTTP status code.
   */
  readonly status: number;

  /**
   * The HTTP status text.
   */
  readonly statusText: string;

  /**
   * The error code.
   */
  readonly code: string | undefined;

  /**
   * Additional error details.
   */
  readonly details: unknown;

  /**
   * Whether the error details are exposed.
   */
  readonly expose: boolean;
}
