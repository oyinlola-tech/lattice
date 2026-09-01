/**
 * Fetch request context creation.
 *
 * @module httpAdapter/fetch/requestContext
 */

import type { FetchRequestInput } from "./httpFetch.type.js";

/**
 * Creates a request context from a FetchRequestInput.
 */
export async function createFetchRequestContext(
  input: FetchRequestInput,
): Promise<{
  readonly method: string;
  readonly url: URL;
  readonly headers: Record<string, string>;
  readonly body: unknown;
}> {
  const method = (input.method ?? "GET").toUpperCase();
  const url = new URL(input.url);
  const headers: Record<string, string> = {};

  if (input.headers) {
    for (const [key, value] of Object.entries(input.headers)) {
      if (value !== undefined) {
        headers[key.toLowerCase()] = value;
      }
    }
  }

  let body: unknown = undefined;

  if (input.body !== undefined && method !== "GET" && method !== "HEAD") {
    if (typeof input.body === "string" || Buffer.isBuffer(input.body)) {
      body = input.body;
    } else if (typeof input.body === "object") {
      body = JSON.stringify(input.body);
      if (!headers["content-type"]) {
        headers["content-type"] = "application/json";
      }
    }
  }

  return { method, url, headers, body };
}

/**
 * Creates a FetchRequest from a FetchRequestInput.
 */
export function createFetchRequest(input: FetchRequestInput): Request {
  const method = (input.method ?? "GET").toUpperCase();
  const headers = new Headers();

  if (input.headers) {
    for (const [key, value] of Object.entries(input.headers)) {
      if (value !== undefined) {
        headers.set(key, value);
      }
    }
  }

  const init: RequestInit = {
    method,
    headers,
  };

  if (input.body !== undefined && method !== "GET" && method !== "HEAD") {
    init.body =
      typeof input.body === "string" ? input.body : JSON.stringify(input.body);
  }

  return new Request(input.url, init);
}
