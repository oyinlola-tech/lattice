import type { HTTPRequest, HTTPResponse } from "../httpTypes/http.types.js";

/* -------------------------------------------------------------------------- */
/* Cookie Types                                                               */
/* -------------------------------------------------------------------------- */

export interface CookieOptions {
  readonly maxAge?: number;
  readonly expires?: Date;
  readonly domain?: string;
  readonly path?: string;
  readonly secure?: boolean;
  readonly httpOnly?: boolean;
  readonly sameSite?: CookieSameSite;
  readonly partitioned?: boolean;
  readonly priority?: CookiePriority;
}

export type CookieSameSite = "strict" | "lax" | "none";

export type CookiePriority = "low" | "medium" | "high";

export type CookieValue = string | number | boolean;

/* -------------------------------------------------------------------------- */
/* Cookie Collection                                                          */
/* -------------------------------------------------------------------------- */

export class CookieCollection {
  private readonly values = new Map<string, string>();

  public constructor(
    cookies: Record<string, string> | Map<string, string> = {},
  ) {
    if (cookies instanceof Map) {
      for (const [name, value] of cookies) {
        this.values.set(name, value);
      }

      return;
    }

    for (const [name, value] of Object.entries(cookies)) {
      this.values.set(name, value);
    }
  }

  public get(name: string): string | undefined {
    return this.values.get(name);
  }

  public has(name: string): boolean {
    return this.values.has(name);
  }

  public set(name: string, value: string): this {
    validateCookieName(name);

    this.values.set(name, value);

    return this;
  }

  public delete(name: string): boolean {
    return this.values.delete(name);
  }

  public clear(): void {
    this.values.clear();
  }

  public entries(): IterableIterator<[string, string]> {
    return this.values.entries();
  }

  public keys(): IterableIterator<string> {
    return this.values.keys();
  }

  public valuesIterator(): IterableIterator<string> {
    return this.values.values();
  }

  public toObject(): Record<string, string> {
    return Object.fromEntries(this.values);
  }

  public get size(): number {
    return this.values.size;
  }
}

/* -------------------------------------------------------------------------- */
/* Parse Cookie Header                                                        */
/* -------------------------------------------------------------------------- */

export function parseCookies(header: string | undefined): CookieCollection {
  const cookies = new CookieCollection();

  if (!header) {
    return cookies;
  }

  for (const part of splitCookieHeader(header)) {
    const separator = part.indexOf("=");

    if (separator <= 0) {
      continue;
    }

    const name = part.slice(0, separator).trim();

    const rawValue = part.slice(separator + 1).trim();

    if (!name) {
      continue;
    }

    cookies.set(name, decodeCookieValue(rawValue));
  }

  return cookies;
}

/* -------------------------------------------------------------------------- */
/* Serialize Cookie                                                           */
/* -------------------------------------------------------------------------- */

export function serializeCookie(
  name: string,
  value: CookieValue,
  options: CookieOptions = {},
): string {
  validateCookieName(name);

  const encodedName = name;

  const encodedValue = encodeCookieValue(String(value));

  const parts: string[] = [`${encodedName}=${encodedValue}`];

  if (options.maxAge !== undefined) {
    if (!Number.isFinite(options.maxAge)) {
      throw new TypeError("Cookie maxAge must be a finite number.");
    }

    parts.push(`Max-Age=${Math.floor(options.maxAge)}`);
  }

  if (options.expires) {
    if (Number.isNaN(options.expires.getTime())) {
      throw new TypeError("Cookie expires must be a valid Date.");
    }

    parts.push(`Expires=${options.expires.toUTCString()}`);
  }

  if (options.domain) {
    validateCookieAttribute("domain", options.domain);

    parts.push(`Domain=${options.domain}`);
  }

  if (options.path) {
    validateCookieAttribute("path", options.path);

    parts.push(`Path=${options.path}`);
  }

  if (options.httpOnly) {
    parts.push("HttpOnly");
  }

  if (options.secure) {
    parts.push("Secure");
  }

  if (options.sameSite) {
    const sameSite = normalizeSameSite(options.sameSite);

    parts.push(`SameSite=${sameSite}`);
  }

  if (options.partitioned) {
    parts.push("Partitioned");
  }

  if (options.priority) {
    parts.push(`Priority=${normalizePriority(options.priority)}`);
  }

  return parts.join("; ");
}

/* -------------------------------------------------------------------------- */
/* Cookie Manager                                                             */
/* -------------------------------------------------------------------------- */

export interface CookieManager {
  get(name: string): string | undefined;

  has(name: string): boolean;

  set(name: string, value: CookieValue, options?: CookieOptions): void;

  delete(name: string, options?: CookieOptions): void;

  parse(): CookieCollection;
}

/* -------------------------------------------------------------------------- */
/* Request Cookies                                                            */
/* -------------------------------------------------------------------------- */

export function getRequestCookies(request: HTTPRequest): CookieCollection {
  const header = request.getHeader("cookie");

  return parseCookies(header);
}

export function getRequestCookie(
  request: HTTPRequest,
  name: string,
): string | undefined {
  return getRequestCookies(request).get(name);
}

/* -------------------------------------------------------------------------- */
/* Response Cookies                                                           */
/* -------------------------------------------------------------------------- */

