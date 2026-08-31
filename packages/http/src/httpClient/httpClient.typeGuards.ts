/**
 * HTTP client type guards.
 *
 * @module httpClient/typeGuards
 */

import {
  HttpClientError,
  HttpClientTimeoutError,
  HttpClientAbortError,
  HttpClientNetworkError,
} from "./httpClient.error.js";

import type { HttpClientResponse } from "./httpClient.type.js";

import {
  HttpClientResponseMarker,
} from "./httpClient.helpers.js";

export function isHttpClientError(value: unknown): value is HttpClientError {
  return value instanceof HttpClientError;
}

export function isHttpClientTimeoutError(
  value: unknown,
): value is HttpClientTimeoutError {
  return value instanceof HttpClientTimeoutError;
}

export function isHttpClientAbortError(
  value: unknown,
): value is HttpClientAbortError {
  return value instanceof HttpClientAbortError;
}

export function isHttpClientNetworkError(
  value: unknown,
): value is HttpClientNetworkError {
  return value instanceof HttpClientNetworkError;
}

export function createResponseInterceptorResult(
  response: HttpClientResponse,
): HttpClientResponseMarker {
  return new HttpClientResponseMarker(response);
}
