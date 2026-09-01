/**
 * HTTP proxy utilities.
 *
 * Provides framework-agnostic proxy configuration, target resolution,
 * forwarded-header handling, and proxy request helpers.
 *
 * This module does not perform network I/O. Actual proxy transport belongs
 * to the server/client adapter layer.
 */

import type { HTTPHeader } from "../httpProtocol/http.protocol.js";
import {
  appendHeader,
  deleteHeader,
  getHeader,
  hasHeader,
  setHeader,
} from "../httpProtocol/http.protocol.js";
import { isValidHTTPURL, isValidHeaderValue } from "../httpValidation/index.js";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface ProxyTarget {
  readonly url: URL;
  readonly protocol: string;
  readonly hostname: string;
  readonly port: number | undefined;
  readonly pathname: string;
  readonly search: string;
}

export interface ProxyOptions {
  readonly target: string | URL;
  readonly changeOrigin?: boolean;
  readonly preserveHost?: boolean;
  readonly xfwd?: boolean;
  readonly secure?: boolean;
  readonly timeout?: number;
  readonly rewritePath?: (path: string, requestURL: URL) => string;
  readonly headers?: Readonly<Record<string, string>>;
}

export interface ProxyRequest {
  readonly method: string;
  readonly target: ProxyTarget;
  readonly path: string;
  readonly headers: readonly HTTPHeader[];
}

export interface ForwardedAddress {
  readonly protocol?: string;
  readonly host?: string;
  readonly port?: number;
  readonly for?: string;
}

export interface ProxyRewriteOptions {
  readonly stripPrefix?: string;
  readonly prependPrefix?: string;
}

/* -------------------------------------------------------------------------- */
/* Target                                                                     */
/* -------------------------------------------------------------------------- */

export function resolveProxyTarget(target: string | URL): ProxyTarget {
  const url =
    target instanceof URL ? new URL(target.href) : parseProxyURL(target);

  return {
    url,
    protocol: url.protocol,
    hostname: url.hostname,
    port: url.port.length > 0 ? Number(url.port) : undefined,
    pathname: normalizeProxyPath(url.pathname),
    search: url.search,
  };
}

export function isValidProxyTarget(
  target: string | URL | undefined | null,
): boolean {
  if (target === undefined || target === null) {
    return false;
  }

  try {
    const url = target instanceof URL ? target : new URL(target);

    return (
      isValidHTTPURL(url.href) &&
      (url.protocol === "http:" || url.protocol === "https:")
    );
  } catch {
    return false;
  }
}

function parseProxyURL(target: string): URL {
  if (!isValidProxyTarget(target)) {
    throw new TypeError(`Invalid proxy target: ${target}`);
  }

  return new URL(target);
}

/* -------------------------------------------------------------------------- */
/* Path Handling                                                              */
/* -------------------------------------------------------------------------- */

export function joinProxyPath(basePath: string, requestPath: string): string {
  const base = normalizeProxyPath(basePath);

  const request = requestPath.startsWith("/") ? requestPath : `/${requestPath}`;

  if (base === "/") {
    return request;
  }

  return `${base}${request}`.replace(/\/{2,}/g, "/");
}

export function rewriteProxyPath(
  path: string,
  options: ProxyRewriteOptions = {},
): string {
  let result = path.length > 0 ? path : "/";

  if (options.stripPrefix && result.startsWith(options.stripPrefix)) {
    result = result.slice(options.stripPrefix.length);

    if (!result.startsWith("/")) {
      result = `/${result}`;
    }
  }

  if (options.prependPrefix) {
    result = joinProxyPath(options.prependPrefix, result);
  }

  return normalizeProxyPath(result);
}

export function normalizeProxyPath(path: string): string {
  if (path.length === 0) {
    return "/";
  }

  let normalized = path.startsWith("/") ? path : `/${path}`;

  normalized = normalized.replace(/\/{2,}/g, "/");

  if (normalized.length > 1 && normalized.endsWith("/")) {
    normalized = normalized.slice(0, -1);
  }

  return normalized;
}

/* -------------------------------------------------------------------------- */
/* Request Path                                                               */
/* -------------------------------------------------------------------------- */

