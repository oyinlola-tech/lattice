import type { Logger } from "@lattice/logger";

/* -------------------------------------------------------------------------- */
/* HTTP Methods                                                               */
/* -------------------------------------------------------------------------- */

export const HTTP_METHODS = [
  "GET",
  "HEAD",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "OPTIONS",
  "TRACE",
  "CONNECT",
] as const;

export type HTTPMethod =
  (typeof HTTP_METHODS)[number];

/* -------------------------------------------------------------------------- */
/* HTTP Status                                                                */
/* -------------------------------------------------------------------------- */

export type HTTPStatusCode = number;

/* -------------------------------------------------------------------------- */
/* Headers                                                                    */
/* -------------------------------------------------------------------------- */

export type HTTPHeadersInit =
  | Headers
  | Record<string, string>
  | readonly (readonly [string, string])[];

export interface HTTPHeaders {
  get(name: string): string | null;
  set(name: string, value: string): void;
  append(name: string, value: string): void;
  has(name: string): boolean;
  delete(name: string): void;
  entries(): IterableIterator<
    [string, string]
  >;
  keys(): IterableIterator<string>;
  values(): IterableIterator<string>;
}

/* -------------------------------------------------------------------------- */
/* Query                                                                      */
/* -------------------------------------------------------------------------- */

export type HTTPQueryValue =
  | string
  | number
  | boolean
  | null
  | undefined;

export type HTTPQuery =
  Record<
    string,
    HTTPQueryValue |
      readonly HTTPQueryValue[]
  >;

/* -------------------------------------------------------------------------- */
/* Params                                                                     */
/* -------------------------------------------------------------------------- */

export type HTTPParams =
  Record<string, string>;

/* -------------------------------------------------------------------------- */
/* Request                                                                    */
/* -------------------------------------------------------------------------- */

export interface HTTPRequest {
  readonly method: HTTPMethod;
  readonly url: string;
  readonly path: string;
  readonly originalUrl: string;
  readonly headers: HTTPHeaders;
  readonly query: HTTPQuery;
  readonly params: HTTPParams;
  readonly body: unknown;
  readonly rawBody?: Uint8Array;
  readonly protocol: string;
  readonly hostname: string;
  readonly ip?: string;
  readonly ips?: readonly string[];
  readonly secure: boolean;
  readonly aborted: boolean;

  getHeader(
    name: string,
  ): string | undefined;

  get(
    name: string,
  ): string | undefined;

  accepts(
    ...types: readonly string[]
  ): string | false;

  is(
    ...types: readonly string[]
  ): string | false;

  json<T = unknown>(): Promise<T>;

  text(): Promise<string>;

  buffer(): Promise<Uint8Array>;
}

/* -------------------------------------------------------------------------- */
/* Response                                                                   */
/* -------------------------------------------------------------------------- */

export interface HTTPResponse {
  statusCode: HTTPStatusCode;
  headersSent: boolean;
  finished: boolean;

  setHeader(
    name: string,
    value: string | readonly string[],
  ): this;

  getHeader(
    name: string,
  ): string | string[] | undefined;

  removeHeader(
    name: string,
  ): this;

  status(
    code: HTTPStatusCode,
  ): this;

  type(
    contentType: string,
  ): this;

  set(
    name: string,
    value: string | readonly string[],
  ): this;

  header(
    name: string,
    value: string | readonly string[],
  ): this;

  json<T = unknown>(
    data: T,
  ): Promise<void>;

  send(
    body?: unknown,
  ): Promise<void>;

  text(
    body: string,
  ): Promise<void>;

  html(
    body: string,
  ): Promise<void>;

  redirect(
    url: string,
    statusCode?: HTTPStatusCode,
  ): Promise<void>;

  end(
    body?: Uint8Array,
  ): Promise<void>;
}

/* -------------------------------------------------------------------------- */
/* HTTP Context                                                               */
/* -------------------------------------------------------------------------- */

export interface HTTPContext<
  State = Record<string, unknown>,
> {
  readonly request: HTTPRequest;
  readonly response: HTTPResponse;
  readonly state: State;
  readonly logger: Logger;

  readonly signal: AbortSignal;

  readonly startedAt: number;

  get<T = unknown>(
    key: string,
  ): T | undefined;

  set<T = unknown>(
    key: string,
    value: T,
  ): void;

  has(
    key: string,
  ): boolean;

  delete(
    key: string,
  ): boolean;
}

/* -------------------------------------------------------------------------- */
/* Middleware                                                                 */
/* -------------------------------------------------------------------------- */

export type HTTPNext = () => Promise<void>;

export type HTTPMiddleware<
  State = Record<string, unknown>,
