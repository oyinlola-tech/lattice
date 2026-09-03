/**
 * @zudoliblib/security — Security Headers
 *
 * Generates security-related HTTP response headers with secure defaults.
 */

import type { SecurityHeadersConfig } from "../types/security.type.js";

/** Security header names. */
export const SECURITY_HEADER_NAMES = {
  CONTENT_SECURITY_POLICY: "Content-Security-Policy",
  CONTENT_TYPE_OPTIONS: "X-Content-Type-Options",
  FRAME_OPTIONS: "X-Frame-Options",
  XSS_PROTECTION: "X-XSS-Protection",
  HSTS: "Strict-Transport-Security",
  REFERRER_POLICY: "Referrer-Policy",
  PERMISSIONS_POLICY: "Permissions-Policy",
  DNS_PREFETCH_CONTROL: "X-DNS-Prefetch-Control",
  OPENER_POLICY: "Cross-Origin-Opener-Policy",
  RESOURCE_POLICY: "Cross-Origin-Resource-Policy",
} as const;

/** Default security headers. */
const DEFAULT_HEADERS: Record<string, string> = {
  [SECURITY_HEADER_NAMES.CONTENT_TYPE_OPTIONS]: "nosniff",
  [SECURITY_HEADER_NAMES.FRAME_OPTIONS]: "DENY",
  [SECURITY_HEADER_NAMES.XSS_PROTECTION]: "1; mode=block",
  [SECURITY_HEADER_NAMES.REFERRER_POLICY]: "strict-origin-when-cross-origin",
  [SECURITY_HEADER_NAMES.DNS_PREFETCH_CONTROL]: "off",
  [SECURITY_HEADER_NAMES.OPENER_POLICY]: "same-origin",
  [SECURITY_HEADER_NAMES.RESOURCE_POLICY]: "same-origin",
};

/**
 * Generates security headers with secure defaults.
 *
 * @param config - Optional security headers configuration.
 * @returns Record of security headers to set on the response.
 */
export function generateSecurityHeaders(
  config?: SecurityHeadersConfig,
): Record<string, string> {
  const headers: Record<string, string> = { ...DEFAULT_HEADERS };

  if (config?.contentSecurityPolicy) {
    headers[SECURITY_HEADER_NAMES.CONTENT_SECURITY_POLICY] =
      config.contentSecurityPolicy;
  }

  if (config?.contentTypeOptions) {
    headers[SECURITY_HEADER_NAMES.CONTENT_TYPE_OPTIONS] =
      config.contentTypeOptions;
  }

  if (config?.frameOptions) {
    headers[SECURITY_HEADER_NAMES.FRAME_OPTIONS] = config.frameOptions;
  }

  if (config?.xssProtection) {
    headers[SECURITY_HEADER_NAMES.XSS_PROTECTION] = config.xssProtection;
  }

  if (config?.hsts) {
    headers[SECURITY_HEADER_NAMES.HSTS] = config.hsts;
  }

  if (config?.referrerPolicy) {
    headers[SECURITY_HEADER_NAMES.REFERRER_POLICY] = config.referrerPolicy;
  }

  if (config?.permissionsPolicy) {
    headers[SECURITY_HEADER_NAMES.PERMISSIONS_POLICY] =
      config.permissionsPolicy;
  }

  if (config?.dnsPrefetchControl) {
    headers[SECURITY_HEADER_NAMES.DNS_PREFETCH_CONTROL] =
      config.dnsPrefetchControl;
  }

  if (config?.openerPolicy) {
    headers[SECURITY_HEADER_NAMES.OPENER_POLICY] = config.openerPolicy;
  }

  if (config?.resourcePolicy) {
    headers[SECURITY_HEADER_NAMES.RESOURCE_POLICY] = config.resourcePolicy;
  }

  return headers;
}

/**
 * Checks if a response already has security headers set.
 *
 * @param headers - Response headers.
 * @returns An array of missing security header names.
 */
export function getMissingSecurityHeaders(
  headers: Record<string, string | string[] | undefined>,
): string[] {
  const missing: string[] = [];
  const lowerHeaders = new Map(
    Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v]),
  );

  for (const name of Object.values(SECURITY_HEADER_NAMES)) {
    if (!lowerHeaders.has(name.toLowerCase())) {
      missing.push(name);
    }
  }

  return missing;
}

/**
 * Creates a CSP nonce for inline scripts.
 *
 * @param nonceLength - Length of the nonce (default: 16).
 * @returns The base64-encoded nonce.
 */
export function generateCspNonce(nonceLength?: number): string {
  const { randomBytes } =
    require("node:crypto") as typeof import("node:crypto");
  const length = nonceLength ?? 16;
  return randomBytes(length).toString("base64");
}

/**
 * Validates a Content-Security-Policy directive.
 *
 * @param directive - The CSP directive string.
 * @returns An error message if invalid, or undefined.
 */
export function validateCspDirective(directive: string): string | undefined {
  if (!directive || directive.trim().length === 0) {
    return "CSP directive cannot be empty";
  }

  // Check for unsafe-inline, unsafe-eval (warnings)
  const warnings: string[] = [];

  if (directive.includes("'unsafe-inline'")) {
    warnings.push("unsafe-inline weakens CSP");
  }

  if (directive.includes("'unsafe-eval'")) {
    warnings.push("unsafe-eval weakens CSP");
  }

  if (directive.includes("'unsafe-hashes'")) {
    warnings.push("unsafe-hashes weakens CSP");
  }

  // Return first warning as info (not error)
  return warnings.length > 0 ? warnings[0] : undefined;
}
