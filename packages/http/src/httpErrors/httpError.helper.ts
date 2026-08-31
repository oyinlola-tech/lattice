/**
 * HTTP error helpers barrel.
 *
 * Factory functions, type guards, and utilities.
 *
 * @module httpErrors/helpers
 */

import type {
  HttpErrorOptions,
} from "./httpError.type.js";

import {
  HttpError,
} from "./httpError.base.js";

export * from "./factories/httpError.clientError.js";
export * from "./factories/httpError.serverError.js";
export * from "./httpError.typeGuard.js";
export * from "./httpError.invalidJson.js";

/**
 * Normalizes header keys to lowercase.
 */
export function normalizeHeaders(
  headers:
    | Record<string, string>
    | undefined,
):
  | Record<string, string> {
  if (
    !headers
  ) {
    return {};
  }

  const normalized: Record<string, string> =
    {};

  for (
    const [
      key,
      value,
    ] of Object.entries(
      headers,
    )
  ) {
    if (
      typeof value ===
      "string"
    ) {
      normalized[
        key.toLowerCase()
      ] =
        value;
    }
  }

  return normalized;
}

/**
 * Returns the standard HTTP status text for a given status code.
 */
export function getStatusText(
  status:
    | number,
):
  | string {
  const map: Record<number, string> =
    {
      400: "Bad Request",
      401: "Unauthorized",
      402: "Payment Required",
      403: "Forbidden",
      404: "Not Found",
      405: "Method Not Allowed",
      406: "Not Acceptable",
      407: "Proxy Authentication Required",
      408: "Request Timeout",
      409: "Conflict",
      410: "Gone",
      411: "Length Required",
      412: "Precondition Failed",
      413: "Content Too Large",
      414: "URI Too Long",
      415: "Unsupported Media Type",
      416: "Range Not Satisfiable",
      417: "Expectation Failed",
      418: "I'm a Teapot",
      421: "Misdirected Request",
      422: "Unprocessable Content",
      423: "Locked",
      424: "Failed Dependency",
      425: "Too Early",
      426: "Upgrade Required",
      428: "Precondition Required",
      429: "Too Many Requests",
      431: "Request Header Fields Too Large",
      451: "Unavailable For Legal Reasons",
      500: "Internal Server Error",
      501: "Not Implemented",
      502: "Bad Gateway",
      503: "Service Unavailable",
      504: "Gateway Timeout",
      505: "HTTP Version Not Supported",
      506: "Variant Also Negotiates",
      507: "Insufficient Storage",
      508: "Loop Detected",
      510: "Not Extended",
      511: "Network Authentication Required",
    };

  return (
    map[status] ??
    "Unknown Status"
  );
}

/**
 * Creates an HTTP error with the specified status code.
 */
export function httpError(
  status:
    | number,
  message?:
    | string,
  options?:
    | HttpErrorOptions,
):
  | HttpError {
  return new HttpError(
    status,
    message,
    options,
  );
}
