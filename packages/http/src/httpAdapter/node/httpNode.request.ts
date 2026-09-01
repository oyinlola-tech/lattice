/**
 * Node.js HTTP request parsing helpers.
 *
 * @module httpAdapter/node/request
 */

import type { IncomingMessage } from "node:http";

import {
  HttpRequestContext,
  createRequestContext,
} from "../../httpRequest/httpRequest.context.js";

import type { RequestContextInit } from "../../httpRequest/httpRequest.context.js";

import {
  isTrustedProxy,
  parseForwardedFor,
} from "../../httpTrustProxy/httpTrustProxy.core.js";

import type { NodeRequestOptions } from "./httpNode.type.js";

import { DEFAULT_MAX_BODY_SIZE, validateMaxBodySize } from "./httpNode.type.js";

import { getHeader } from "./httpNode.server.js";

/* -------------------------------------------------------------------------- */
/* Node Request Helpers                                                       */
/* -------------------------------------------------------------------------- */

export function getNodeRequestHeaders(
  request: IncomingMessage,
): Readonly<Record<string, string>> {
  const headers: Record<string, string> = {};

  for (const [name, value] of Object.entries(request.headers)) {
    if (Array.isArray(value)) {
      headers[name] = value.join(", ");
    } else if (value !== undefined) {
      headers[name] = value;
    }
  }

  return Object.freeze(headers);
}

export function getNodeRequestProtocol(
  request: IncomingMessage,
  options: NodeRequestOptions = {},
): string {
  const trustProxy = options.trustProxy ?? false;

  if (trustProxy !== false) {
    const forwardedProto = request.headers["x-forwarded-proto"];

    if (typeof forwardedProto === "string") {
      const proto = forwardedProto.split(",")[0]?.trim().toLowerCase();

      if (proto === "http" || proto === "https") {
        return proto;
      }
    }
  }

  return (request.socket as unknown as { encrypted?: boolean })?.encrypted
    ? "https"
    : "http";
}

export function getNodeRequestHostname(
  request: IncomingMessage,
  options: NodeRequestOptions = {},
): string {
  const trustProxy = options.trustProxy ?? false;

  if (trustProxy !== false) {
    const forwardedHost = request.headers["x-forwarded-host"];

    if (typeof forwardedHost === "string") {
      const host = forwardedHost.split(",")[0]?.trim();

      if (host) {
        return host.split(":")[0] ?? host;
      }
    }
  }

  const hostHeader = request.headers.host;

  if (typeof hostHeader === "string") {
    return hostHeader.split(":")[0] ?? hostHeader;
  }

  return request.socket?.localAddress ?? "127.0.0.1";
}

export function getNodeRequestPort(
  request: IncomingMessage,
  options: NodeRequestOptions = {},
): number {
  const trustProxy = options.trustProxy ?? false;

  if (trustProxy !== false) {
    const forwardedHost = request.headers["x-forwarded-host"];

    if (typeof forwardedHost === "string") {
      const host = forwardedHost.split(",")[0]?.trim();

      if (host) {
        const portPart = host.split(":")[1];

        if (portPart) {
          const port = Number(portPart);

          if (Number.isInteger(port) && port > 0 && port < 65536) {
            return port;
          }
        }
      }
    }
  }

  const hostHeader = request.headers.host;

  if (typeof hostHeader === "string") {
    const portPart = hostHeader.split(":")[1];

    if (portPart) {
      const port = Number(portPart);

      if (Number.isInteger(port) && port > 0 && port < 65536) {
        return port;
      }
    }
  }

  return request.socket?.localPort ?? 80;
}

export function getNodeRemoteAddress(
  request: IncomingMessage,
  options: NodeRequestOptions = {},
): string | undefined {
  const trustProxy = options.trustProxy ?? false;

  if (trustProxy !== false && typeof trustProxy === "object") {
    const forwardedFor = request.headers["x-forwarded-for"];
    if (typeof forwardedFor === "string") {
      const addresses = forwardedFor.split(",");
      const first = addresses[0]?.trim();
      if (first) {
        return first;
      }
    }
  }

  return request.socket?.remoteAddress ?? undefined;
}

export function parseNodeQuery(
  request: IncomingMessage,
): Readonly<Record<string, string>> {
  const url = request.url;

  if (!url) {
    return Object.freeze({});
  }

  const questionIndex = url.indexOf("?");

  if (questionIndex === -1) {
    return Object.freeze({});
  }

  const queryString = url.slice(questionIndex + 1);

  if (!queryString) {
    return Object.freeze({});
  }

  const params: Record<string, string> = {};

  for (const pair of queryString.split("&")) {
    const [key, value] = pair.split("=");

    if (key) {
      params[decodeURIComponent(key)] =
        value !== undefined ? decodeURIComponent(value) : "";
    }
  }

  return Object.freeze(params);
}

/* -------------------------------------------------------------------------- */
/* Request Context                                                            */
/* -------------------------------------------------------------------------- */

export function createNodeRequestContext(
  request: IncomingMessage,
  options: NodeRequestOptions = {},
): HttpRequestContext {
  const headers = getNodeRequestHeaders(request);

  const protocol = getNodeRequestProtocol(request, options);

  const hostname = getNodeRequestHostname(request, options);

  const port = getNodeRequestPort(request, options);

  const remoteAddress = getNodeRemoteAddress(request, options);

  const query = parseNodeQuery(request);

  const url = request.url ?? "/";

  return createRequestContext({
    method: (request.method as string)?.toUpperCase() ?? "GET",
    url,
    protocol,
    hostname,
    port,
    headers,
    query,
    remoteAddress,
  });
}
