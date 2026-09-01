/**
 * Forwarded header parsing.
 *
 * @module httpTrustProxy/parsing
 */

import type { ProxyRequest, ForwardedAddress } from "./httpTrustProxy.type.js";

import { X_FORWARDED_FOR, FORWARDED_HEADER } from "./httpTrustProxy.type.js";

/**
 * Parses the X-Forwarded-For header into individual addresses.
 */
export function parseForwardedFor(
  request: ProxyRequest,
): readonly ForwardedAddress[] {
  const header = request.headers[X_FORWARDED_FOR];
  const value = Array.isArray(header) ? header[0] : header;

  if (!value) {
    return [];
  }

  return value.split(",").map((addr) => ({
    address: addr.trim(),
    port: undefined as number | undefined,
    source: X_FORWARDED_FOR,
  }));
}

/**
 * Parses the Forwarded header (RFC 7239).
 */
export function parseForwarded(
  request: ProxyRequest,
): readonly ForwardedAddress[] {
  const header = request.headers[FORWARDED_HEADER];
  const value = Array.isArray(header) ? header[0] : header;

  if (!value) {
    return [];
  }

  return value.split(",").map((entry) => {
    const parts = entry.split(";");
    let address = "";
    let port: number | undefined;

    for (const part of parts) {
      const [key, val] = part.split("=").map((s) => s.trim());
      if (key === "for" && val) {
        address = val.replace(/"/g, "");
      }
      if (key === "proto" && val) {
        // Protocol info is in a different field
      }
    }

    const colonIndex = address.lastIndexOf(":");
    if (colonIndex > 0) {
      const portStr = address.slice(colonIndex + 1);
      const portNum = parseInt(portStr, 10);
      if (!isNaN(portNum)) {
        port = portNum;
        address = address.slice(0, colonIndex);
      }
    }

    return {
      address,
      port: port ?? undefined,
      source: FORWARDED_HEADER,
    };
  });
}

/**
 * Gets all forwarded client addresses from the request.
 */
export function getForwardedClientAddresses(
  request: ProxyRequest,
): readonly ForwardedAddress[] {
  return [...parseForwarded(request), ...parseForwardedFor(request)];
}
