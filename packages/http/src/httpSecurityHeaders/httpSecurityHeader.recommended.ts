/**
 * Recommended security headers factory.
 *
 * @module httpSecurityHeaders/recommended
 */

import type { SecurityHeaders } from "./core/httpSecurityHeader.type.js";

import { createSecurityHeaders } from "./httpSecurityHeader.factory.js";

export interface RecommendedSecurityHeadersOptions {
  readonly csp?: boolean | string;
  readonly hsts?: boolean | { readonly maxAge?: number };
  readonly xFrameOptions?: boolean | "DENY" | "SAMEORIGIN";
  readonly referrerPolicy?: boolean;
  readonly permissionsPolicy?: boolean;
  readonly crossOriginPolicies?: boolean;
}

/**
 * Creates a recommended set of security headers.
 */
export function createRecommendedSecurityHeaders(
  options: RecommendedSecurityHeadersOptions = {},
): SecurityHeaders {
  return createSecurityHeaders({
    contentSecurityPolicy: options.csp ?? false,
    strictTransportSecurity: options.hsts ?? false,
    xContentTypeOptions: true,
    xFrameOptions: options.xFrameOptions ?? "DENY",
    referrerPolicy: options.referrerPolicy ?? true,
    permissionsPolicy: options.permissionsPolicy ?? false,
    crossOriginEmbedderPolicy: options.crossOriginPolicies ?? false,
    crossOriginOpenerPolicy: options.crossOriginPolicies ?? false,
    crossOriginResourcePolicy: options.crossOriginPolicies ?? false,
    xPermittedCrossDomainPolicies: true,
  });
}

/**
 * Creates default CSP options for a web application.
 */
export function createDefaultCSPOptions(): Record<string, readonly string[]> {
  return {
    "default-src": ["'self'"],
    "script-src": ["'self'"],
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "data:", "https:"],
    "font-src": ["'self'"],
    "connect-src": ["'self'"],
    "frame-ancestors": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
  };
}

/**
 * Creates default HSTS options.
 */
export function createDefaultHSTSOptions(): {
  readonly maxAge: number;
  readonly includeSubDomains: boolean;
  readonly preload: boolean;
} {
  return {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  };
}
