/**
 * HTTP client URL handling.
 *
 * @module httpClient/url
 */

import type { HttpClientQuery } from "./httpClient.type.js";

import { isAbsoluteUrl, getDefaultBaseUrl } from "./httpClient.helpers.js";

export function buildClientUrl(
  input: string | URL,
  baseUrl?: string,
  query?: HttpClientQuery,
): URL {
  const value =
    input instanceof URL
      ? new URL(input.toString())
      : isAbsoluteUrl(input)
        ? new URL(input)
        : new URL(input, baseUrl ?? getDefaultBaseUrl());

  if (query) {
    appendQuery(value, query);
  }

  return value;
}

export function appendQuery(url: URL, query: HttpClientQuery): URL {
  if (query instanceof URLSearchParams) {
    for (const [key, value] of query.entries()) {
      url.searchParams.append(key, value);
    }

    return url;
  }

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) {
      continue;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        url.searchParams.append(key, String(item));
      }
    } else {
      url.searchParams.append(key, String(value));
    }
  }

  return url;
}
