import type { IncomingMessage } from "node:http";

import {
  DEFAULT_BODY_ENCODING,
  DEFAULT_BODY_LIMIT,
  isFormContentType,
  isJSONContentType,
  isMultipartContentType,
  isTextContentType,
  parseBody,
  readBody,
  readForm,
  readJSON,
  readText,
  type HTTPBodyReaderOptions,
  type HTTPBodyParseOptions,
} from "./http.body.js";

import {
  parseMultipart,
  type MultipartForm,
  type MultipartOptions,
} from "../httpMultipart/http.multipart.js";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type ParsedBody =
  unknown | Buffer | string | Record<string, string | string[]> | MultipartForm;

export type BodyParserFormat = "json" | "form" | "text" | "multipart" | "raw";

export interface BodyParserOptions extends HTTPBodyParseOptions {
  readonly multipart?: MultipartOptions;
  readonly strictContentType?: boolean;
}

export interface BodyParserResult<T = unknown> {
  readonly body: T;
  readonly format: BodyParserFormat;
  readonly contentType?: string;
  readonly contentLength?: number;
}

export interface BodyParser {
  parse<T = unknown>(request: IncomingMessage): Promise<BodyParserResult<T>>;
}

/* -------------------------------------------------------------------------- */
/* Defaults                                                                   */
/* -------------------------------------------------------------------------- */

export const DEFAULT_BODY_PARSER_OPTIONS: Required<
  Pick<BodyParserOptions, "limit" | "encoding" | "strictContentType">
> = {
  limit: DEFAULT_BODY_LIMIT,

  encoding: DEFAULT_BODY_ENCODING,

  strictContentType: false,
};

/* -------------------------------------------------------------------------- */
/* Main Parser                                                                */
/* -------------------------------------------------------------------------- */

export async function parseRequestBody<T = ParsedBody>(
  request: IncomingMessage,
  options: BodyParserOptions = {},
): Promise<BodyParserResult<T>> {
  const contentType = getRequestContentType(request);

  const contentLength = getRequestContentLength(request);

  const format = detectBodyFormat(contentType);

  if (options.strictContentType && format === "raw" && contentType) {
    throw new UnsupportedBodyTypeError(contentType);
  }

  const body = await parseByFormat<T>(request, format, options);

  return {
    body,
    format,
    contentType,
    contentLength,
  };
}

/* -------------------------------------------------------------------------- */
/* Format Detection                                                           */
/* -------------------------------------------------------------------------- */

export function detectBodyFormat(
  contentType: string | undefined,
): BodyParserFormat {
  if (isJSONContentType(contentType)) {
    return "json";
  }

  if (isFormContentType(contentType)) {
    return "form";
  }

  if (isMultipartContentType(contentType)) {
    return "multipart";
  }

  if (isTextContentType(contentType)) {
    return "text";
  }

  return "raw";
}

/* -------------------------------------------------------------------------- */
/* Format Parser                                                              */
/* -------------------------------------------------------------------------- */

async function parseByFormat<T>(
  request: IncomingMessage,
  format: BodyParserFormat,
  options: BodyParserOptions,
): Promise<T> {
  switch (format) {
    case "json":
      return readJSON<T>({
        request,
        limit: options.limit ?? DEFAULT_BODY_LIMIT,
        encoding: options.encoding ?? DEFAULT_BODY_ENCODING,
        strict: options.strict,
      });

    case "form":
      return readForm({
        request,
        limit: options.limit ?? DEFAULT_BODY_LIMIT,
        encoding: options.encoding ?? DEFAULT_BODY_ENCODING,
        strict: options.strict,
      }) as T;

    case "multipart":
      return parseMultipart(request, {
        limit: options.multipart?.limit ?? options.limit ?? DEFAULT_BODY_LIMIT,

        maxFileSize: options.multipart?.maxFileSize,

        maxFiles: options.multipart?.maxFiles,

        maxFields: options.multipart?.maxFields,

        encoding:
          options.multipart?.encoding ??
          options.encoding ??
          DEFAULT_BODY_ENCODING,
      }) as T;

    case "text":
      return readText({
        request,
        limit: options.limit ?? DEFAULT_BODY_LIMIT,
        encoding: options.encoding ?? DEFAULT_BODY_ENCODING,
        strict: options.strict,
      }) as T;

    case "raw":
    default:
      return readBody({
        request,
        limit: options.limit ?? DEFAULT_BODY_LIMIT,
        encoding: options.encoding ?? DEFAULT_BODY_ENCODING,
        strict: options.strict,
      }) as T;
  }
}

/* -------------------------------------------------------------------------- */
/* Individual Parsers                                                         */
/* -------------------------------------------------------------------------- */

export async function parseJSONBody<T = unknown>(
  request: IncomingMessage,
  options: BodyParserOptions = {},
): Promise<T> {
  return readJSON<T>({
    request,
    limit: options.limit ?? DEFAULT_BODY_LIMIT,
    encoding: options.encoding ?? DEFAULT_BODY_ENCODING,
    strict: options.strict,
  });
}

export async function parseFormBody(
  request: IncomingMessage,
  options: BodyParserOptions = {},
): Promise<Record<string, string | string[]>> {
  return readForm({
    request,
    limit: options.limit ?? DEFAULT_BODY_LIMIT,
    encoding: options.encoding ?? DEFAULT_BODY_ENCODING,
    strict: options.strict,
  });
}

