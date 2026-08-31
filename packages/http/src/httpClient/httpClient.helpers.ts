/**
 * HTTP client helper utilities.
 *
 * @module httpClient/helpers
 */

import type { HttpClientResponse } from "./httpClient.type.js";

export function normalizeMethod(method: string): string {
  return method.toUpperCase();
}

export function normalizeBaseUrl(baseUrl?: string): string | undefined {
  if (!baseUrl) {
    return undefined;
  }

  return baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
}

export function validateTimeout(timeout?: number): number | undefined {
  if (timeout === undefined) {
    return undefined;
  }

  if (!Number.isFinite(timeout) || timeout < 0) {
    throw new RangeError("HTTP client timeout must be a non-negative finite number.");
  }

  return timeout;
}

export function getDefaultBaseUrl(): string {
  if (typeof globalThis.location !== "undefined") {
    return globalThis.location.href;
  }

  throw new Error(
    "A base URL is required when using relative URLs outside a browser environment.",
  );
}

export function isAbsoluteUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export function removeInterceptor<T>(list: T[], interceptor: T): void {
  const index = list.indexOf(interceptor);
  if (index >= 0) {
    list.splice(index, 1);
  }
}

export function isHttpClientResponse(value: unknown): value is HttpClientResponse {
  return (
    value !== null &&
    typeof value === "object" &&
    "status" in value &&
    "data" in value &&
    "raw" in value
  );
}

/* Error Interceptor Response Marker */

export class HttpClientResponseMarker {
  constructor(readonly value: HttpClientResponse) {}
}
