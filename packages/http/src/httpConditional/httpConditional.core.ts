/**
 * HTTP conditional request utilities.
 *
 * Handles ETag, If-None-Match, If-Match, If-Modified-Since,
 * If-Unmodified-Since and related conditional request semantics.
 */

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface EntityTag {
  readonly value: string;
  readonly weak: boolean;
}

export interface ConditionalHeaders {
  readonly ifMatch?: string;
  readonly ifNoneMatch?: string;
  readonly ifModifiedSince?: string;
  readonly ifUnmodifiedSince?: string;
  readonly ifRange?: string;
}

export interface ConditionalResource {
  readonly etag?: string;
  readonly lastModified?: Date | string;
}

export interface ConditionalResult {
  readonly matched: boolean;
  readonly notModified: boolean;
  readonly preconditionFailed: boolean;
  readonly statusCode?: 304 | 412;
}

export type ConditionalMethod =
  | "GET"
  | "HEAD"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "OPTIONS"
  | "TRACE"
  | "CONNECT";

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

export const NOT_MODIFIED_STATUS = 304;

export const PRECONDITION_FAILED_STATUS = 412;

/* -------------------------------------------------------------------------- */
/* ETag Parsing                                                               */
/* -------------------------------------------------------------------------- */

export function parseEntityTag(
  value: string | undefined | null,
): EntityTag | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  const trimmed = value.trim();

  if (trimmed.length < 2) {
    return undefined;
  }

  let weak = false;
  let tag = trimmed;

  if (tag.startsWith("W/") || tag.startsWith("w/")) {
    weak = true;
    tag = tag.slice(2).trim();
  }

  if (tag.length < 2 || !tag.startsWith('"') || !tag.endsWith('"')) {
    return undefined;
  }

  return {
    value: tag.slice(1, -1),
    weak,
  };
}

export function formatEntityTag(tag: EntityTag | string, weak = false): string {
  if (typeof tag === "object") {
    weak = tag.weak;
    tag = tag.value;
  }

  const escaped = tag.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

  return `${weak ? "W/" : ""}"${escaped}"`;
}

/* -------------------------------------------------------------------------- */
/* ETag Lists                                                                 */
/* -------------------------------------------------------------------------- */

export function parseEntityTagList(
  value: string | undefined | null,
): readonly EntityTag[] {
  if (value === undefined || value === null) {
    return [];
  }

  const trimmed = value.trim();

  if (trimmed === "*") {
    return [];
  }

  return splitCommaSeparated(trimmed)
    .map((item) => parseEntityTag(item))
    .filter((tag): tag is EntityTag => tag !== undefined);
}

export function isWildcardETag(value: string | undefined | null): boolean {
  return value?.trim() === "*";
}

/* -------------------------------------------------------------------------- */
/* ETag Comparison                                                            */
/* -------------------------------------------------------------------------- */

export function strongETagMatch(
  left: EntityTag | string | undefined,
  right: EntityTag | string | undefined,
): boolean {
  const leftTag = normalizeEntityTag(left);

  const rightTag = normalizeEntityTag(right);

  if (!leftTag || !rightTag) {
    return false;
  }

  return !leftTag.weak && !rightTag.weak && leftTag.value === rightTag.value;
}

export function weakETagMatch(
  left: EntityTag | string | undefined,
  right: EntityTag | string | undefined,
): boolean {
  const leftTag = normalizeEntityTag(left);

  const rightTag = normalizeEntityTag(right);

  if (!leftTag || !rightTag) {
    return false;
  }

  return leftTag.value === rightTag.value;
}

export function matchesETagList(
  header: string | undefined | null,
  currentETag: string | EntityTag | undefined,
  strong = false,
): boolean {
  if (isWildcardETag(header)) {
    return currentETag !== undefined;
  }

  if (currentETag === undefined) {
    return false;
  }

  const tags = parseEntityTagList(header);

  return tags.some((tag) =>
    strong
      ? strongETagMatch(tag, currentETag)
      : weakETagMatch(tag, currentETag),
  );
}

/* -------------------------------------------------------------------------- */
/* Date Parsing                                                               */
/* -------------------------------------------------------------------------- */

export function parseHTTPDate(
  value: string | undefined | null,
): Date | undefined {
  if (!value) {
    return undefined;
  }

  const timestamp = Date.parse(value);

  if (Number.isNaN(timestamp)) {
    return undefined;
  }

  return new Date(timestamp);
}

export function normalizeHTTPDate(value: Date | string): Date | undefined {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      return undefined;
    }

    return new Date(value.getTime());
  }

  return parseHTTPDate(value);
}

export function formatHTTPDate(value: Date | string): string {
  const date = normalizeHTTPDate(value);

  if (!date) {
    throw new TypeError("Invalid HTTP date.");
  }

  return date.toUTCString();
}

