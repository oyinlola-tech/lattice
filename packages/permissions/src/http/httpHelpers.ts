/**
 * HTTP response helpers for permission middleware.
 *
 * @module http/httpHelpers
 */

import type { PermissionDecision } from "../permissionTypes/index.js";

/** Options for creating denied responses. */
export interface DeniedResponseOptions {
  /** Custom 403 response body function. */
  readonly deniedResponse?: (decision: PermissionDecision) => unknown;
}

/**
 * Create a 403 Forbidden JSON response.
 */
export function createForbiddenResponse(
  reason: string,
  options?: DeniedResponseOptions,
): { readonly status: 403; readonly body: unknown; readonly headers: Record<string, string> } {
  const body = options?.deniedResponse
    ? options.deniedResponse({ allowed: false, reason })
    : { error: "Forbidden", message: reason };

  return Object.freeze({
    status: 403 as const,
    body,
    headers: { "content-type": "application/json" },
  });
}

/**
 * Create a JSON response.
 */
export function createJsonResponse(
  status: number,
  body: unknown,
): { readonly status: number; readonly body: unknown; readonly headers: Record<string, string> } {
  return Object.freeze({
    status,
    body,
    headers: { "content-type": "application/json" },
  });
}
