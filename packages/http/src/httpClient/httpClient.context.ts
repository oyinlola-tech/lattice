/**
 * HTTP client request context creation.
 *
 * @module httpClient/context
 */

import {
  createFetchRequest,
} from "../httpAdapter/httpFetch.adapter.js";

import type {
  HttpClientMethod,
  HttpClientRequestConfig,
  HttpClientRequestContext,
} from "./httpClient.type.js";

import {
  buildClientUrl,
} from "./httpClient.url.js";

import {
  mergeHeaders,
} from "./httpClient.headers.js";

import {
  normalizeRequestBody,
} from "./httpClient.body.js";

export function createContext(
  url: string | URL,
  config: HttpClientRequestConfig,
  baseUrl: string | undefined,
  defaultHeaders: Headers,
): HttpClientRequestContext {
  const method = (config.method ?? "GET").toUpperCase() as HttpClientMethod;
  const target = buildClientUrl(url, baseUrl, config.query);
  const headers = mergeHeaders(defaultHeaders, config.headers);
  const body = normalizeRequestBody(config.body, headers, method);

  const request = createFetchRequest({
    url: typeof target === "string" ? target : target.toString(),
    method,
    headers: Object.fromEntries(headers.entries()),
    body,
  });

  return {
    url: target.toString(),
    config: { ...config, method },
    request,
  };
}
