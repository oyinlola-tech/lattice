/**
 * HTTP request builder for testing.
 *
 * Provides a fluent API for constructing test HTTP requests.
 */

/** HTTP method type. */
export type HTTPMethod =
  "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";

/**
 * A test HTTP request.
 */
export interface TestHTTPRequest {
  readonly method: HTTPMethod;
  readonly path: string;
  readonly headers: Headers;
  readonly query: Record<string, string>;
  readonly body: unknown;
  readonly params: Record<string, string>;
}

/**
 * Fluent builder for test HTTP requests.
 *
 * @example
 * ```ts
 * const request = createTestHTTPRequest()
 *   .GET("/api/users")
 *   .withHeader("Authorization", "Bearer token123")
 *   .withQuery({ page: "1", limit: "10" })
 *   .build();
 *
 * expect(request.method).toBe("GET");
 * expect(request.path).toBe("/api/users");
 * ```
 */
export interface HTTPRequestBuilder {
  GET: (path: string) => HTTPRequestBuilder;
  POST: (path: string) => HTTPRequestBuilder;
  PUT: (path: string) => HTTPRequestBuilder;
  PATCH: (path: string) => HTTPRequestBuilder;
  DELETE: (path: string) => HTTPRequestBuilder;
  HEAD: (path: string) => HTTPRequestBuilder;
  OPTIONS: (path: string) => HTTPRequestBuilder;
  withHeader: (key: string, value: string) => HTTPRequestBuilder;
  withHeaders: (
    headers: Headers | Record<string, string>,
  ) => HTTPRequestBuilder;
  withQuery: (query: Record<string, string>) => HTTPRequestBuilder;
  withParam: (key: string, value: string) => HTTPRequestBuilder;
  withBody: (body: unknown) => HTTPRequestBuilder;
  build: () => TestHTTPRequest;
}

/**
 * Creates a new HTTP request builder.
 *
 * @returns An HTTPRequestBuilder instance.
 */
export function createTestHTTPRequest(): HTTPRequestBuilder {
  let method: HTTPMethod = "GET";
  let path = "/";
  const headers = new Headers();
  const query: Record<string, string> = {};
  const params: Record<string, string> = {};
  let body: unknown = undefined;

  const builder: HTTPRequestBuilder = {
    GET: (p: string) => {
      method = "GET";
      path = p;
      return builder;
    },
    POST: (p: string) => {
      method = "POST";
      path = p;
      return builder;
    },
    PUT: (p: string) => {
      method = "PUT";
      path = p;
      return builder;
    },
    PATCH: (p: string) => {
      method = "PATCH";
      path = p;
      return builder;
    },
    DELETE: (p: string) => {
      method = "DELETE";
      path = p;
      return builder;
    },
    HEAD: (p: string) => {
      method = "HEAD";
      path = p;
      return builder;
    },
    OPTIONS: (p: string) => {
      method = "OPTIONS";
      path = p;
      return builder;
    },

    withHeader: (key: string, value: string) => {
      headers.set(key.toLowerCase(), value);
      return builder;
    },

    withHeaders: (h: Headers | Record<string, string>) => {
      if (h instanceof Headers) {
        h.forEach((value, key) => {
          headers.set(key, value);
        });
      } else {
        for (const [key, value] of Object.entries(h)) {
          headers.set(key.toLowerCase(), value);
        }
      }
      return builder;
    },

    withQuery: (q: Record<string, string>) => {
      for (const [key, value] of Object.entries(q)) {
        query[key] = value;
      }
      return builder;
    },

    withParam: (key: string, value: string) => {
      params[key] = value;
      return builder;
    },

    withBody: (b: unknown) => {
      body = b;
      return builder;
    },

    build: (): TestHTTPRequest => ({
      method,
      path,
      headers: new Headers(headers),
      query: { ...query },
      body,
      params: { ...params },
    }),
  };

  return builder;
}

/**
 * Creates a simple test HTTP request without the builder pattern.
 *
 * @param method - HTTP method.
 * @param path - Request path.
 * @param options - Optional headers, query, and body.
 * @returns A TestHTTPRequest instance.
 */
export function createHTTPRequest(
  method: HTTPMethod,
  path: string,
  options: {
    readonly headers?: Headers | Record<string, string>;
    readonly query?: Record<string, string>;
    readonly body?: unknown;
    readonly params?: Record<string, string>;
  } = {},
): TestHTTPRequest {
  return {
    method,
    path,
    headers: new Headers(options.headers as Record<string, string>),
    query: options.query ?? {},
    body: options.body,
    params: options.params ?? {},
  };
}