/* -------------------------------------------------------------------------- */
/* If-Modified-Since                                                          */
/* -------------------------------------------------------------------------- */

export function isNotModifiedSince(
  lastModified: Date | string | undefined,
  ifModifiedSince: string | undefined,
): boolean {
  if (lastModified === undefined || ifModifiedSince === undefined) {
    return false;
  }

  const resourceDate = normalizeHTTPDate(lastModified);

  const conditionDate = parseHTTPDate(ifModifiedSince);

  if (!resourceDate || !conditionDate) {
    return false;
  }

  return (
    truncateToSeconds(resourceDate).getTime() <=
    truncateToSeconds(conditionDate).getTime()
  );
}

/* -------------------------------------------------------------------------- */
/* If-Unmodified-Since                                                        */
/* -------------------------------------------------------------------------- */

export function isModifiedSince(
  lastModified: Date | string | undefined,
  ifUnmodifiedSince: string | undefined,
): boolean {
  if (lastModified === undefined || ifUnmodifiedSince === undefined) {
    return false;
  }

  const resourceDate = normalizeHTTPDate(lastModified);

  const conditionDate = parseHTTPDate(ifUnmodifiedSince);

  if (!resourceDate || !conditionDate) {
    return false;
  }

  return (
    truncateToSeconds(resourceDate).getTime() >
    truncateToSeconds(conditionDate).getTime()
  );
}

/* -------------------------------------------------------------------------- */
/* If-Range                                                                   */
/* -------------------------------------------------------------------------- */

export function matchesIfRange(
  ifRange: string | undefined,
  resource: ConditionalResource | undefined,
): boolean {
  if (!ifRange || !resource) {
    return false;
  }

  const trimmed = ifRange.trim();

  const tag = parseEntityTag(trimmed);

  if (tag) {
    /*
     * If-Range requires a strong comparison for entity tags.
     */
    return strongETagMatch(tag, resource.etag);
  }

  const rangeDate = parseHTTPDate(trimmed);

  const resourceDate = resource.lastModified
    ? normalizeHTTPDate(resource.lastModified)
    : undefined;

  if (!rangeDate || !resourceDate) {
    return false;
  }

  return (
    truncateToSeconds(resourceDate).getTime() <=
    truncateToSeconds(rangeDate).getTime()
  );
}

/* -------------------------------------------------------------------------- */
/* If-Match                                                                   */
/* -------------------------------------------------------------------------- */

export function evaluateIfMatch(
  header: string | undefined,
  currentETag: string | EntityTag | undefined,
): boolean {
  if (header === undefined) {
    return true;
  }

  if (isWildcardETag(header)) {
    return currentETag !== undefined;
  }

  return matchesETagList(header, currentETag, true);
}

/* -------------------------------------------------------------------------- */
/* If-None-Match                                                              */
/* -------------------------------------------------------------------------- */

export function evaluateIfNoneMatch(
  header: string | undefined,
  currentETag: string | EntityTag | undefined,
): boolean {
  if (header === undefined) {
    return false;
  }

  return matchesETagList(header, currentETag, false);
}

/* -------------------------------------------------------------------------- */
/* Conditional Request Evaluation                                             */
/* -------------------------------------------------------------------------- */

export function evaluateConditionalRequest(
  method: string | undefined,
  headers: ConditionalHeaders,
  resource: ConditionalResource,
): ConditionalResult {
  const normalizedMethod = (method ?? "GET").trim().toUpperCase();

  /*
   * If-Match takes precedence over If-Unmodified-Since.
   */
  if (
    headers.ifMatch !== undefined &&
    !evaluateIfMatch(headers.ifMatch, resource.etag)
  ) {
    return {
      matched: false,
      notModified: false,
      preconditionFailed: true,
      statusCode: PRECONDITION_FAILED_STATUS,
    };
  }

  /*
   * If-Unmodified-Since is only considered when If-Match is absent.
   */
  if (
    headers.ifMatch === undefined &&
    headers.ifUnmodifiedSince !== undefined &&
    isModifiedSince(resource.lastModified, headers.ifUnmodifiedSince)
  ) {
    return {
      matched: false,
      notModified: false,
      preconditionFailed: true,
      statusCode: PRECONDITION_FAILED_STATUS,
    };
  }

  /*
   * If-None-Match takes precedence over If-Modified-Since.
   */
  if (
    headers.ifNoneMatch !== undefined &&
    evaluateIfNoneMatch(headers.ifNoneMatch, resource.etag)
  ) {
    const safeMethod =
      normalizedMethod === "GET" || normalizedMethod === "HEAD";

    if (safeMethod) {
      return {
        matched: true,
        notModified: true,
        preconditionFailed: false,
        statusCode: NOT_MODIFIED_STATUS,
      };
    }

    return {
      matched: true,
      notModified: false,
      preconditionFailed: true,
      statusCode: PRECONDITION_FAILED_STATUS,
    };
  }

  if (
    headers.ifNoneMatch === undefined &&
    (normalizedMethod === "GET" || normalizedMethod === "HEAD") &&
    headers.ifModifiedSince !== undefined &&
    isNotModifiedSince(resource.lastModified, headers.ifModifiedSince)
  ) {
    return {
      matched: true,
      notModified: true,
      preconditionFailed: false,
      statusCode: NOT_MODIFIED_STATUS,
    };
  }

  return {
    matched: false,
    notModified: false,
    preconditionFailed: false,
  };
}