export function buildProxyRequestPath(
  target: ProxyTarget,
  requestPath: string,
  rewritePath?: (path: string, requestURL: URL) => string,
): string {
  let path = requestPath.length > 0 ? requestPath : "/";

  if (rewritePath) {
    path = rewritePath(path, target.url);
  }

  const targetPath = target.pathname === "/" ? "" : target.pathname;

  const normalized = joinProxyPath(targetPath, path);

  return `${normalized}${target.search}`;
}

/* -------------------------------------------------------------------------- */
/* Proxy Headers                                                              */
/* -------------------------------------------------------------------------- */

export function prepareProxyHeaders(
  headers: readonly HTTPHeader[],
  target: ProxyTarget,
  options: Pick<ProxyOptions, "changeOrigin" | "preserveHost" | "xfwd"> = {},
): HTTPHeader[] {
  let result = headers.map((header) => ({
    name: header.name,
    value: header.value,
  }));

  if (options.changeOrigin && !options.preserveHost) {
    result = setHeader(result, "host", formatHost(target.url));
  }

  if (options.xfwd) {
    result = setForwardedHeaders(result, target);
  }

  return result;
}

export function applyProxyHeaders(
  headers: readonly HTTPHeader[],
  additionalHeaders: Readonly<Record<string, string>> | undefined,
): HTTPHeader[] {
  if (!additionalHeaders) {
    return [...headers];
  }

  let result = [...headers];

  for (const [name, value] of Object.entries(additionalHeaders)) {
    if (!isValidHeaderValue(value)) {
      throw new TypeError(`Invalid proxy header value for ${name}`);
    }

    result = setHeader(result, name, value);
  }

  return result;
}

/* -------------------------------------------------------------------------- */
/* Forwarded Headers                                                          */
/* -------------------------------------------------------------------------- */

export function setForwardedHeaders(
  headers: readonly HTTPHeader[],
  target: ProxyTarget,
  forwardedFor?: string,
): HTTPHeader[] {
  let result = [...headers];

  const protocol = target.url.protocol.replace(":", "");

  result = appendForwardedValue(result, "x-forwarded-proto", protocol);

  result = appendForwardedValue(
    result,
    "x-forwarded-host",
    formatHost(target.url),
  );

  if (target.url.port) {
    result = appendForwardedValue(result, "x-forwarded-port", target.url.port);
  }

  if (forwardedFor) {
    result = appendForwardedValue(result, "x-forwarded-for", forwardedFor);
  }

  return result;
}

function appendForwardedValue(
  headers: readonly HTTPHeader[],
  name: string,
  value: string,
): HTTPHeader[] {
  const existing = getHeader(headers, name);

  if (existing) {
    return setHeader(headers, name, `${existing}, ${value}`);
  }

  return appendHeader(headers, name, value);
}

/* -------------------------------------------------------------------------- */
/* Standard Forwarded Header                                                  */
/* -------------------------------------------------------------------------- */

export function createForwardedHeader(address: ForwardedAddress): string {
  const parts: string[] = [];

  if (address.for) {
    parts.push(`for=${formatForwardedIdentifier(address.for)}`);
  }

  if (address.host) {
    parts.push(`host=${formatForwardedValue(address.host)}`);
  }

  if (address.port !== undefined) {
    parts.push(`port=${address.port}`);
  }

  if (address.protocol) {
    parts.push(`proto=${formatForwardedValue(address.protocol)}`);
  }

  return parts.join("; ");
}

export function parseForwardedHeader(
  value: string | undefined | null,
): ForwardedAddress[] {
  if (!value || value.trim().length === 0) {
    return [];
  }

  return value.split(",").map((entry) => parseForwardedEntry(entry));
}

function parseForwardedEntry(value: string): ForwardedAddress {
  const result: {
    protocol?: string;
    host?: string;
    port?: number;
    for?: string;
  } = {};

  const parameters = value.split(";");

  for (const parameter of parameters) {
    const separator = parameter.indexOf("=");

    if (separator === -1) {
      continue;
    }

    const key = parameter.slice(0, separator).trim().toLowerCase();

    const rawValue = parameter.slice(separator + 1).trim();

    const parsed = unquoteForwardedValue(rawValue);

    switch (key) {
      case "proto":
        result.protocol = parsed;
        break;

      case "host":
        result.host = parsed;
        break;

      case "port": {
        const port = Number(parsed);

        if (Number.isInteger(port) && port >= 0 && port <= 65535) {
          result.port = port;
        }

        break;
      }

      case "for":
        result.for = parsed;
        break;
    }
  }

  return result;
}

