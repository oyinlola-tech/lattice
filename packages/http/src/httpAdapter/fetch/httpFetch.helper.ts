/**
 * Fetch adapter type guards.
 *
 * @module httpAdapter/fetch/helpers
 */

import type { FetchRequestInput } from "./httpFetch.type.js";

/**
 * Type guard for Request objects.
 */
export function isRequest(value: unknown): value is Request {
  return (
    typeof value === "object" &&
    value !== null &&
    "method" in value &&
    "url" in value &&
    "headers" in value
  );
}

/**
 * Type guard for Response objects.
 */
export function isResponse(value: unknown): value is Response {
  return (
    typeof value === "object" &&
    value !== null &&
    "status" in value &&
    "headers" in value &&
    "body" in value
  );
}

/**
 * Type guard for FetchRequestInput objects.
 */
export function isFetchRequestInput(
  value: unknown,
): value is FetchRequestInput {
  return (
    typeof value === "object" &&
    value !== null &&
    "url" in value &&
    typeof (value as FetchRequestInput).url === "string"
  );
}