/* -------------------------------------------------------------------------- */
/* Header Object Helpers                                                      */
/* -------------------------------------------------------------------------- */

export function extractConditionalHeaders(
  headers: Headers | Readonly<Record<string, string | undefined>>,
): ConditionalHeaders {
  return {
    ifMatch: getHeaderValue(headers, "if-match"),
    ifNoneMatch: getHeaderValue(headers, "if-none-match"),
    ifModifiedSince: getHeaderValue(headers, "if-modified-since"),
    ifUnmodifiedSince: getHeaderValue(headers, "if-unmodified-since"),
    ifRange: getHeaderValue(headers, "if-range"),
  };
}

/* -------------------------------------------------------------------------- */
/* Conditional Response Helpers                                               */
/* -------------------------------------------------------------------------- */

export function shouldReturnNotModified(
  method: string | undefined,
  resource: ConditionalResource,
  headers: ConditionalHeaders,
): boolean {
  return evaluateConditionalRequest(method, headers, resource).notModified;
}

export function shouldReturnPreconditionFailed(
  method: string | undefined,
  resource: ConditionalResource,
  headers: ConditionalHeaders,
): boolean {
  return evaluateConditionalRequest(method, headers, resource)
    .preconditionFailed;
}

/* -------------------------------------------------------------------------- */
/* ETag Generation                                                            */
/* -------------------------------------------------------------------------- */

export function generateETag(value: string | Uint8Array, weak = false): string {
  let hash = 2166136261;

  if (typeof value === "string") {
    for (let index = 0; index < value.length; index += 1) {
      hash ^= value.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
  } else {
    for (const byte of value) {
      hash ^= byte;
      hash = Math.imul(hash, 16777619);
    }
  }

  const unsigned = hash >>> 0;

  return formatEntityTag(unsigned.toString(16), weak);
}

/* -------------------------------------------------------------------------- */
/* Cache Validators                                                           */
/* -------------------------------------------------------------------------- */

export function createConditionalResource(
  options: ConditionalResource | undefined = {},
): ConditionalResource {
  return {
    etag: options.etag,
    lastModified: options.lastModified
      ? normalizeHTTPDate(options.lastModified)
      : undefined,
  };
}

export function isFresh(
  resource: ConditionalResource,
  headers: ConditionalHeaders,
): boolean {
  return evaluateConditionalRequest("GET", headers, resource).notModified;
}

/* -------------------------------------------------------------------------- */
/* Internal Helpers                                                           */
/* -------------------------------------------------------------------------- */

function normalizeEntityTag(
  value: EntityTag | string | undefined,
): EntityTag | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value === "object") {
    return value;
  }

  return parseEntityTag(value);
}

function truncateToSeconds(date: Date): Date {
  return new Date(Math.floor(date.getTime() / 1_000) * 1_000);
}

function splitCommaSeparated(value: string): string[] {
  const result: string[] = [];

  let current = "";
  let quoted = false;
  let escaped = false;

  for (const character of value) {
    if (escaped) {
      current += character;
      escaped = false;
      continue;
    }

    if (character === "\\") {
      current += character;
      escaped = true;
      continue;
    }

    if (character === '"') {
      quoted = !quoted;
      current += character;
      continue;
    }

    if (character === "," && !quoted) {
      if (current.trim().length > 0) {
        result.push(current.trim());
      }

      current = "";
      continue;
    }

    current += character;
  }

  if (current.trim().length > 0) {
    result.push(current.trim());
  }

  return result;
}

function getHeaderValue(
  headers: Headers | Readonly<Record<string, string | undefined>>,
  name: string,
): string | undefined {
  if (typeof Headers !== "undefined" && headers instanceof Headers) {
    return headers.get(name) ?? undefined;
  }

  const key = Object.keys(headers).find(
    (headerName) => headerName.toLowerCase() === name.toLowerCase(),
  );

  return key ? (headers as Record<string, string | undefined>)[key] : undefined;
}
