/**
 * HTTP client core type definitions.
 *
 * @module httpClient/types
 */

export type HttpClientMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "HEAD"
  | "OPTIONS"
  | "TRACE";

export type HttpClientBody =
  | BodyInit
  | Record<string, unknown>
  | readonly unknown[]
  | null
  | undefined;

export type HttpClientQueryValue =
  | string
  | number
  | boolean
  | bigint
  | null
  | undefined
  | readonly (string | number | boolean | bigint)[];

export type HttpClientQuery =
  | Readonly<Record<string, HttpClientQueryValue>>
  | URLSearchParams;

export type HttpResponseType =
  | "auto"
  | "json"
  | "text"
  | "arrayBuffer"
  | "blob"
  | "response";

export interface HttpRetryOptions {
  readonly retries?: number;
  readonly retryDelay?: number;
  readonly maxRetryDelay?: number;
  readonly retryStatusCodes?: readonly number[];
  readonly retryMethods?: readonly HttpClientMethod[];
  readonly retryOnNetworkError?: boolean;
  readonly backoff?: "fixed" | "exponential";
}

export interface HttpClientResponse<T = unknown> {
  readonly data: T;
  readonly status: number;
  readonly statusText: string;
  readonly headers: Headers;
  readonly url: string;
  readonly request: Request;
  readonly raw: Response;
  readonly ok: boolean;
}

export interface HttpClientRequestConfig {
  readonly method?: HttpClientMethod;
  readonly headers?: HeadersInit;
  readonly query?: HttpClientQuery;
  readonly body?: HttpClientBody;
  readonly responseType?: HttpResponseType;
  readonly timeout?: number;
  readonly signal?: AbortSignal;
  readonly credentials?: RequestCredentials;
  readonly mode?: RequestMode;
  readonly cache?: RequestCache;
  readonly redirect?: RequestRedirect;
  readonly referrer?: string;
  readonly referrerPolicy?: ReferrerPolicy;
  readonly integrity?: string;
  readonly keepalive?: boolean;
  readonly retry?: HttpRetryOptions;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export interface HttpClientOptions {
  readonly baseUrl?: string;
  readonly headers?: HeadersInit;
  readonly timeout?: number;
  readonly credentials?: RequestCredentials;
  readonly mode?: RequestMode;
  readonly cache?: RequestCache;
  readonly redirect?: RequestRedirect;
  readonly referrer?: string;
  readonly referrerPolicy?: ReferrerPolicy;
  readonly integrity?: string;
  readonly keepalive?: boolean;
  readonly retry?: HttpRetryOptions;
  readonly interceptors?: HttpClientInterceptors;
  readonly fetch?: typeof globalThis.fetch;
}

export interface HttpClientRequestContext {
  readonly url: string;
  readonly config: HttpClientRequestConfig;
  readonly request: Request;
}

export interface HttpClientErrorDetails {
  readonly status?: number;
  readonly statusText?: string;
  readonly url?: string;
  readonly response?: HttpClientResponse;
  readonly request?: Request;
  readonly cause?: unknown;
  readonly code?: string;
}

export interface HttpClientInterceptors {
  readonly request?: HttpRequestInterceptor[];
  readonly response?: HttpResponseInterceptor[];
  readonly error?: HttpErrorInterceptor[];
}

export type HttpRequestInterceptor = (
  context: HttpClientRequestContext,
) => HttpClientRequestContext | Promise<HttpClientRequestContext>;

export type HttpResponseInterceptor = <T>(
  response: HttpClientResponse<T>,
) => HttpClientResponse<T> | Promise<HttpClientResponse<T>>;

import type { HttpClientError } from "./httpClient.error.js";

export type HttpErrorInterceptor = (
  error: HttpClientError,
) => HttpClientError | Promise<HttpClientResponse | never>;
