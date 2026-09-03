/**
 * Request interceptors.
 *
 * @module httpInterceptors/builtin/request
 */

import type { HttpInterceptorOptions } from "../httpInterceptor.type.js";

import { defaultRequestId } from "../httpInterceptor.helper.js";

export interface RequestIdInterceptorOptions extends HttpInterceptorOptions {
  readonly headerName?: string;
  readonly generator?: () => string;
}

export function createRequestIdInterceptor(
  options: RequestIdInterceptorOptions = {},
) {
  const headerName = options.headerName ?? "x-request-id";
  const generator = options.generator ?? defaultRequestId;

  return {
    phase: "request" as const,
    priority: options.priority ?? "first",
    name: options.name ?? "request-id",
    handler: (request: {
      readonly headers: Record<string, string | undefined>;
    }) => {
      const id = generator();
      return {
        ...request,
        headers: {
          ...request.headers,
          [headerName]: id,
        },
      };
    },
  };
}

export interface UserAgentInterceptorOptions extends HttpInterceptorOptions {
  readonly userAgent?: string;
  readonly headerName?: string;
}

export function createUserAgentInterceptor(
  options: UserAgentInterceptorOptions = {},
) {
  const userAgent = options.userAgent ?? "Zudo-HTTP/1.0";
  const headerName = options.headerName ?? "user-agent";

  return {
    phase: "request" as const,
    priority: options.priority ?? "normal",
    name: options.name ?? "user-agent",
    handler: (request: {
      readonly headers: Record<string, string | undefined>;
    }) => {
      return {
        ...request,
        headers: {
          ...request.headers,
          [headerName]: userAgent,
        },
      };
    },
  };
}

export interface BearerTokenInterceptorOptions extends HttpInterceptorOptions {
  readonly token: string | (() => string);
  readonly headerName?: string;
}

export function createBearerTokenInterceptor(
  options: BearerTokenInterceptorOptions,
) {
  const headerName = options.headerName ?? "authorization";

  return {
    phase: "request" as const,
    priority: options.priority ?? "normal",
    name: options.name ?? "bearer-token",
    handler: (request: {
      readonly headers: Record<string, string | undefined>;
    }) => {
      const token =
        typeof options.token === "function" ? options.token() : options.token;

      return {
        ...request,
        headers: {
          ...request.headers,
          [headerName]: `Bearer ${token}`,
        },
      };
    },
  };
}

export interface JsonAcceptInterceptorOptions extends HttpInterceptorOptions {
  readonly headerName?: string;
}

export function createJsonAcceptInterceptor(
  options: JsonAcceptInterceptorOptions = {},
) {
  const headerName = options.headerName ?? "accept";

  return {
    phase: "request" as const,
    priority: options.priority ?? "normal",
    name: options.name ?? "json-accept",
    handler: (request: {
      readonly headers: Record<string, string | undefined>;
    }) => {
      return {
        ...request,
        headers: {
          ...request.headers,
          [headerName]: "application/json",
        },
      };
    },
  };
}
