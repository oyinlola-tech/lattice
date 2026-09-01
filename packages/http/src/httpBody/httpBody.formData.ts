import type { IncomingMessage } from "node:http";
import { readBody } from "./http.body.js";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface HTTPFormDataFile {
  readonly fieldName: string;
  readonly filename: string;
  readonly contentType: string;
  readonly size: number;
  readonly data: Buffer;
}

export interface HTTPFormDataField {
  readonly name: string;
  readonly value: string;
}

export type HTTPFormDataValue = string | HTTPFormDataFile;

export interface HTTPFormData {
  readonly fields: ReadonlyMap<string, HTTPFormDataValue[]>;

  readonly fieldNames: readonly string[];

  get(name: string): HTTPFormDataValue | undefined;

  getAll(name: string): readonly HTTPFormDataValue[];

  has(name: string): boolean;

  entries(): IterableIterator<readonly [string, HTTPFormDataValue]>;

  keys(): IterableIterator<string>;

  values(): IterableIterator<HTTPFormDataValue>;

  forEach(callback: (value: HTTPFormDataValue, name: string) => void): void;

  toObject(): Record<string, HTTPFormDataValue | HTTPFormDataValue[]>;
}

export interface HTTPFormDataParseOptions {
  readonly request: IncomingMessage;

  readonly limit?: number;

  readonly maxFields?: number;

  readonly maxFieldSize?: number;

  readonly maxFileSize?: number;

  readonly maxFiles?: number;

  readonly strict?: boolean;
}

/* -------------------------------------------------------------------------- */
/* Defaults                                                                   */
/* -------------------------------------------------------------------------- */

export const DEFAULT_FORM_DATA_LIMIT = 10 * 1024 * 1024;

export const DEFAULT_MAX_FIELDS = 1000;

export const DEFAULT_MAX_FIELD_SIZE = 1024 * 1024;

export const DEFAULT_MAX_FILE_SIZE = 10 * 1024 * 1024;

export const DEFAULT_MAX_FILES = 100;

/* -------------------------------------------------------------------------- */
/* Content Type                                                               */
/* -------------------------------------------------------------------------- */

export function isMultipartContentType(
  contentType: string | undefined,
): boolean {
  if (!contentType) {
    return false;
  }

  return (
    contentType.split(";", 1)[0]?.trim().toLowerCase() === "multipart/form-data"
  );
}

export function getMultipartBoundary(
  contentType: string | undefined,
): string | undefined {
  if (!contentType) {
    return undefined;
  }

  const parts = contentType.split(";");

  if (parts[0]?.trim().toLowerCase() !== "multipart/form-data") {
    return undefined;
  }

  for (const part of parts.slice(1)) {
    const index = part.indexOf("=");

    if (index === -1) {
      continue;
    }

    const key = part.slice(0, index).trim().toLowerCase();

    if (key !== "boundary") {
      continue;
    }

    let boundary = part.slice(index + 1).trim();

    if (
      boundary.length >= 2 &&
      boundary.startsWith('"') &&
      boundary.endsWith('"')
    ) {
      boundary = boundary.slice(1, -1);
    }

    if (boundary.length === 0) {
      return undefined;
    }

    return boundary;
  }

  return undefined;
}

/* -------------------------------------------------------------------------- */
/* Parser                                                                     */
/* -------------------------------------------------------------------------- */

export async function parseFormData(
  options: HTTPFormDataParseOptions,
): Promise<HTTPFormData> {
  const {
    request,
    limit = DEFAULT_FORM_DATA_LIMIT,
    maxFields = DEFAULT_MAX_FIELDS,
    maxFieldSize = DEFAULT_MAX_FIELD_SIZE,
    maxFileSize = DEFAULT_MAX_FILE_SIZE,
    maxFiles = DEFAULT_MAX_FILES,
    strict = true,
  } = options;

  validateLimit(limit, "Form-data");

  validateLimit(maxFields, "Maximum field count");

  validateLimit(maxFieldSize, "Maximum field size");

  validateLimit(maxFileSize, "Maximum file size");

  validateLimit(maxFiles, "Maximum file count");

  const contentType = request.headers["content-type"];

  const normalizedContentType = Array.isArray(contentType)
    ? contentType[0]
    : contentType;

  const boundary = getMultipartBoundary(normalizedContentType);

  if (!boundary) {
    throw new HTTPFormDataParseError(
      "Multipart boundary is missing or invalid.",
    );
  }

  if (boundary.length > 200) {
    throw new HTTPFormDataParseError("Multipart boundary is too long.");
  }

  const body = await readBody({
    request,
    limit,
  });

  return parseMultipartBody(body, boundary, {
    maxFields,
    maxFieldSize,
    maxFileSize,
    maxFiles,
    strict,
  });
}

/* -------------------------------------------------------------------------- */
/* Multipart Parser                                                           */
/* -------------------------------------------------------------------------- */

