/**
 * Request/response accessor helpers for builtin middleware.
 *
 * @module httpMiddleware/builtin/helpers/accessors
 */

import type { HttpRequestContext as RequestContext } from "../../../httpRequest/httpRequest.context.js";

import type { HttpResponseContext as ResponseContext } from "../../../httpResponse/httpResponse.context.js";

export function getRequestMethod(request: RequestContext): string {
  const value = (
    request as unknown as {
      method?: string;
    }
  ).method;

  return value ?? "GET";
}

export function getRequestUrl(request: RequestContext): string {
  const value = (
    request as unknown as {
      url?: string | URL;
    }
  ).url;

  return value instanceof URL ? value.toString() : (value ?? "/");
}

export function getRequestHeaders(
  request: RequestContext,
): Record<string, string> {
  const value = (
    request as unknown as {
      headers?: Record<string, string> | Headers;
    }
  ).headers;

  if (!value) {
    return {};
  }

  const headers = new Headers(value);

  return Object.fromEntries(headers.entries());
}

export function getResponseStatus(response: ResponseContext): number {
  const value = (
    response as unknown as {
      status?: number;
    }
  ).status;

  if (value !== undefined) {
    return value;
  }

  const raw = (
    response as unknown as {
      response?: Response;
    }
  ).response;

  return raw?.status ?? 200;
}

export function getContextSignal(
  request: RequestContext,
): AbortSignal | undefined {
  const value = (
    request as unknown as {
      signal?: AbortSignal;
    }
  ).signal;

  return value;
}

export function extractPathname(value: string): string {
  try {
    return new URL(value, "http://zudo.local").pathname;
  } catch {
    return value.split("?")[0] ?? value;
  }
}

export function performanceNow(): number {
  if (
    typeof performance !== "undefined" &&
    typeof performance.now === "function"
  ) {
    return performance.now();
  }

  return Date.now();
}

export function createNeverAbortedSignal(): AbortSignal {
  return new AbortController().signal;
}
