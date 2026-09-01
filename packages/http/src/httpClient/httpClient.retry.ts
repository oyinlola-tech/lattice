/**
 * @oyinlola141/lattice-http — HTTP client retry logic.
 *
 * Handles retry configuration, status-based retry decisions,
 * exponential backoff, and delay utilities.
 */

import type { HttpClientMethod } from "./httpClient.type.js";

/** Retry options for the HTTP client. */
export interface HttpRetryOptions {
  readonly retries?: number;
  readonly retryDelay?: number;
  readonly maxRetryDelay?: number;
  readonly retryStatusCodes?: readonly number[];
  readonly retryMethods?: readonly HttpClientMethod[];
  readonly retryOnNetworkError?: boolean;
  readonly backoff?: "fixed" | "exponential";
}

/**
 * Normalize retry options with defaults.
 */
export function normalizeRetryOptions(
  options?: HttpRetryOptions,
): HttpRetryOptions | undefined {
  if (!options) return undefined;
  return {
    retries: options.retries ?? 0,
    retryDelay: options.retryDelay ?? 1000,
    maxRetryDelay: options.maxRetryDelay ?? 30_000,
    retryStatusCodes: options.retryStatusCodes ?? [429, 502, 503, 504],
    retryMethods: options.retryMethods ?? ["GET", "HEAD", "OPTIONS"],
    retryOnNetworkError: options.retryOnNetworkError ?? true,
    backoff: options.backoff ?? "exponential",
  };
}

/**
 * Check if a status code should trigger a retry.
 */
export function shouldRetryStatus(
  status: number,
  method: string,
  retry?: HttpRetryOptions,
): boolean {
  if (!retry?.retryStatusCodes?.length) return false;
  if (!retry.retryMethods?.includes(method as HttpClientMethod)) return false;
  return retry.retryStatusCodes.includes(status);
}

/**
 * Check if an error should trigger a retry.
 */
export function shouldRetryError(
  error: unknown,
  _method: string,
  retry?: HttpRetryOptions,
): boolean {
  if (!retry?.retries) return false;
  if (!retry.retryOnNetworkError) return false;
  const name = error instanceof Error ? error.constructor.name : "";
  return name === "TypeError" || name === "FetchError";
}

/**
 * Calculate retry delay with exponential backoff.
 */
export function calculateRetryDelay(
  attempt: number,
  retry: HttpRetryOptions,
): number {
  const base = retry.retryDelay ?? 1000;
  const max = retry.maxRetryDelay ?? 30_000;
  const ms =
    retry.backoff === "fixed"
      ? base
      : Math.min(base * Math.pow(2, attempt), max);
  return ms + Math.random() * 1000;
}

/**
 * Delay for a given number of milliseconds.
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
