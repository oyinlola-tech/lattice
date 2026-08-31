/**
 * HTTP status code helper functions.
 */

/** Returns whether a status code represents a successful response. */
export function isHttpSuccessStatus(statusCode: number): boolean {
  return statusCode >= 200 && statusCode < 300;
}

/** Returns whether a status code represents a redirect. */
export function isHttpRedirectStatus(statusCode: number): boolean {
  return statusCode >= 300 && statusCode < 400;
}

/** Returns whether a status code represents a client error. */
export function isHttpClientErrorStatus(statusCode: number): boolean {
  return statusCode >= 400 && statusCode < 500;
}

/** Returns whether a status code represents a server error. */
export function isHttpServerErrorStatus(statusCode: number): boolean {
  return statusCode >= 500 && statusCode < 600;
}
