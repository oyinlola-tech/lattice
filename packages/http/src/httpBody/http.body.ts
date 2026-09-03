import type { IncomingMessage } from "node:http";

/* -------------------------------------------------------------------------- */
/* Body Types                                                                 */
/* -------------------------------------------------------------------------- */

export type HTTPBody =
  string | Buffer | Uint8Array | Record<string, unknown> | unknown[] | null;

export interface HTTPBodyParseOptions {
  readonly limit?: number;
  readonly encoding?: BufferEncoding;
  readonly strict?: boolean;
}

export interface HTTPBodyReaderOptions extends HTTPBodyParseOptions {
  readonly request: IncomingMessage;
}

/* -------------------------------------------------------------------------- */
/* Defaults                                                                   */
/* -------------------------------------------------------------------------- */

export const DEFAULT_BODY_LIMIT = 1_048_576;

export const DEFAULT_BODY_ENCODING: BufferEncoding = "utf8";

/* -------------------------------------------------------------------------- */
/* Content Types                                                              */
/* -------------------------------------------------------------------------- */

export const BODY_CONTENT_TYPES = {
  JSON: "application/json",

  FORM_URLENCODED: "application/x-www-form-urlencoded",

  TEXT: "text/plain",

  HTML: "text/html",

  MULTIPART: "multipart/form-data",

  OCTET_STREAM: "application/octet-stream",
} as const;

/* -------------------------------------------------------------------------- */
/* Body Reader                                                                */
/* -------------------------------------------------------------------------- */

export async function readBody(
  options: HTTPBodyReaderOptions,
): Promise<Buffer> {
  const { request, limit = DEFAULT_BODY_LIMIT } = options;

  validateBodyLimit(limit);

  const contentLength = getContentLength(request);

  if (contentLength !== undefined && contentLength > limit) {
    request.resume();

    throw new HTTPBodyLimitError(limit, contentLength);
  }

  const chunks: Buffer[] = [];

  let total = 0;

  return new Promise<Buffer>((resolve, reject) => {
    let settled = false;

    const cleanup = () => {
      request.removeListener("data", onData);

      request.removeListener("end", onEnd);

      request.removeListener("error", onError);

      request.removeListener("aborted", onAborted);

      request.removeListener("close", onClose);
    };

    const fail = (error: Error) => {
      if (settled) {
        return;
      }

      settled = true;

      cleanup();

      request.resume();

      reject(error);
    };

    const onData = (chunk: Buffer | string) => {
      const buffer = Buffer.isBuffer(chunk)
        ? chunk
        : Buffer.from(chunk, options.encoding ?? DEFAULT_BODY_ENCODING);

      total += buffer.byteLength;

      if (total > limit) {
        fail(new HTTPBodyLimitError(limit, total));

        return;
      }

      chunks.push(buffer);
    };

    const onEnd = () => {
      if (settled) {
        return;
      }

      settled = true;

      cleanup();

      resolve(Buffer.concat(chunks, total));
    };

    const onError = (error: Error) => {
      fail(error);
    };

    const onAborted = () => {
      fail(new HTTPBodyAbortedError());
    };

    const onClose = () => {
      if (!settled && request.readableEnded !== true) {
        fail(new HTTPBodyAbortedError());
      }
    };

    request.on("data", onData);

    request.once("end", onEnd);

    request.once("error", onError);

    request.once("aborted", onAborted);

    request.once("close", onClose);
  });
}

/* -------------------------------------------------------------------------- */
/* Text Parsing                                                               */
/* -------------------------------------------------------------------------- */

export async function readText(
  options: HTTPBodyReaderOptions,
): Promise<string> {
  const body = await readBody(options);

  return body.toString(options.encoding ?? DEFAULT_BODY_ENCODING);
}

/* -------------------------------------------------------------------------- */
/* JSON Parsing                                                               */
/* -------------------------------------------------------------------------- */

