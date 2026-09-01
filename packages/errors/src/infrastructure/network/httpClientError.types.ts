/**
 * HTTP client error subclasses.
 */

import {
  HttpClientError,
  type HttpClientClientErrorOptions,
} from "./httpClientError.base.js";

/**
 * HTTP client timeout error.
 *
 * Thrown when an outbound HTTP request exceeds its timeout.
 */
export class HttpClientTimeoutError extends HttpClientError {
  readonly timeout: number;

  constructor(timeout: number, options: HttpClientClientErrorOptions = {}) {
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
      opts =
        causeOrOptions !== undefined &&
        typeof causeOrOptions === "object" &&
        causeOrOptions !== null &&
        !Array.isArray(causeOrOptions) &&
        "code" in (causeOrOptions as Record<string, unknown>)
          ? {
              request: requestOrOptions,
              ...(causeOrOptions as HttpClientClientErrorOptions),
            }
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
      opts =
        causeOrOptions !== undefined &&
        typeof causeOrOptions === "object" &&
        causeOrOptions !== null &&
        !Array.isArray(causeOrOptions) &&
        "code" in (causeOrOptions as Record<string, unknown>)
          ? {
              request: requestOrOptions,
              ...(causeOrOptions as HttpClientClientErrorOptions),
            }
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