/* -------------------------------------------------------------------------- */
/* Proxy Request                                                              */
/* -------------------------------------------------------------------------- */

export function createProxyRequest(
  method: string,
  requestPath: string,
  headers: readonly HTTPHeader[],
  options: ProxyOptions,
): ProxyRequest {
  const target = resolveProxyTarget(options.target);

  let path = buildProxyRequestPath(target, requestPath, options.rewritePath);

  const proxyHeaders = prepareProxyHeaders(headers, target, options);

  const finalHeaders = applyProxyHeaders(proxyHeaders, options.headers);

  return {
    method,
    target,
    path,
    headers: finalHeaders,
  };
}

/* -------------------------------------------------------------------------- */
/* Host Handling                                                              */
/* -------------------------------------------------------------------------- */

export function formatHost(url: URL): string {
  const hostname = url.hostname.includes(":")
    ? `[${url.hostname}]`
    : url.hostname;

  if (!url.port) {
    return hostname;
  }

  return `${hostname}:${url.port}`;
}

export function getProxyHost(target: string | URL): string {
  return formatHost(resolveProxyTarget(target).url);
}

/* -------------------------------------------------------------------------- */
/* Proxy Header Cleanup                                                       */
/* -------------------------------------------------------------------------- */

export function removeHopByHopHeaders(
  headers: readonly HTTPHeader[],
): HTTPHeader[] {
  const connection = getHeader(headers, "connection");

  const connectionTokens =
    connection
      ?.split(",")
      .map((token) => token.trim().toLowerCase())
      .filter(Boolean) ?? [];

  const hopByHop = new Set([
    "connection",
    "keep-alive",
    "proxy-authenticate",
    "proxy-authorization",
    "te",
    "trailer",
    "transfer-encoding",
    "upgrade",
    ...connectionTokens,
  ]);

  return headers.filter((header) => !hopByHop.has(header.name.toLowerCase()));
}

/* -------------------------------------------------------------------------- */
/* Proxy URL Helpers                                                          */
/* -------------------------------------------------------------------------- */

export function resolveProxyURL(target: string | URL, path: string): URL {
  const proxyTarget = resolveProxyTarget(target);

  const result = new URL(proxyTarget.url.href);

  result.pathname = joinProxyPath(proxyTarget.pathname, path);

  return result;
}

export function isSameOrigin(left: string | URL, right: string | URL): boolean {
  try {
    const leftURL = left instanceof URL ? left : new URL(left);

    const rightURL = right instanceof URL ? right : new URL(right);

    return (
      leftURL.protocol === rightURL.protocol &&
      leftURL.hostname === rightURL.hostname &&
      effectivePort(leftURL) === effectivePort(rightURL)
    );
  } catch {
    return false;
  }
}

function effectivePort(url: URL): string {
  if (url.port) {
    return url.port;
  }

  if (url.protocol === "https:") {
    return "443";
  }

  if (url.protocol === "http:") {
    return "80";
  }

  return "";
}

/* -------------------------------------------------------------------------- */
/* Proxy Configuration                                                        */
/* -------------------------------------------------------------------------- */

export function normalizeProxyOptions(options: ProxyOptions): ProxyOptions {
  const target = resolveProxyTarget(options.target);

  if (
    options.timeout !== undefined &&
    (!Number.isFinite(options.timeout) || options.timeout < 0)
  ) {
    throw new RangeError("Proxy timeout must be a non-negative finite number.");
  }

  return {
    ...options,
    target: target.url,
    changeOrigin: options.changeOrigin ?? false,
    preserveHost: options.preserveHost ?? false,
    xfwd: options.xfwd ?? false,
    secure: options.secure ?? target.url.protocol === "https:",
  };
}

/* -------------------------------------------------------------------------- */
/* Internal Forwarded Helpers                                                 */
/* -------------------------------------------------------------------------- */

function formatForwardedIdentifier(value: string): string {
  if (/^[A-Za-z0-9._:-]+$/.test(value)) {
    return value;
  }

  return formatForwardedValue(value);
}

function formatForwardedValue(value: string): string {
  if (/^[A-Za-z0-9._:-]+$/.test(value)) {
    return value;
  }

  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function unquoteForwardedValue(value: string): string {
  if (value.length >= 2 && value.startsWith('"') && value.endsWith('"')) {
    return value.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, "\\");
  }

  return value;
}