> = (
  context: HTTPContext<State>,
  next: HTTPNext,
) =>
  | void
  | Promise<void>;

/* -------------------------------------------------------------------------- */
/* Handler                                                                    */
/* -------------------------------------------------------------------------- */

export type HTTPHandler<
  State = Record<string, unknown>,
> = (
  context: HTTPContext<State>,
) =>
  | unknown
  | Promise<unknown>;

/* -------------------------------------------------------------------------- */
/* Route                                                                      */
/* -------------------------------------------------------------------------- */

export interface HTTPRoute<
  State = Record<string, unknown>,
> {
  readonly method:
    | HTTPMethod
    | readonly HTTPMethod[];

  readonly path: string;

  readonly handler: HTTPHandler<State>;

  readonly middleware?:
    readonly HTTPMiddleware<State>[];

  readonly name?: string;

  readonly metadata?:
    Record<string, unknown>;
}

/* -------------------------------------------------------------------------- */
/* Router                                                                     */
/* -------------------------------------------------------------------------- */

export interface HTTPRouter<
  State = Record<string, unknown>,
> {
  register(
    route: HTTPRoute<State>,
  ): this;

  get(
    path: string,
    handler: HTTPHandler<State>,
    middleware?: readonly HTTPMiddleware<State>[],
  ): this;

  post(
    path: string,
    handler: HTTPHandler<State>,
    middleware?: readonly HTTPMiddleware<State>[],
  ): this;

  put(
    path: string,
    handler: HTTPHandler<State>,
    middleware?: readonly HTTPMiddleware<State>[],
  ): this;

  patch(
    path: string,
    handler: HTTPHandler<State>,
    middleware?: readonly HTTPMiddleware<State>[],
  ): this;

  delete(
    path: string,
    handler: HTTPHandler<State>,
    middleware?: readonly HTTPMiddleware<State>[],
  ): this;

  options(
    path: string,
    handler: HTTPHandler<State>,
    middleware?: readonly HTTPMiddleware<State>[],
  ): this;

  head(
    path: string,
    handler: HTTPHandler<State>,
    middleware?: readonly HTTPMiddleware<State>[],
  ): this;

  use(
    middleware: HTTPMiddleware<State>,
  ): this;

  routes(): readonly HTTPRoute<State>[];
}

/* -------------------------------------------------------------------------- */
/* Route Match                                                                */
/* -------------------------------------------------------------------------- */

export interface HTTPRouteMatch<
  State = Record<string, unknown>,
> {
  readonly route: HTTPRoute<State>;
  readonly params: HTTPParams;
}

/* -------------------------------------------------------------------------- */
/* Server                                                                     */
/* -------------------------------------------------------------------------- */

export interface HTTPServerOptions {
  readonly host?: string;
  readonly port?: number;
  readonly backlog?: number;
  readonly keepAliveTimeout?: number;
  readonly requestTimeout?: number;
  readonly headersTimeout?: number;
  readonly maxRequestsPerSocket?: number;
}

export interface HTTPServer {
  readonly host: string;
  readonly port: number;
  readonly listening: boolean;

  start(): Promise<void>;

  stop(): Promise<void>;

  address():
    | string
    | {
        address: string;
        family: string;
        port: number;
      }
    | null;

  on(
    event: HTTPServerEvent,
    listener: (...args: unknown[]) => void,
  ): this;
}

/* -------------------------------------------------------------------------- */
/* Server Events                                                              */
/* -------------------------------------------------------------------------- */

export type HTTPServerEvent =
  | "listening"
  | "connection"
  | "request"
  | "error"
  | "close";

/* -------------------------------------------------------------------------- */
/* Request Handler                                                            */
/* -------------------------------------------------------------------------- */

export type HTTPRequestHandler = (
  request: HTTPRequest,
  response: HTTPResponse,
) =>
  | void
  | Promise<void>;

/* -------------------------------------------------------------------------- */
/* HTTP Errors                                                                */
/* -------------------------------------------------------------------------- */

export interface HTTPErrorOptions {
  readonly statusCode?: HTTPStatusCode;
  readonly code?: string;
  readonly details?: unknown;
  readonly cause?: unknown;
  readonly expose?: boolean;
}

export interface HTTPErrorLike {
  readonly name: string;
  readonly message: string;
  readonly statusCode: HTTPStatusCode;
  readonly code?: string;
  readonly details?: unknown;
  readonly expose?: boolean;
}

/* -------------------------------------------------------------------------- */
/* Content Types                                                              */
/* -------------------------------------------------------------------------- */

export interface HTTPContentType {
  readonly type: string;
  readonly subtype: string;
  readonly parameters:
    Readonly<Record<string, string>>;
}

