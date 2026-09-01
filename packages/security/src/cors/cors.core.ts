/**
 * @oyinlola141/lattice-security — CORS
 *
 * Validates and generates CORS headers for cross-origin requests.
 */

import type { CorsConfig } from "../types/security.type.js";

/** Default CORS configuration (restrictive). */
const DEFAULT_CORS_CONFIG: Required<Omit<CorsConfig, "origin">> & {
  origin: undefined;
} = {
  origin: undefined,
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: [],
  credentials: false,
  maxAge: 86400,
};

/**
 * CORS headers that should be set on responses.
 */
export interface CorsHeaders {
  "Access-Control-Allow-Origin"?: string;
  "Access-Control-Allow-Methods"?: string;
  "Access-Control-Allow-Headers"?: string;
  "Access-Control-Expose-Headers"?: string;
  "Access-Control-Allow-Credentials"?: string;
  "Access-Control-Max-Age"?: string;
}

/**
 * Checks if a request origin is allowed.
 *
 * @param origin - The request Origin header value.
 * @param config - CORS configuration.
 * @returns The allowed origin value, or undefined if not allowed.
 */
export function isOriginAllowed(
  origin: string | undefined,
  config: CorsConfig,
): string | undefined {
  if (!origin) {
    return undefined;
  }

  const allowedOrigin = config.origin;

  if (allowedOrigin === undefined) {
    // No origin configuration = no CORS headers
    return undefined;
  }

  // Function check
  if (typeof allowedOrigin === "function") {
    return allowedOrigin(origin) ? origin : undefined;
  }

  // Regex check
  if (allowedOrigin instanceof RegExp) {
    return allowedOrigin.test(origin) ? origin : undefined;
  }

  // String check
  if (typeof allowedOrigin === "string") {
    if (allowedOrigin === "*") {
      return "*";
    }
    return allowedOrigin === origin ? origin : undefined;
  }

  // Array check
  if (Array.isArray(allowedOrigin)) {
    if (allowedOrigin.includes(origin)) {
      return origin;
    }
    // Check for wildcard in array
    if (allowedOrigin.includes("*")) {
      return "*";
    }
    return undefined;
  }

  return undefined;
}

/**
 * Generates CORS headers for a preflight request.
 *
 * @param requestOrigin - The request Origin header.
 * @param config - CORS configuration.
 * @returns CORS headers to set on the response.
 */
export function generatePreflightHeaders(
  requestOrigin: string | undefined,
  config: CorsConfig,
): CorsHeaders {
  const headers: CorsHeaders = {};

  const allowedOrigin = isOriginAllowed(requestOrigin, config);
  if (allowedOrigin) {
    headers["Access-Control-Allow-Origin"] = allowedOrigin;
  } else {
    // No matching origin — don't set CORS headers
    return headers;
  }

  const methods = config.methods ?? DEFAULT_CORS_CONFIG.methods;
  headers["Access-Control-Allow-Methods"] = methods.join(", ");

  const allowedHeaders =
    config.allowedHeaders ?? DEFAULT_CORS_CONFIG.allowedHeaders;
  headers["Access-Control-Allow-Headers"] = allowedHeaders.join(", ");

  if (config.credentials) {
    headers["Access-Control-Allow-Credentials"] = "true";
  }

  const maxAge = config.maxAge ?? DEFAULT_CORS_CONFIG.maxAge;
  headers["Access-Control-Max-Age"] = String(maxAge);

  return headers;
}

/**
 * Generates CORS headers for a simple request.
 *
 * @param requestOrigin - The request Origin header.
 * @param config - CORS configuration.
 * @returns CORS headers to set on the response.
 */
export function generateSimpleHeaders(
  requestOrigin: string | undefined,
  config: CorsConfig,
): CorsHeaders {
  const headers: CorsHeaders = {};

  const allowedOrigin = isOriginAllowed(requestOrigin, config);
  if (allowedOrigin) {
    headers["Access-Control-Allow-Origin"] = allowedOrigin;
  }

  if (config.credentials) {
    headers["Access-Control-Allow-Credentials"] = "true";
  }

  const exposedHeaders = config.exposedHeaders;
  if (exposedHeaders && exposedHeaders.length > 0) {
    headers["Access-Control-Expose-Headers"] = exposedHeaders.join(", ");
  }

  return headers;
}

/**
 * Validates that a requested method is allowed.
 *
 * @param method - The HTTP method from Access-Control-Request-Method.
 * @param config - CORS configuration.
 * @returns True if the method is allowed.
 */
export function isMethodAllowed(method: string, config: CorsConfig): boolean {
  const allowedMethods = config.methods ?? DEFAULT_CORS_CONFIG.methods;
  return allowedMethods.includes(method.toUpperCase());
}

/**
 * Validates that all requested headers are allowed.
 *
 * @param headers - Headers from Access-Control-Request-Headers.
 * @param config - CORS configuration.
 * @returns An array of disallowed headers, or empty array if all allowed.
 */
export function getDisallowedHeaders(
  headers: string[],
  config: CorsConfig,
): string[] {
  const allowedHeaders = new Set(
    (config.allowedHeaders ?? DEFAULT_CORS_CONFIG.allowedHeaders).map((h) =>
      h.toLowerCase(),
    ),
  );

  return headers.filter((h) => !allowedHeaders.has(h.toLowerCase()));
}