export async function parseTextBody(
  request: IncomingMessage,
  options: BodyParserOptions = {},
): Promise<string> {
  return readText({
    request,
    limit: options.limit ?? DEFAULT_BODY_LIMIT,
    encoding: options.encoding ?? DEFAULT_BODY_ENCODING,
    strict: options.strict,
  });
}

export async function parseRawBody(
  request: IncomingMessage,
  options: BodyParserOptions = {},
): Promise<Buffer> {
  return readBody({
    request,
    limit: options.limit ?? DEFAULT_BODY_LIMIT,
    encoding: options.encoding ?? DEFAULT_BODY_ENCODING,
    strict: options.strict,
  });
}

export async function parseMultipartBody(
  request: IncomingMessage,
  options: BodyParserOptions = {},
): Promise<MultipartForm> {
  return parseMultipart(request, {
    limit: options.multipart?.limit ?? options.limit ?? DEFAULT_BODY_LIMIT,

    maxFileSize: options.multipart?.maxFileSize,

    maxFiles: options.multipart?.maxFiles,

    maxFields: options.multipart?.maxFields,

    encoding:
      options.multipart?.encoding ?? options.encoding ?? DEFAULT_BODY_ENCODING,
  });
}

/* -------------------------------------------------------------------------- */
/* Factory                                                                    */
/* -------------------------------------------------------------------------- */

export function createBodyParser(options: BodyParserOptions = {}): BodyParser {
  const resolved: BodyParserOptions = {
    ...DEFAULT_BODY_PARSER_OPTIONS,
    ...options,
  };

  return {
    async parse<T = unknown>(
      request: IncomingMessage,
    ): Promise<BodyParserResult<T>> {
      return parseRequestBody<T>(request, resolved);
    },
  };
}

/* -------------------------------------------------------------------------- */
/* Request Inspection                                                         */
/* -------------------------------------------------------------------------- */

export function hasRequestBody(request: IncomingMessage): boolean {
  const method = request.method?.toUpperCase();

  if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
    return false;
  }

  const contentLength = getRequestContentLength(request);

  if (contentLength !== undefined) {
    return contentLength > 0;
  }

  const transferEncoding = request.headers["transfer-encoding"];

  if (transferEncoding) {
    return true;
  }

  return false;
}

/* -------------------------------------------------------------------------- */
/* Content Type                                                               */
/* -------------------------------------------------------------------------- */

export function getRequestContentType(
  request: IncomingMessage,
): string | undefined {
  const value = request.headers["content-type"];

  if (Array.isArray(value)) {
    return value[0]?.split(";", 1)[0]?.trim().toLowerCase();
  }

  if (typeof value !== "string") {
    return undefined;
  }

  return value.split(";", 1)[0]?.trim().toLowerCase();
}

/* -------------------------------------------------------------------------- */
/* Content Length                                                             */
/* -------------------------------------------------------------------------- */

export function getRequestContentLength(
  request: IncomingMessage,
): number | undefined {
  const value = request.headers["content-length"];

  const raw = Array.isArray(value) ? value[0] : value;

  if (typeof raw !== "string") {
    return undefined;
  }

  const length = Number(raw);

  if (!Number.isSafeInteger(length) || length < 0) {
    throw new InvalidContentLengthError(raw);
  }

  return length;
}

/* -------------------------------------------------------------------------- */
/* Media Type Helpers                                                         */
/* -------------------------------------------------------------------------- */

export function isJSONRequest(request: IncomingMessage): boolean {
  return isJSONContentType(getRequestContentType(request));
}

export function isFormRequest(request: IncomingMessage): boolean {
  return isFormContentType(getRequestContentType(request));
}

export function isMultipartRequestBody(request: IncomingMessage): boolean {
  return isMultipartContentType(getRequestContentType(request));
}

export function isTextRequest(request: IncomingMessage): boolean {
  return isTextContentType(getRequestContentType(request));
}

/* -------------------------------------------------------------------------- */
/* Body Parser Errors                                                         */
/* -------------------------------------------------------------------------- */

import {
  BodyParserError,
  UnsupportedBodyTypeError,
  InvalidContentLengthError,
} from "@zudolib/errors";

export { BodyParserError, UnsupportedBodyTypeError, InvalidContentLengthError };

/* -------------------------------------------------------------------------- */
/* Body Parser Middleware Helper                                              */
/* -------------------------------------------------------------------------- */

export interface ParsedBodyRequest extends IncomingMessage {
  body?: unknown;
}

export async function attachParsedBody(
  request: ParsedBodyRequest,
  options: BodyParserOptions = {},
): Promise<BodyParserResult> {
  const result = await parseRequestBody(request, options);

  request.body = result.body;

  return result;
}

/* -------------------------------------------------------------------------- */
/* Compatibility Helper                                                       */
/* -------------------------------------------------------------------------- */

export async function parseBodyWithOptions<T = unknown>(
  request: IncomingMessage,
  options: BodyParserOptions = {},
): Promise<T> {
  const result = await parseRequestBody<T>(request, options);

  return result.body;
}

/* -------------------------------------------------------------------------- */
/* Re-exported Low Level Helpers                                              */
/* -------------------------------------------------------------------------- */

export { parseBody, readBody, readForm, readJSON, readText };

export type { HTTPBodyReaderOptions, HTTPBodyParseOptions };
