import type { IncomingMessage } from "node:http";
import { randomUUID } from "node:crypto";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface MultipartFile {
  readonly fieldName: string;
  readonly filename: string;
  readonly contentType: string;
  readonly encoding: string;
  readonly size: number;
  readonly data: Buffer;
}

export interface MultipartField {
  readonly fieldName: string;
  readonly value: string;
}

export interface MultipartForm {
  readonly fields: Record<string, string | string[]>;
  readonly files: readonly MultipartFile[];
}

export interface MultipartOptions {
  readonly limit?: number;
  readonly maxFileSize?: number;
  readonly maxFiles?: number;
  readonly maxFields?: number;
  readonly encoding?: BufferEncoding;
}

export interface MultipartPartHeaders {
  readonly contentDisposition?: string;
  readonly contentType?: string;
  readonly contentTransferEncoding?: string;
}

/* -------------------------------------------------------------------------- */
/* Defaults                                                                   */
/* -------------------------------------------------------------------------- */

export const DEFAULT_MULTIPART_LIMIT = 10 * 1024 * 1024;

export const DEFAULT_MULTIPART_FILE_LIMIT = 10 * 1024 * 1024;

export const DEFAULT_MULTIPART_MAX_FILES = 20;

export const DEFAULT_MULTIPART_MAX_FIELDS = 100;

/* -------------------------------------------------------------------------- */
/* Multipart Parser                                                           */
/* -------------------------------------------------------------------------- */

export async function parseMultipart(
  request: IncomingMessage,
  options: MultipartOptions = {},
): Promise<MultipartForm> {
  const contentType = getMultipartContentType(request);

  const boundary = extractBoundary(contentType);

  if (!boundary) {
    throw new MultipartParseError("Multipart boundary is missing.");
  }

  const body = await readMultipartBody(
    request,
    options.limit ?? DEFAULT_MULTIPART_LIMIT,
  );

  return parseMultipartBuffer(body, boundary, options);
}

/* -------------------------------------------------------------------------- */
/* Buffer Parser                                                              */
/* -------------------------------------------------------------------------- */

export function parseMultipartBuffer(
  body: Buffer,
  boundary: string,
  options: MultipartOptions = {},
): MultipartForm {
  validateBoundary(boundary);

  const maxFileSize = options.maxFileSize ?? DEFAULT_MULTIPART_FILE_LIMIT;

  const maxFiles = options.maxFiles ?? DEFAULT_MULTIPART_MAX_FILES;

  const maxFields = options.maxFields ?? DEFAULT_MULTIPART_MAX_FIELDS;

  const fields: Record<string, string | string[]> = {};

  const files: MultipartFile[] = [];

  const delimiter = Buffer.from(`--${boundary}`, "utf8");

  const parts = splitMultipartBody(body, delimiter);

  for (const part of parts) {
    if (part.length === 0) {
      continue;
    }

    const parsed = parseMultipartPart(part, options.encoding ?? "utf8");

    if (!parsed) {
      continue;
    }

    if (parsed.filename !== undefined) {
      if (files.length >= maxFiles) {
        throw new MultipartLimitError(
          "Maximum number of uploaded files exceeded.",
        );
      }

      if (parsed.body.length > maxFileSize) {
        throw new MultipartLimitError(
          "Uploaded file exceeds the configured file size limit.",
        );
      }

      files.push({
        fieldName: parsed.name,
        filename: sanitizeFilename(parsed.filename),
        contentType: parsed.contentType ?? "application/octet-stream",
        encoding: parsed.transferEncoding ?? "binary",
        size: parsed.body.length,
        data: parsed.body,
      });

      continue;
    }

    if (countFields(fields) >= maxFields) {
      throw new MultipartLimitError(
        "Maximum number of multipart fields exceeded.",
      );
    }

    const value = parsed.body.toString(options.encoding ?? "utf8");

    appendField(fields, parsed.name, value);
  }

  return {
    fields,
    files,
  };
}

/* -------------------------------------------------------------------------- */
/* Multipart Request Body                                                     */
/* -------------------------------------------------------------------------- */

