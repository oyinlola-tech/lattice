/**
 * HTTP client error base class.
 */

import { BaseError } from "../../base/core/baseError.core.js";
import type { ErrorMetadata } from "../../base/core/errorMetadata.type.js";

/**
 * Options for creating an HTTP client error.
 */
export interface HttpClientClientErrorOptions {
  readonly cause?: unknown;
  readonly code?: string;
  readonly expose?: boolean;
  readonly metadata?: ErrorMetadata;
  readonly status?: number;
  readonly statusText?: string;
  readonly url?: string;
  readonly response?: unknown;
  readonly request?: unknown;
}

/**
 * Base HTTP client error for outbound request failures.
 *
 * Extends BaseError with HTTP client-specific properties like
 * status, statusText, url, response, and request.
 */
export class HttpClientError extends BaseError {
  readonly status: number | undefined;
  readonly statusText: string | undefined;
  readonly url: string | undefined;
  readonly response: unknown;
  readonly request: unknown;

  constructor(message: string, options: HttpClientClientErrorOptions = {}) {
    super(message, {
      code: options.code ?? "HTTP_CLIENT_ERROR",
      expose: options.expose ?? false,
      metadata: options.metadata,
      cause: options.cause,
    });
    this.name = "HttpClientError";
    this.status = options.status;
    this.statusText = options.statusText;
    this.url = options.url;
    this.response = options.response;
    this.request = options.request;
  }

  get isNetworkError(): boolean {
    return this.code === "HTTP_CLIENT_NETWORK_ERROR";
  }

  get isTimeoutError(): boolean {
    return this.code === "HTTP_CLIENT_TIMEOUT";
  }

  get isAbortError(): boolean {
    return this.code === "HTTP_CLIENT_ABORTED";
  }

  get isHttpStatusError(): boolean {
    return this.status !== undefined;
  }
}
