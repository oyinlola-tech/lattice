/**
 * HTTP request context type definitions.
 *
 * Types for HTTP method, headers, query, params, body, state,
 * init options, and snapshot shape.
 */

export type HttpMethod =
  | "GET"
  | "HEAD"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "OPTIONS"
  | "CONNECT"
  | "TRACE"
  | string;

export type RequestHeaders =
  Readonly<
    Record<string, string>
  >;

export type RequestQuery =
  Readonly<
    Record<
      string,
      string |
        readonly string[] |
        undefined
    >
  >;

export type RequestParams =
  Readonly<
    Record<
      string,
      string | undefined
    >
  >;

export type RequestBody =
  | unknown;

export type RequestState =
  Record<
    string | symbol,
    unknown
  >;

export interface RequestContextInit {
  readonly id?:
    | string;

  readonly method:
    | HttpMethod;

  readonly url:
    | string;

  readonly headers?:
    | RequestHeaders;

  readonly query?:
    | RequestQuery;

  readonly params?:
    | RequestParams;

  readonly body?:
    | RequestBody;

  readonly remoteAddress?:
    | string;

  readonly protocol?:
    | string;

  readonly hostname?:
    | string;

  readonly port?:
    | number;

  readonly path?:
    | string;

  readonly signal?:
    | AbortSignal;

  readonly state?:
    | RequestState;

  readonly metadata?:
    | Readonly<
        Record<string, unknown>
      >;
}

export interface RequestContextSnapshot {
  readonly id:
    | string;

  readonly method:
    | HttpMethod;

  readonly url:
    | string;

  readonly path:
    | string;

  readonly headers:
    | RequestHeaders;

  readonly query:
    | RequestQuery;

  readonly params:
    | RequestParams;

  readonly body:
    | RequestBody;

  readonly remoteAddress:
    | string
    | undefined;

  readonly protocol:
    | string
    | undefined;

  readonly hostname:
    | string
    | undefined;

  readonly port:
    | number
    | undefined;

  readonly state:
    | Readonly<RequestState>;

  readonly metadata:
    | Readonly<
        Record<string, unknown>
      >;

  readonly createdAt:
    | number;
}
