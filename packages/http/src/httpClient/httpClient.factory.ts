/**
 * HTTP client factory functions.
 *
 * @module httpClient/factory
 */

import type { HttpClientOptions } from "./httpClient.type.js";

import { HttpClient } from "./httpClient.client.js";

export function createHttpClient(options: HttpClientOptions = {}): HttpClient {
  return new HttpClient(options);
}

export function createHttpClientWithBaseUrl(
  baseUrl: string,
  options: Omit<HttpClientOptions, "baseUrl"> = {},
): HttpClient {
  return new HttpClient({ ...options, baseUrl });
}