export function parseMultipartBody(
  body: Buffer,
  boundary: string,
  options: Omit<HTTPFormDataParseOptions, "request" | "limit">,
): HTTPFormData {
  const {
    maxFields = DEFAULT_MAX_FIELDS,
    maxFieldSize = DEFAULT_MAX_FIELD_SIZE,
    maxFileSize = DEFAULT_MAX_FILE_SIZE,
    maxFiles = DEFAULT_MAX_FILES,
    strict = true,
  } = options;

  const boundaryBuffer = Buffer.from(`--${boundary}`, "utf8");

  const result = new HTTPFormDataImpl();

  let position = 0;

  let fieldCount = 0;

  let fileCount = 0;

  if (!body.subarray(0, boundaryBuffer.length).equals(boundaryBuffer)) {
    throw new HTTPFormDataParseError("Invalid multipart body.");
  }

  position = boundaryBuffer.length;

  while (position < body.length) {
    if (body[position] === 45 && body[position + 1] === 45) {
      break;
    }

    if (body[position] === 13 && body[position + 1] === 10) {
      position += 2;
    } else if (strict) {
      throw new HTTPFormDataParseError("Invalid multipart boundary separator.");
    }

    const nextBoundary = findBoundary(body, boundaryBuffer, position);

    if (nextBoundary === -1) {
      throw new HTTPFormDataParseError(
        "Multipart closing boundary was not found.",
      );
    }

    const partEnd = nextBoundary;

    const headerEnd = findHeaderEnd(body, position, partEnd);

    if (headerEnd === -1) {
      throw new HTTPFormDataParseError("Multipart part headers are invalid.");
    }

    const headerBuffer = body.subarray(position, headerEnd);

    const headers = parsePartHeaders(headerBuffer);

    const disposition = headers.get("content-disposition");

    if (!disposition) {
      if (strict) {
        throw new HTTPFormDataParseError(
          "Multipart part is missing Content-Disposition.",
        );
      }

      position = nextBoundary + boundaryBuffer.length;

      continue;
    }

    const metadata = parseContentDisposition(disposition);

    if (!metadata.name) {
      if (strict) {
        throw new HTTPFormDataParseError(
          "Multipart part is missing a field name.",
        );
      }

      position = nextBoundary + boundaryBuffer.length;

      continue;
    }

    const dataStart = headerEnd + 4;

    const dataEnd = partEnd;

    const data = body.subarray(dataStart, dataEnd);

    if (metadata.filename !== undefined) {
      fileCount += 1;

      if (fileCount > maxFiles) {
        throw new HTTPFormDataLimitError("Maximum file count exceeded.");
      }

      if (data.length > maxFileSize) {
        throw new HTTPFormDataLimitError(
          "Multipart file exceeds the configured size limit.",
        );
      }

      const filename = sanitizeFilename(metadata.filename);

      const contentType =
        headers.get("content-type") ?? "application/octet-stream";

      result.append(metadata.name, {
        fieldName: metadata.name,
        filename,
        contentType,
        size: data.length,
        data: Buffer.from(data),
      });
    } else {
      fieldCount += 1;

      if (fieldCount > maxFields) {
        throw new HTTPFormDataLimitError("Maximum field count exceeded.");
      }

      if (data.length > maxFieldSize) {
        throw new HTTPFormDataLimitError(
          "Multipart field exceeds the configured size limit.",
        );
      }

      const charset = getCharset(headers.get("content-type"));

      result.append(metadata.name, data.toString(charset));
    }

    position = nextBoundary + boundaryBuffer.length;
  }

  return result;
}

/* -------------------------------------------------------------------------- */
/* HTTPFormData Implementation                                                */
/* -------------------------------------------------------------------------- */

class HTTPFormDataImpl implements HTTPFormData {
  private readonly data = new Map<string, HTTPFormDataValue[]>();

  public get fields(): ReadonlyMap<string, HTTPFormDataValue[]> {
    return this.data;
  }

  public get fieldNames(): readonly string[] {
    return Array.from(this.data.keys());
  }

  public get(name: string): HTTPFormDataValue | undefined {
    return this.data.get(name)?.[0];
  }

  public getAll(name: string): readonly HTTPFormDataValue[] {
    return this.data.get(name) ?? [];
  }

  public has(name: string): boolean {
    return this.data.has(name);
  }

  public entries(): IterableIterator<readonly [string, HTTPFormDataValue]> {
    return this.entryIterator();
  }

  public keys(): IterableIterator<string> {
    return this.keyIterator();
  }

  public values(): IterableIterator<HTTPFormDataValue> {
    return this.valueIterator();
  }

  public forEach(
    callback: (value: HTTPFormDataValue, name: string) => void,
  ): void {
    for (const [name, values] of this.data) {
      for (const value of values) {
        callback(value, name);
      }
    }
  }

  public toObject(): Record<string, HTTPFormDataValue | HTTPFormDataValue[]> {
    const result: Record<string, HTTPFormDataValue | HTTPFormDataValue[]> = {};

    for (const [name, values] of this.data) {
      result[name] = values.length === 1 ? values[0] : [...values];
    }

    return result;
  }

  public append(name: string, value: HTTPFormDataValue): void {
    const existing = this.data.get(name);

    if (existing) {
      existing.push(value);
      return;
    }

    this.data.set(name, [value]);
  }

