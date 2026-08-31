/**
 * Trust proxy helper functions.
 *
 * @module httpTrustProxy/helpers
 */

import type {
  TrustProxy,
  ProxyRequest,
  ProxyInfo,
} from "./httpTrustProxy.type.js";

import {
  X_FORWARDED_FOR,
  X_FORWARDED_PROTO,
  X_FORWARDED_HOST,
  X_FORWARDED_PORT,
} from "./httpTrustProxy.type.js";

import { compileTrustProxy } from "./httpTrustProxy.compilation.js";
import { getForwardedClientAddresses } from "./httpTrustProxy.parsing.js";

/**
 * Determines if the given address is a trusted proxy.
 */
export function isTrustedProxy(
  address: string,
  trustProxy: TrustProxy,
): boolean {
  const checker = compileTrustProxy(trustProxy);
  return checker(address, 0);
}

/**
 * Gets the client IP address from the request.
 */
export function getClientIp(
  request: ProxyRequest,
  trustProxy: TrustProxy = false,
): string | undefined {
  if (!trustProxy) {
    return request.socket?.remoteAddress;
  }

  const addresses = getForwardedClientAddresses(request);
  const checker = compileTrustProxy(trustProxy);

  for (let i = addresses.length - 1; i >= 0; i--) {
    const addr = addresses[i];
    if (addr && checker(addr.address, i)) {
      continue;
    }
    return addr?.address;
  }

  return request.socket?.remoteAddress;
}

/**
 * Gets the proxy chain from the request.
 */
export function getProxyChain(
  request: ProxyRequest,
): readonly string[] {
  return getForwardedClientAddresses(request).map(
    (addr) => addr.address,
  );
}

/**
 * Gets the request protocol from proxy headers.
 */
export function getRequestProtocol(
  request: ProxyRequest,
  trustProxy: TrustProxy = false,
): string {
  if (!trustProxy) {
    return "http";
  }

  const header = request.headers[X_FORWARDED_PROTO];
  const value = Array.isArray(header) ? header[0] : header;

  return value ?? "http";
}

/**
 * Determines if the request is secure (HTTPS).
 */
export function isSecureRequest(
  request: ProxyRequest,
  trustProxy: TrustProxy = false,
): boolean {
  return getRequestProtocol(request, trustProxy) === "https";
}

/**
 * Gets the request hostname from proxy headers.
 */
export function getRequestHostname(
  request: ProxyRequest,
  trustProxy: TrustProxy = false,
): string | undefined {
  if (!trustProxy) {
    return undefined;
  }

  const header = request.headers[X_FORWARDED_HOST];
  const value = Array.isArray(header) ? header[0] : header;

  return value?.split(":")[0];
}

/**
 * Gets the request port from proxy headers.
 */
export function getRequestPort(
  request: ProxyRequest,
  trustProxy: TrustProxy = false,
): number | undefined {
  if (!trustProxy) {
    return undefined;
  }

  const header = request.headers[X_FORWARDED_PORT];
  const value = Array.isArray(header) ? header[0] : header;

  if (value) {
    const port = parseInt(value, 10);
    if (!isNaN(port)) {
      return port;
    }
  }

  const hostHeader = request.headers[X_FORWARDED_HOST];
  const hostValue = Array.isArray(hostHeader) ? hostHeader[0] : hostHeader;

  if (hostValue) {
    const colonIndex = hostValue.lastIndexOf(":");
    if (colonIndex > 0) {
      const port = parseInt(hostValue.slice(colonIndex + 1), 10);
      if (!isNaN(port)) {
        return port;
      }
    }
  }

  return undefined;
}

/**
 * Gets comprehensive proxy information from the request.
 */
export function getProxyInfo(
  request: ProxyRequest,
  trustProxy: TrustProxy = false,
): ProxyInfo {
  return {
    clientIp: getClientIp(request, trustProxy),
    clientPort: undefined,
    protocol: getRequestProtocol(request, trustProxy),
    hostname: getRequestHostname(request, trustProxy),
    port: getRequestPort(request, trustProxy),
    chain: getProxyChain(request),
  };
}
