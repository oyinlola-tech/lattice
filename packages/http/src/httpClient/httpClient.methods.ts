/**
 * HTTP client convenience methods (get, post, put, patch, delete, head, options).
 *
 * @module httpClient/methods
 */

import type {
  HttpClientBody,
  HttpClientRequestConfig,
  HttpClientResponse,
} from "./httpClient.type.js";

import type { HttpClient } from "./httpClient.client.js";

export function httpGet<T = unknown>(
  client: HttpClient,
  url: string | URL,
  config: Omit<HttpClientRequestConfig, "method" | "body"> = {},
): Promise<HttpClientResponse<T>> {
  return client.request<T>(url, { ...config, method: "GET" });
}

export function httpPost<T = unknown>(
  client: HttpClient,
  url: string | URL,
  body?: HttpClientBody,
  config: Omit<HttpClientRequestConfig, "method" | "body"> = {},
): Promise<HttpClientResponse<T>> {
  return client.request<T>(url, { ...config, method: "POST", body });
}

export function httpPut<T = unknown>(
  client: HttpClient,
  url: string | URL,
  body?: HttpClientBody,
  config: Omit<HttpClientRequestConfig, "method" | "body"> = {},
): Promise<HttpClientResponse<T>> {
  return client.request<T>(url, { ...config, method: "PUT", body });
}

export function httpPatch<T = unknown>(
  client: HttpClient,
  url: string | URL,
  body?: HttpClientBody,
  config: Omit<HttpClientRequestConfig, "method" | "body"> = {},
): Promise<HttpClientResponse<T>> {
  return client.request<T>(url, { ...config, method: "PATCH", body });
}

export function httpDelete<T = unknown>(
  client: HttpClient,
  url: string | URL,
  config: Omit<HttpClientRequestConfig, "method"> = {},
): Promise<HttpClientResponse<T>> {
  return client.request<T>(url, { ...config, method: "DELETE" });
}

export function httpHead<T = unknown>(
  client: HttpClient,
  url: string | URL,
  config: Omit<HttpClientRequestConfig, "method" | "body"> = {},
): Promise<HttpClientResponse<T>> {
  return client.request<T>(url, { ...config, method: "HEAD" });
}

export function httpOptions<T = unknown>(
  client: HttpClient,
  url: string | URL,
  config: Omit<HttpClientRequestConfig, "method" | "body"> = {},
): Promise<HttpClientResponse<T>> {
  return client.request<T>(url, { ...config, method: "OPTIONS" });
}
