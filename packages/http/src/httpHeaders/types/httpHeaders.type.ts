/**
 * Types and interfaces for HTTP header utilities.
 *
 * @module httpHeaders/type
 */

import type { IncomingHttpHeaders, OutgoingHttpHeaders } from "node:http";

import type { HTTPHeaders, HTTPHeadersInit } from "../http.headers.js";

/**
 * A union of all supported header input formats.
 */
export type HTTPHeadersLike =
  | HTTPHeaders
  | HTTPHeadersInit
  | IncomingHttpHeaders
  | OutgoingHttpHeaders
  | Headers;

/**
 * Options for header matching operations.
 */
export interface HeaderMatchOptions {
  readonly caseSensitive?: boolean;
  readonly trim?: boolean;
}

/**
 * The result of parsing a header value.
 */
export interface HeaderParseResult<T> {
  readonly value: T | undefined;

  readonly valid: boolean;

  readonly raw: string | undefined;
}

/**
 * Parsed Cache-Control directives.
 */
export interface CacheControlDirectives {
  readonly noCache: boolean;

  readonly noStore: boolean;

  readonly noTransform: boolean;

  readonly onlyIfCached: boolean;

  readonly public: boolean;

  readonly private: boolean;

  readonly mustRevalidate: boolean;

  readonly proxyRevalidate: boolean;

  readonly immutable: boolean;

  readonly maxAge: number | undefined;

  readonly sMaxAge: number | undefined;

  readonly staleWhileRevalidate: number | undefined;

  readonly staleIfError: number | undefined;

  readonly mustUnderstand: boolean;

  readonly directives: Readonly<Record<string, string | true>>;
}

/**
 * A parsed Content-Range header value.
 */
export interface ContentRange {
  readonly unit: string;

  readonly start: number;

  readonly end: number;

  readonly total: number | undefined;
}

/**
 * A parsed byte range (e.g. from a Range header).
 */
export interface ByteRange {
  readonly start: number;

  readonly end: number | undefined;
}
