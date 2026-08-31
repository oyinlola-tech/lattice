/**
 * HTTP client error normalization.
 *
 * @module httpClient/errorNormalizer
 */

import {
  HttpClientError,
  HttpClientTimeoutError,
  HttpClientAbortError,
  HttpClientNetworkError,
} from "./httpClient.error.js";

export function normalizeClientError(
  error: unknown,
  request?: Request,
): HttpClientError {
  if (error instanceof HttpClientError) {
    return error;
  }

  if (request?.signal.aborted) {
    const reason = request.signal.reason;

    if (reason instanceof HttpClientTimeoutError) {
      return reason;
    }

    return new HttpClientAbortError(request, reason);
  }

  if (error instanceof DOMException && error.name === "AbortError") {
    return new HttpClientAbortError(request, error);
  }

  if (error instanceof TypeError) {
    return new HttpClientNetworkError(
      error.message || "HTTP request failed due to a network error.",
      request,
      error,
    );
  }

  return new HttpClientError(
    error instanceof Error ? error.message : "HTTP request failed.",
    {
      code: "HTTP_CLIENT_ERROR",
      request,
      cause: error,
    },
  );
}
