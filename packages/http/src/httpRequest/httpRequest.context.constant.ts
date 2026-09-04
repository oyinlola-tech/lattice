/**
 * HTTP request context constants.
 *
 * DI token and well-known header name for request identification.
 */

export const REQUEST_CONTEXT = Symbol.for("zudojs.http.request-context");

export const REQUEST_ID_HEADER = "x-request-id";