/* -------------------------------------------------------------------------- */
/* Cookies                                                                    */
/* -------------------------------------------------------------------------- */

export interface HTTPCookieOptions {
  readonly maxAge?: number;
  readonly expires?: Date;
  readonly domain?: string;
  readonly path?: string;
  readonly secure?: boolean;
  readonly httpOnly?: boolean;
  readonly sameSite?:
    | "strict"
    | "lax"
    | "none";
  readonly priority?:
    | "low"
    | "medium"
    | "high";
}

export interface HTTPCookie {
  readonly name: string;
  readonly value: string;
  readonly options?: HTTPCookieOptions;
}

/* -------------------------------------------------------------------------- */
/* CORS                                                                       */
/* -------------------------------------------------------------------------- */

export interface HTTPCORSOptions {
  readonly origin?:
    | string
    | readonly string[]
    | ((origin: string | undefined) => boolean);

  readonly methods?:
    readonly HTTPMethod[];

  readonly allowedHeaders?:
    readonly string[];

  readonly exposedHeaders?:
    readonly string[];

  readonly credentials?: boolean;

  readonly maxAge?: number;
}

/* -------------------------------------------------------------------------- */
/* Body Parser                                                                */
/* -------------------------------------------------------------------------- */

export interface HTTPBodyParserOptions {
  readonly limit?: number;
  readonly strict?: boolean;
  readonly type?:
    | string
    | readonly string[];
}

export type HTTPBodyParser = (
  request: HTTPRequest,
  options?: HTTPBodyParserOptions,
) => Promise<unknown>;

/* -------------------------------------------------------------------------- */
/* Application                                                                */
/* -------------------------------------------------------------------------- */

export interface HTTPApplicationOptions
  extends HTTPServerOptions {
  readonly logger?: Logger;
  readonly trustProxy?: boolean;
  readonly bodyParser?:
    HTTPBodyParserOptions;
}

export interface HTTPApplication<
  State = Record<string, unknown>,
> extends HTTPRouter<State> {
  readonly server:
    HTTPServer | undefined;

  readonly logger: Logger;

  listen(
    port: number,
    host?: string,
  ): Promise<void>;

  close(): Promise<void>;

  handle(
    request: HTTPRequest,
    response: HTTPResponse,
  ): Promise<void>;
}

/* -------------------------------------------------------------------------- */
/* HTTP Client                                                                */
/* -------------------------------------------------------------------------- */

export interface HTTPClientRequestOptions {
  readonly method?: HTTPMethod;
  readonly headers?: HTTPHeadersInit;
  readonly body?: unknown;
  readonly signal?: AbortSignal;
  readonly timeout?: number;
}

export interface HTTPClientResponse<
  T = unknown,
> {
  readonly status: number;
  readonly statusText: string;
  readonly headers: HTTPHeaders;
  readonly data: T;

  json<TData = T>(): Promise<TData>;

  text(): Promise<string>;

  arrayBuffer(): Promise<ArrayBuffer>;
}

/* -------------------------------------------------------------------------- */
/* HTTP Client                                                                */
/* -------------------------------------------------------------------------- */

export interface HTTPClient {
  request<T = unknown>(
    url: string,
    options?: HTTPClientRequestOptions,
  ): Promise<HTTPClientResponse<T>>;

  get<T = unknown>(
    url: string,
    options?: Omit<
      HTTPClientRequestOptions,
      "method" | "body"
    >,
  ): Promise<HTTPClientResponse<T>>;

  post<T = unknown>(
    url: string,
    body?: unknown,
    options?: Omit<
      HTTPClientRequestOptions,
      "method" | "body"
    >,
  ): Promise<HTTPClientResponse<T>>;

  put<T = unknown>(
    url: string,
    body?: unknown,
    options?: Omit<
      HTTPClientRequestOptions,
      "method" | "body"
    >,
  ): Promise<HTTPClientResponse<T>>;

  patch<T = unknown>(
    url: string,
    body?: unknown,
    options?: Omit<
      HTTPClientRequestOptions,
      "method" | "body"
    >,
  ): Promise<HTTPClientResponse<T>>;

  delete<T = unknown>(
    url: string,
    options?: Omit<
      HTTPClientRequestOptions,
      "method" | "body"
    >,
  ): Promise<HTTPClientResponse<T>>;
}

/* -------------------------------------------------------------------------- */
/* Utilities                                                                  */
/* -------------------------------------------------------------------------- */

export type HTTPHandlerResult =
  | void
  | unknown
  | Promise<unknown>;

export type HTTPState =
  Record<string, unknown>;

export type HTTPMiddlewareFactory<
  State = HTTPState,
  Options = unknown,
> = (
  options?: Options,
) => HTTPMiddleware<State>;