export function setResponseCookie(
  response: HTTPResponse,
  name: string,
  value: CookieValue,
  options: CookieOptions = {},
): void {
  const serialized = serializeCookie(name, value, options);

  appendSetCookieHeader(response, serialized);
}

export function deleteResponseCookie(
  response: HTTPResponse,
  name: string,
  options: CookieOptions = {},
): void {
  setResponseCookie(response, name, "", {
    ...options,
    maxAge: 0,
    expires: new Date(0),
  });
}

/* -------------------------------------------------------------------------- */
/* Response Header Helpers                                                    */
/* -------------------------------------------------------------------------- */

export function appendSetCookieHeader(
  response: HTTPResponse,
  cookie: string,
): void {
  const existing = response.getHeader("Set-Cookie");

  if (existing === undefined) {
    response.setHeader("Set-Cookie", [cookie]);

    return;
  }

  const values = Array.isArray(existing)
    ? existing.map(String)
    : [String(existing)];

  values.push(cookie);

  response.setHeader("Set-Cookie", values);
}

/* -------------------------------------------------------------------------- */
/* Cookie Manager Factory                                                     */
/* -------------------------------------------------------------------------- */

export function createCookieManager(
  request: HTTPRequest,
  response: HTTPResponse,
): CookieManager {
  const parsed = getRequestCookies(request);

  return {
    get(name) {
      return parsed.get(name);
    },

    has(name) {
      return parsed.has(name);
    },

    set(name, value, options) {
      setResponseCookie(response, name, value, options);
    },

    delete(name, options) {
      deleteResponseCookie(response, name, options);
    },

    parse() {
      return parsed;
    },
  };
}

/* -------------------------------------------------------------------------- */
/* Signed Cookies                                                             */
/* -------------------------------------------------------------------------- */

export interface SignedCookieOptions extends CookieOptions {
  readonly secret: string;
}

export interface SignedCookie {
  readonly value: string;
  readonly signature: string;
}

export function serializeSignedCookie(
  name: string,
  value: string,
  options: SignedCookieOptions,
): string {
  const signature = signCookieValue(value, options.secret);

  return serializeCookie(name, `${value}.${signature}`, options);
}

export function parseSignedCookie(
  value: string | undefined,
  secret: string,
): string | undefined {
  if (!value) {
    return undefined;
  }

  const separator = value.lastIndexOf(".");

  if (separator <= 0) {
    return undefined;
  }

  const originalValue = value.slice(0, separator);

  const signature = value.slice(separator + 1);

  const expected = signCookieValue(originalValue, secret);

  if (!timingSafeEqual(signature, expected)) {
    return undefined;
  }

  return originalValue;
}

export function signCookieValue(value: string, secret: string): string {
  if (!secret) {
    throw new TypeError("Cookie signing secret cannot be empty.");
  }

  const data = `${secret}:${value}`;

  return simpleHash(data);
}

/* -------------------------------------------------------------------------- */
/* Cookie Encoding                                                            */
/* -------------------------------------------------------------------------- */

function encodeCookieValue(value: string): string {
  return encodeURIComponent(value).replace(/%20/g, " ");
}

function decodeCookieValue(value: string): string {
  const unquoted =
    value.length >= 2 && value.startsWith('"') && value.endsWith('"')
      ? value.slice(1, -1)
      : value;

  try {
    return decodeURIComponent(unquoted);
  } catch {
    return unquoted;
  }
}

/* -------------------------------------------------------------------------- */
/* Header Parsing                                                             */
/* -------------------------------------------------------------------------- */

function splitCookieHeader(header: string): string[] {
  const result: string[] = [];

  let start = 0;

  let quoted = false;

  for (let index = 0; index < header.length; index += 1) {
    const character = header[index];

    if (character === '"') {
      quoted = !quoted;

      continue;
    }

    if (character === ";" && !quoted) {
      result.push(header.slice(start, index));

      start = index + 1;
    }
  }

  result.push(header.slice(start));

  return result;
}

/* -------------------------------------------------------------------------- */
/* Validation                                                                 */
/* -------------------------------------------------------------------------- */

function validateCookieName(name: string): void {
  if (!name) {
    throw new TypeError("Cookie name cannot be empty.");
  }

  if (/[\s;,=]/.test(name)) {
    throw new TypeError(`Invalid cookie name: ${name}`);
  }
}

function validateCookieAttribute(attribute: string, value: string): void {
  if (/[\r\n;]/.test(value)) {
    throw new TypeError(`Invalid cookie ${attribute}.`);
  }
}

function normalizeSameSite(value: CookieSameSite): string {
  switch (value) {
    case "strict":
      return "Strict";

    case "lax":
      return "Lax";

    case "none":
      return "None";

    default:
      throw new TypeError(`Invalid SameSite value: ${String(value)}`);
  }
}

function normalizePriority(value: CookiePriority): string {
  switch (value) {
    case "low":
      return "Low";

    case "medium":
      return "Medium";

    case "high":
      return "High";

    default:
      throw new TypeError(`Invalid cookie priority: ${String(value)}`);
  }
}

/* -------------------------------------------------------------------------- */
/* Hash Helpers                                                               */
/* -------------------------------------------------------------------------- */

function simpleHash(input: string): string {
  let hash = 2166136261;

  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);

    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(16);
}

function timingSafeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) {
    return false;
  }

  let difference = 0;

  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return difference === 0;
}
