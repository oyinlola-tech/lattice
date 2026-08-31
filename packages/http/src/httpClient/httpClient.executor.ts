/**
 * HTTP client execution with retry.
 *
 * @module httpClient/executor
 */

import type {
  HttpClientRequestContext,
  HttpClientResponse,
} from "./httpClient.type.js";

import {
  HttpClientError,
  HttpClientTimeoutError,
} from "./httpClient.error.js";

import {
  normalizeClientError,
} from "./httpClient.errorNormalizer.js";

import {
  normalizeRetryOptions,
  shouldRetryStatus,
  shouldRetryError,
  calculateRetryDelay,
  delay,
} from "./httpClient.retry.js";

import {
  combineAbortSignals,
} from "./httpClient.abort.js";

import {
  parseResponse,
} from "./httpClient.response.js";

interface HttpClientLike {
  readonly fetchImpl: typeof globalThis.fetch;
  readonly defaultRetry: import("./httpClient.type.js").HttpRetryOptions | undefined;
  readonly defaultTimeout: number | undefined;
}

export async function executeWithRetry(
  context: HttpClientRequestContext,
  client: HttpClientLike,
): Promise<HttpClientResponse> {
  const retry = normalizeRetryOptions(context.config.retry ?? client.defaultRetry);
  const retries = retry?.retries ?? 0;
  let attempt = 0;

  while (true) {
    try {
      const response = await executeOnce(context, client);

      if (
        attempt < retries &&
        shouldRetryStatus(response.status, (context.config.method ?? "GET") as import("./httpClient.type.js").HttpClientMethod, retry)
      ) {
        await delay(calculateRetryDelay(attempt, retry));
        attempt += 1;
        continue;
      }

      if (!response.ok) {
        throw new HttpClientError(
          `HTTP request failed with status ${response.status}.`,
          {
            code: "HTTP_CLIENT_HTTP_ERROR",
            status: response.status,
            statusText: response.statusText,
            url: response.url,
            response,
            request: response.request,
          },
        );
      }

      return response;
    } catch (error) {
      const normalized = normalizeClientError(error, context.request);

      if (
        attempt < retries &&
        shouldRetryError(normalized, (context.config.method ?? "GET") as import("./httpClient.type.js").HttpClientMethod, retry)
      ) {
        await delay(calculateRetryDelay(attempt, retry));
        attempt += 1;
        continue;
      }

      throw normalized;
    }
  }
}

async function executeOnce(
  context: HttpClientRequestContext,
  client: HttpClientLike,
): Promise<HttpClientResponse> {
  const timeout = context.config.timeout ?? client.defaultTimeout;
  let controller: AbortController | undefined;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  if (timeout !== undefined) {
    controller = new AbortController();
    timeoutId = setTimeout(() => {
      controller?.abort(new HttpClientTimeoutError(timeout, context.request));
    }, timeout);
  }

  const signal = combineAbortSignals(context.config.signal, controller?.signal);

  const request =
    signal === context.request.signal
      ? context.request
      : new Request(context.request, { signal });

  try {
    const raw = await client.fetchImpl(request);
    const response = await parseResponse(raw, context.config.responseType ?? "auto");
    return response;
  } catch (error) {
    if (error instanceof HttpClientError) {
      throw error;
    }

    throw normalizeClientError(error, request);
  } finally {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
  }
}