  private *entryIterator(): IterableIterator<
    readonly [string, HTTPFormDataValue]
  > {
    for (const [name, values] of this.data) {
      for (const value of values) {
        yield [name, value];
      }
    }
  }

  private *keyIterator(): IterableIterator<string> {
    for (const [name, values] of this.data) {
      for (let index = 0; index < values.length; index += 1) {
        yield name;
      }
    }
  }

  private *valueIterator(): IterableIterator<HTTPFormDataValue> {
    for (const values of this.data.values()) {
      yield* values;
    }
  }
}

/* -------------------------------------------------------------------------- */
/* Headers                                                                    */
/* -------------------------------------------------------------------------- */

function parsePartHeaders(input: Buffer): Map<string, string> {
  const text = input.toString("latin1");

  const result = new Map<string, string>();

  for (const line of text.split("\r\n")) {
    const separator = line.indexOf(":");

    if (separator <= 0) {
      continue;
    }

    const name = line.slice(0, separator).trim().toLowerCase();

    const value = line.slice(separator + 1).trim();

    result.set(name, value);
  }

  return result;
}

/* -------------------------------------------------------------------------- */
/* Content-Disposition                                                       */
/* -------------------------------------------------------------------------- */

interface ParsedContentDisposition {
  readonly name: string | undefined;

  readonly filename: string | undefined;
}

function parseContentDisposition(value: string): ParsedContentDisposition {
  const parts = value.split(";");

  if (parts[0]?.trim().toLowerCase() !== "form-data") {
    return {
      name: undefined,
      filename: undefined,
    };
  }

  let name: string | undefined;

  let filename: string | undefined;

  for (const part of parts.slice(1)) {
    const separator = part.indexOf("=");

    if (separator === -1) {
      continue;
    }

    const key = part.slice(0, separator).trim().toLowerCase();

    let parameter = part.slice(separator + 1).trim();

    if (
      parameter.length >= 2 &&
      parameter.startsWith('"') &&
      parameter.endsWith('"')
    ) {
      parameter = parameter.slice(1, -1);
    }

    parameter = parameter.replace(/\\"/g, '"');

    if (key === "name") {
      name = parameter;
    }

    if (key === "filename") {
      filename = parameter;
    }
  }

  return {
    name,
    filename,
  };
}

/* -------------------------------------------------------------------------- */
/* Multipart Search                                                           */
/* -------------------------------------------------------------------------- */

function findBoundary(body: Buffer, boundary: Buffer, start: number): number {
  for (let index = start; index <= body.length - boundary.length; index += 1) {
    if (body[index] !== 13 || body[index + 1] !== 10) {
      continue;
    }

    if (
      body.subarray(index + 2, index + 2 + boundary.length).equals(boundary)
    ) {
      return index;
    }
  }

  return -1;
}

function findHeaderEnd(body: Buffer, start: number, end: number): number {
  for (let index = start; index + 3 < end; index += 1) {
    if (
      body[index] === 13 &&
      body[index + 1] === 10 &&
      body[index + 2] === 13 &&
      body[index + 3] === 10
    ) {
      return index;
    }
  }

  return -1;
}

/* -------------------------------------------------------------------------- */
/* Filename Security                                                          */
/* -------------------------------------------------------------------------- */

export function sanitizeFilename(filename: string): string {
  const normalized = filename.replace(/\\/g, "/").split("/").pop() ?? "";

  return normalized.replace(/[\x00-\x1f\x7f]/g, "").trim();
}

/* -------------------------------------------------------------------------- */
/* Charset                                                                    */
/* -------------------------------------------------------------------------- */

function getCharset(contentType: string | undefined): BufferEncoding {
  if (!contentType) {
    return "utf8";
  }

  const match = /charset\s*=\s*"?([^;"\s]+)"?/i.exec(contentType);

  if (!match?.[1]) {
    return "utf8";
  }

  const charset = match[1].toLowerCase();

  if (charset === "utf-8" || charset === "utf8") {
    return "utf8";
  }

  if (charset === "ascii") {
    return "ascii";
  }

  if (charset === "latin1" || charset === "iso-8859-1") {
    return "latin1";
  }

  return "utf8";
}

/* -------------------------------------------------------------------------- */
/* Validation                                                                 */
/* -------------------------------------------------------------------------- */

function validateLimit(value: number, label: string): void {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new RangeError(`${label} must be a non-negative safe integer.`);
  }
}

/* -------------------------------------------------------------------------- */
/* Errors                                                                     */
/* -------------------------------------------------------------------------- */

import {
  HttpFormDataError as HTTPFormDataError,
  HttpFormDataLimitError as HTTPFormDataLimitError,
  HttpFormDataParseError as HTTPFormDataParseError,
} from "@oyinlola141/lattice-errors";

export { HTTPFormDataError, HTTPFormDataLimitError, HTTPFormDataParseError };

/* -------------------------------------------------------------------------- */
/* Factory                                                                     */
/* -------------------------------------------------------------------------- */

export function createFormData(): HTTPFormData {
  return new HTTPFormDataImpl();
}
