/**
 * Local HTTP type definitions for the middleware adapter.
 *
 * Mirrors @lattice/http types to avoid hard dependency.
 *
 * @module http/httpTypes
 */

/** HTTP middleware signature from @lattice/http. */
export type HttpMiddleware = (
  context: HttpMiddlewareContext,
  next: () => Promise<HttpResponseContext>,
) => void | Response | HttpResponseContext | Promise<void | Response | HttpResponseContext>;

/** HTTP middleware context from @lattice/http. */
export interface HttpMiddlewareContext {
  readonly request: HttpRequestContext;
  readonly response: HttpResponseContext;
  readonly state: HttpMiddlewareState;
  readonly signal: AbortSignal;
  readonly metadata: Readonly<Record<string, unknown>>;
}

/** HTTP request context from @lattice/http. */
export interface HttpRequestContext {
  readonly id: string;
  readonly method: string;
  readonly url: string;
  readonly path: string;
  readonly headers: ReadonlyMap<string, string>;
  readonly params: ReadonlyMap<string, string>;
  readonly query: ReadonlyMap<string, string | readonly string[] | undefined>;
}

/** HTTP response context from @lattice/http. */
export interface HttpResponseContext {
  readonly status: number;
  readonly headers: Headers | Record<string, string>;
  readonly body?: unknown;
}

/** HTTP middleware state from @lattice/http. */
export interface HttpMiddlewareState {
  get<T = unknown>(key: string): T | undefined;
  set<T = unknown>(key: string, value: T): void;
}
