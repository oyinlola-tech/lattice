/**
 * Fetch body reading utilities.
 *
 * @module httpAdapter/fetch/body
 */

import { DEFAULT_MAX_BODY_SIZE } from "./httpFetch.type.js";

import { RequestBodyTooLargeError as FetchRequestBodyTooLargeError } from "@zudo/errors";

export { FetchRequestBodyTooLargeError };

/**
 * Reads the body from a Request or Response as a string.
 */
export async function readFetchBodyAsString(
  request: Request | Response,
  maxBodySize: number = DEFAULT_MAX_BODY_SIZE,
): Promise<string> {
  const body = await readFetchBody(request, maxBodySize);
  return body.toString("utf-8");
}

/**
 * Reads the body from a Request or Response and parses it as JSON.
 */
export async function readFetchBodyAsJson<T = unknown>(
  request: Request | Response,
  maxBodySize: number = DEFAULT_MAX_BODY_SIZE,
): Promise<T> {
  const text = await readFetchBodyAsString(request, maxBodySize);
  return JSON.parse(text) as T;
}

/**
 * Reads the body from a Request or Response.
 */
export async function readFetchBody(
  request: Request | Response,
  maxBodySize: number = DEFAULT_MAX_BODY_SIZE,
): Promise<string | Buffer> {
  const contentLength = request.headers.get("content-length");
  if (contentLength) {
    const size = parseInt(contentLength, 10);
    if (size > maxBodySize) {
      throw new FetchRequestBodyTooLargeError(maxBodySize, size);
    }
  }

  const reader = request.body?.getReader();
  if (!reader) {
    return Buffer.alloc(0);
  }

  const chunks: Uint8Array[] = [];
  let totalSize = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      totalSize += value.length;
      if (totalSize > maxBodySize) {
        throw new FetchRequestBodyTooLargeError(maxBodySize, totalSize);
      }

      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  return Buffer.concat(chunks);
}
