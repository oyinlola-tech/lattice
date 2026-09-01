/**
 * HTTP response helpers for tenancy middleware.
 *
 * @module http/httpHelpers
 */

/**
 * Create a JSON error response.
 */
export function createJsonErrorResponse(
  status: number,
  message: string,
): {
  readonly status: number;
  readonly body: unknown;
  readonly headers: Record<string, string>;
} {
  return Object.freeze({
    status,
    body: { error: message },
    headers: { "content-type": "application/json" },
  });
}

/**
 * Create a 400 Bad Request response.
 */
export function createBadRequest(message: string) {
  return createJsonErrorResponse(400, message);
}

/**
 * Create a 401 Unauthorized response.
 */
export function createUnauthorized(message: string) {
  return createJsonErrorResponse(401, message);
}

/**
 * Create a 403 Forbidden response.
 */
export function createForbidden(message: string) {
  return createJsonErrorResponse(403, message);
}

/**
 * Create a 404 Not Found response.
 */
export function createNotFound(message: string) {
  return createJsonErrorResponse(404, message);
}
