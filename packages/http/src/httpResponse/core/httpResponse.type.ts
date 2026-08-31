/**
 * Response context types.
 *
 * @module httpResponse/types
 */

export type ResponseBody =
  | string
  | Buffer
  | Uint8Array
  | object
  | null
  | undefined;

export type ResponseHeaders = Record<string, string | string[] | undefined>;

export interface ResponseContextInit {
  readonly status?: number;
  readonly statusText?: string;
  readonly headers?: ResponseHeaders;
  readonly body?: ResponseBody;
  readonly cookies?: readonly ResponseCookie[];
}

export interface ResponseCookie {
  readonly name: string;
  readonly value: string;
  readonly options?: CookieOptions;
}

export interface CookieOptions {
  readonly domain?: string;
  readonly path?: string;
  readonly expires?: Date;
  readonly maxAge?: number;
  readonly httpOnly?: boolean;
  readonly secure?: boolean;
  readonly sameSite?: SameSite;
  readonly priority?: CookiePriority;
  readonly partitioned?: boolean;
}

export type SameSite = "Strict" | "Lax" | "None";

export type CookiePriority = "Low" | "Medium" | "High";

export interface ResponseContextSnapshot {
  readonly status: number;
  readonly statusText: string;
  readonly headers: ResponseHeaders;
  readonly body: ResponseBody;
  readonly cookies: readonly ResponseCookie[];
  readonly sent: boolean;
  readonly timestamp: number;
}

export const DEFAULT_RESPONSE_STATUS = 200;
export const DEFAULT_RESPONSE_STATUS_TEXT = "OK";
