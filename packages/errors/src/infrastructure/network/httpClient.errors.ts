/**
 * HTTP client error classes.
 *
 * These errors are specific to outbound HTTP client operations
 * and carry enough information for the HTTP layer to translate
 * failures into consistent responses.
 */

import { BaseError } from "../../base/core/baseError.core.js";
import type { ErrorMetadata } from "../../base/core/errorMetadata.core.js";

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

  constructor(
    message: string,
    options: HttpClientClientErrorOptions = {},
  ) {
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

/**
 * HTTP client timeout error.
 *
 * Thrown when an outbound HTTP request exceeds its timeout.
 */
export class HttpClientTimeoutError extends HttpClientError {
  readonly timeout: number;

  constructor(
    timeout: number,
    options: HttpClientClientErrorOptions = {},
  ) {
    super(`HTTP request timed out after ${timeout}ms.`, {
      ...options,
      code: options.code ?? "HTTP_CLIENT_TIMEOUT",
    });
    this.name = "HttpClientTimeoutError";
    this.timeout = timeout;
  }
}

/**
 * HTTP client abort error.
 *
 * Thrown when an outbound HTTP request is aborted via AbortSignal.
 */
export class HttpClientAbortError extends HttpClientError {
  constructor(
    requestOrOptions: Request | HttpClientClientErrorOptions = {},
    causeOrOptions?: HttpClientClientErrorOptions | unknown,
  ) {
    let opts: HttpClientClientErrorOptions;

    if (requestOrOptions instanceof Request) {
      opts = causeOrOptions !== undefined && typeof causeOrOptions === "object" && causeOrOptions !== null && !Array.isArray(causeOrOptions) && "code" in (causeOrOptions as Record<string, unknown>)
        ? { request: requestOrOptions, ...(causeOrOptions as HttpClientClientErrorOptions) }
        : { request: requestOrOptions, cause: causeOrOptions };
    } else {
      opts = requestOrOptions;
    }

    super("HTTP request was aborted.", {
      ...opts,
      code: opts.code ?? "HTTP_CLIENT_ABORTED",
    });
    this.name = "HttpClientAbortError";
  }
}

/**
 * HTTP client network error.
 *
 * Thrown when an outbound HTTP request fails due to a network issue.
 */
export class HttpClientNetworkError extends HttpClientError {
  constructor(
    message: string,
    requestOrOptions: Request | HttpClientClientErrorOptions = {},
    causeOrOptions?: HttpClientClientErrorOptions | unknown,
  ) {
    let opts: HttpClientClientErrorOptions;

    if (requestOrOptions instanceof Request) {
      opts = causeOrOptions !== undefined && typeof causeOrOptions === "object" && causeOrOptions !== null && !Array.isArray(causeOrOptions) && "code" in (causeOrOptions as Record<string, unknown>)
        ? { request: requestOrOptions, ...(causeOrOptions as HttpClientClientErrorOptions) }
        : { request: requestOrOptions, cause: causeOrOptions };
    } else {
      opts = requestOrOptions;
    }

    super(message, {
      ...opts,
      code: opts.code ?? "HTTP_CLIENT_NETWORK_ERROR",
    });
    this.name = "HttpClientNetworkError";
  }
}
