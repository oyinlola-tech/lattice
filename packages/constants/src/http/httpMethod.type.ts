/**
 * HTTP method constants and type-safe method type.
 *
 * @module http/httpMethod
 */

/** Type-safe HTTP method string. */
export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "HEAD"
  | "OPTIONS"
  | "TRACE"
  | "CONNECT";

/**
 * All supported HTTP methods as an object map for runtime use.
 */
export const HttpMethods = Object.freeze({
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  PATCH: "PATCH",
  DELETE: "DELETE",
  HEAD: "HEAD",
  OPTIONS: "OPTIONS",
  TRACE: "TRACE",
  CONNECT: "CONNECT",
} as const);

/** Set of all HTTP methods for quick membership checks. */
export const HTTP_METHODS: ReadonlySet<HttpMethod> = new Set<HttpMethod>(
  Object.values(HttpMethods) as HttpMethod[],
);

/** HTTP methods that are safe (no side effects). */
export const SAFE_HTTP_METHODS: ReadonlySet<HttpMethod> = new Set<HttpMethod>([
  HttpMethods.GET as HttpMethod,
  HttpMethods.HEAD as HttpMethod,
  HttpMethods.OPTIONS as HttpMethod,
]);

/** HTTP methods that are idempotent. */
export const IDEMPOTENT_HTTP_METHODS: ReadonlySet<HttpMethod> =
  new Set<HttpMethod>([
    HttpMethods.GET as HttpMethod,
    HttpMethods.HEAD as HttpMethod,
    HttpMethods.PUT as HttpMethod,
    HttpMethods.DELETE as HttpMethod,
    HttpMethods.OPTIONS as HttpMethod,
    HttpMethods.TRACE as HttpMethod,
  ]);
