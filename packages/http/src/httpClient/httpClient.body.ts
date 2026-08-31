/**
 * HTTP client request body normalization.
 *
 * @module httpClient/body
 */

import type { HttpClientBody } from "./httpClient.type.js";

import {
  HttpClientError,
} from "./httpClient.error.js";

export function normalizeRequestBody(
  body: HttpClientBody,
  headers: Headers,
  method: string,
): BodyInit | undefined {
  if (body === undefined || body === null) {
    return undefined;
  }

  if (method === "GET" || method === "HEAD") {
    throw new HttpClientError(`${method} requests cannot contain a request body.`, {
      code: "HTTP_CLIENT_INVALID_BODY",
    });
  }

  if (isBodyInit(body)) {
    return body;
  }

  if (typeof body === "object") {
    if (!headers.has("content-type")) {
      headers.set("content-type", "application/json; charset=utf-8");
    }

    return JSON.stringify(body);
  }

  return String(body);
}

function isBodyInit(value: unknown): value is BodyInit {
  if (typeof value === "string") {
    return true;
  }

  if (typeof Blob !== "undefined" && value instanceof Blob) {
    return true;
  }

  if (typeof FormData !== "undefined" && value instanceof FormData) {
    return true;
  }

  if (typeof URLSearchParams !== "undefined" && value instanceof URLSearchParams) {
    return true;
  }

  if (typeof ArrayBuffer !== "undefined" && value instanceof ArrayBuffer) {
    return true;
  }

  if (typeof Uint8Array !== "undefined" && value instanceof Uint8Array) {
    return true;
  }

  if (typeof ReadableStream !== "undefined" && value instanceof ReadableStream) {
    return true;
  }

  return false;
}