async function readMultipartBody(
  request: IncomingMessage,
  limit: number,
): Promise<Buffer> {
  if (!Number.isSafeInteger(limit) || limit < 0) {
    throw new RangeError(
      "Multipart body limit must be a non-negative safe integer.",
    );
  }

  const contentLength = getContentLength(request);

  if (contentLength !== undefined && contentLength > limit) {
    request.resume();

    throw new MultipartLimitError(
      "Multipart request exceeds the configured body limit.",
    );
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
      const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);

      total += buffer.length;

      if (total > limit) {
        fail(
          new MultipartLimitError(
            "Multipart request exceeds the configured body limit.",
          ),
        );

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
      fail(new MultipartParseError("Multipart request was aborted."));
    };

    const onClose = () => {
      if (!settled && request.readableEnded !== true) {
        fail(
          new MultipartParseError(
            "Multipart request closed before completion.",
          ),
        );
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
/* Content Type                                                               */
/* -------------------------------------------------------------------------- */

export function getMultipartContentType(
  request: IncomingMessage,
): string | undefined {
  const header = request.headers["content-type"];

  if (Array.isArray(header)) {
    return header[0];
  }

  return typeof header === "string" ? header : undefined;
}

export function isMultipartRequest(request: IncomingMessage): boolean {
  const contentType = getMultipartContentType(request);

  return Boolean(
    contentType && contentType.toLowerCase().startsWith("multipart/"),
  );
}

/* -------------------------------------------------------------------------- */
/* Boundary                                                                   */
/* -------------------------------------------------------------------------- */

export function extractBoundary(
  contentType: string | undefined,
): string | undefined {
  if (!contentType) {
    return undefined;
  }

  const match = /(?:^|;)\s*boundary=(?:"([^"]+)"|([^;]+))/i.exec(contentType);

  if (!match) {
    return undefined;
  }

  return (match[1] ?? match[2])?.trim();
}

function validateBoundary(boundary: string): void {
  if (boundary.length === 0 || boundary.length > 70) {
    throw new MultipartParseError("Invalid multipart boundary.");
  }
}

/* -------------------------------------------------------------------------- */
/* Part Parsing                                                               */
/* -------------------------------------------------------------------------- */

interface ParsedMultipartPart {
  readonly name: string;
  readonly filename?: string;
  readonly contentType?: string;
  readonly transferEncoding?: string;
  readonly body: Buffer;
}

function parseMultipartPart(
  part: Buffer,
  encoding: BufferEncoding,
): ParsedMultipartPart | undefined {
  const separator = findHeaderSeparator(part);

  if (separator === -1) {
    return undefined;
  }

  const headerBuffer = part.subarray(0, separator);

  const bodyStart = separator + getHeaderSeparatorLength(part, separator);

  const body = part.subarray(bodyStart);

  const headers = parsePartHeaders(headerBuffer.toString(encoding));

  const disposition = headers.contentDisposition;

  if (!disposition) {
    return undefined;
  }

  const name = getDispositionParameter(disposition, "name");

  if (!name) {
    throw new MultipartParseError("Multipart part is missing a field name.");
  }

  const filename = getDispositionParameter(disposition, "filename");

  return {
    name,
    filename: filename === null ? undefined : filename,
    contentType: headers.contentType,
    transferEncoding: headers.contentTransferEncoding,
    body: stripTrailingCRLF(body),
  };
}

/* -------------------------------------------------------------------------- */
/* Header Parsing                                                             */
/* -------------------------------------------------------------------------- */

function parsePartHeaders(headerBlock: string): MultipartPartHeaders {
  const headers: Record<string, string> = {};

  for (const line of headerBlock.split(/\r?\n/)) {
    const separator = line.indexOf(":");

    if (separator <= 0) {
      continue;
    }

    const name = line.slice(0, separator).trim().toLowerCase();

    const value = line.slice(separator + 1).trim();

    headers[name] = value;
  }

  return {
    contentDisposition: headers["content-disposition"],
    contentType: headers["content-type"],
    contentTransferEncoding: headers["content-transfer-encoding"],
  };
}

function getDispositionParameter(
  disposition: string,
  parameter: string,
): string | null {
  const expression = new RegExp(
    `(?:^|;)\\s*${escapeRegExp(parameter)}=(?:"([^"]*)"|([^;]*))`,
    "i",
  );

  const match = expression.exec(disposition);

  if (!match) {
    return null;
  }

  return match[1] ?? match[2] ?? "";
}

/* -------------------------------------------------------------------------- */
/* Multipart Splitting                                                        */
/* -------------------------------------------------------------------------- */

function splitMultipartBody(body: Buffer, delimiter: Buffer): Buffer[] {
  const parts: Buffer[] = [];

  let cursor = 0;

  while (cursor < body.length) {
    const position = body.indexOf(delimiter, cursor);

    if (position === -1) {
      break;
    }

    const partStart = position + delimiter.length;

    if (body[partStart] === 45 && body[partStart + 1] === 45) {
      break;
    }

    let next = body.indexOf(delimiter, partStart);

    if (next === -1) {
      next = body.length;
    }

    let part = body.subarray(partStart, next);

    part = stripLeadingCRLF(part);

    part = stripTrailingCRLF(part);

    if (part.length > 0) {
      parts.push(part);
    }

    cursor = next;
  }

  return parts;
}

function findHeaderSeparator(buffer: Buffer): number {
  return buffer.indexOf(Buffer.from("\r\n\r\n"));
}

function getHeaderSeparatorLength(buffer: Buffer, position: number): number {
  if (buffer.subarray(position, position + 4).equals(Buffer.from("\r\n\r\n"))) {
    return 4;
  }

  return 2;
}

/* -------------------------------------------------------------------------- */
/* Field Utilities                                                            */
/* -------------------------------------------------------------------------- */

function appendField(
  fields: Record<string, string | string[]>,
  name: string,
  value: string,
): void {
  const existing = fields[name];

  if (existing === undefined) {
    fields[name] = value;

    return;
  }

  if (Array.isArray(existing)) {
    existing.push(value);

    return;
  }

  fields[name] = [existing, value];
}

function countFields(fields: Record<string, string | string[]>): number {
  let count = 0;

  for (const value of Object.values(fields)) {
    count += Array.isArray(value) ? value.length : 1;
  }

  return count;
}

/* -------------------------------------------------------------------------- */
/* Filename Utilities                                                         */
/* -------------------------------------------------------------------------- */

export function sanitizeFilename(filename: string): string {
  const normalized = filename.replace(/\\/g, "/");

  const basename = normalized.slice(normalized.lastIndexOf("/") + 1);

  const sanitized = basename.replace(/[\u0000-\u001f\u007f]/g, "").trim();

  return sanitized || `upload-${randomUUID()}`;
}

/* -------------------------------------------------------------------------- */
/* Buffer Utilities                                                           */
/* -------------------------------------------------------------------------- */

function stripLeadingCRLF(buffer: Buffer): Buffer {
  if (buffer.length >= 2 && buffer[0] === 13 && buffer[1] === 10) {
    return buffer.subarray(2);
  }

  return buffer;
}

function stripTrailingCRLF(buffer: Buffer): Buffer {
  if (
    buffer.length >= 2 &&
    buffer[buffer.length - 2] === 13 &&
    buffer[buffer.length - 1] === 10
  ) {
    return buffer.subarray(0, buffer.length - 2);
  }

  return buffer;
}

/* -------------------------------------------------------------------------- */
/* Request Utilities                                                          */
/* -------------------------------------------------------------------------- */

function getContentLength(request: IncomingMessage): number | undefined {
  const header = request.headers["content-length"];

  const value = Array.isArray(header) ? header[0] : header;

  if (typeof value !== "string") {
    return undefined;
  }

  const length = Number(value);

  if (!Number.isSafeInteger(length) || length < 0) {
    throw new MultipartParseError("Invalid Content-Length header.");
  }

  return length;
}

/* -------------------------------------------------------------------------- */
/* Errors                                                                     */
/* -------------------------------------------------------------------------- */

import {
  MultipartError,
  MultipartParseError,
  MultipartLimitError,
} from "@zudojs/errors";

export { MultipartError, MultipartParseError, MultipartLimitError };

/* -------------------------------------------------------------------------- */
/* Generic Helpers                                                            */
/* -------------------------------------------------------------------------- */

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