export async function readJSON<T = unknown>(
  options: HTTPBodyReaderOptions = {
    request: undefined as unknown as IncomingMessage,
  },
): Promise<T> {
  const text = await readText(options);

  if (text.trim() === "") {
    return undefined as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch (error) {
    throw new HTTPBodyParseError("Invalid JSON request body.", error);
  }
}

/* -------------------------------------------------------------------------- */
/* Form URL Encoded                                                           */
/* -------------------------------------------------------------------------- */

export async function readForm(
  options: HTTPBodyReaderOptions,
): Promise<Record<string, string | string[]>> {
  const text = await readText(options);

  const params = new URLSearchParams(text);

  const result: Record<string, string | string[]> = {};

  for (const [key, value] of params.entries()) {
    const existing = result[key];

    if (existing === undefined) {
      result[key] = value;

      continue;
    }

    if (Array.isArray(existing)) {
      existing.push(value);

      continue;
    }

    result[key] = [existing, value];
  }

  return result;
}

/* -------------------------------------------------------------------------- */
/* Automatic Parsing                                                          */
/* -------------------------------------------------------------------------- */

export async function parseBody<T = unknown>(
  options: HTTPBodyReaderOptions,
): Promise<T | Buffer | string> {
  const contentType = getContentType(options.request);

  if (isJSONContentType(contentType)) {
    return readJSON<T>(options);
  }

  if (isFormContentType(contentType)) {
    return readForm(options) as Promise<T>;
  }

  if (isTextContentType(contentType)) {
    return readText(options);
  }

  return readBody(options);
}

/* -------------------------------------------------------------------------- */
/* Content Type Helpers                                                       */
/* -------------------------------------------------------------------------- */

export function getContentType(request: IncomingMessage): string | undefined {
  const value = request.headers["content-type"];

  if (Array.isArray(value)) {
    return value[0];
  }

  if (typeof value !== "string") {
    return undefined;
  }

  return value.split(";", 1)[0]?.trim().toLowerCase();
}

export function isJSONContentType(contentType: string | undefined): boolean {
  if (!contentType) {
    return false;
  }

  const normalized = contentType.split(";", 1)[0].trim().toLowerCase();

  return normalized === BODY_CONTENT_TYPES.JSON || normalized.endsWith("+json");
}

export function isFormContentType(contentType: string | undefined): boolean {
  if (!contentType) {
    return false;
  }

  return (
    contentType.split(";", 1)[0].trim().toLowerCase() ===
    BODY_CONTENT_TYPES.FORM_URLENCODED
  );
}

export function isTextContentType(contentType: string | undefined): boolean {
  if (!contentType) {
    return false;
  }

  const normalized = contentType.split(";", 1)[0].trim().toLowerCase();

  return (
    normalized.startsWith("text/") || normalized === BODY_CONTENT_TYPES.HTML
  );
}

export function isMultipartContentType(
  contentType: string | undefined,
): boolean {
  if (!contentType) {
    return false;
  }

  return contentType
    .trim()
    .toLowerCase()
    .startsWith(BODY_CONTENT_TYPES.MULTIPART);
}

/* -------------------------------------------------------------------------- */
/* Content Length                                                             */
/* -------------------------------------------------------------------------- */

export function getContentLength(request: IncomingMessage): number | undefined {
  const value = request.headers["content-length"];

  if (Array.isArray(value)) {
    return parseContentLength(value[0]);
  }

  if (typeof value !== "string") {
    return undefined;
  }

  return parseContentLength(value);
}

function parseContentLength(value: string | undefined): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);

  if (!Number.isSafeInteger(parsed) || parsed < 0) {
    throw new HTTPBodyParseError("Invalid Content-Length header.");
  }

  return parsed;
}

/* -------------------------------------------------------------------------- */
/* Body Utilities                                                             */
/* -------------------------------------------------------------------------- */

export function bodyToBuffer(
  body: string | Buffer | Uint8Array,
  encoding: BufferEncoding = DEFAULT_BODY_ENCODING,
): Buffer {
  if (Buffer.isBuffer(body)) {
    return body;
  }

  if (typeof body === "string") {
    return Buffer.from(body, encoding);
  }

  return Buffer.from(body);
}

export function bodyToJSON(body: unknown): string {
  try {
    return JSON.stringify(body);
  } catch (error) {
    throw new HTTPBodyParseError(
      "Unable to serialize response body as JSON.",
      error,
    );
  }
}

/* -------------------------------------------------------------------------- */
/* Validation                                                                 */
/* -------------------------------------------------------------------------- */

function validateBodyLimit(limit: number): void {
  if (!Number.isSafeInteger(limit) || limit < 0) {
    throw new RangeError(
      "HTTP body limit must be a non-negative safe integer.",
    );
  }
}

/* -------------------------------------------------------------------------- */
/* Errors                                                                     */
/* -------------------------------------------------------------------------- */

import {
  HttpBodyError as HTTPBodyError,
  HttpBodyLimitError as HTTPBodyLimitError,
  HttpBodyAbortedError as HTTPBodyAbortedError,
  HttpBodyParseError as HTTPBodyParseError,
} from "@zudolib/errors";

export {
  HTTPBodyError,
  HTTPBodyLimitError,
  HTTPBodyAbortedError,
  HTTPBodyParseError,
};
