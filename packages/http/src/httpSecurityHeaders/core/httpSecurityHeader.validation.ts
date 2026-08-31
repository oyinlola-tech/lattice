/**
 * Security headers validation.
 *
 * @module httpSecurityHeaders/validation
 */

import type {
  ReferrerPolicyValue,
  CrossOriginEmbedderPolicy,
  CrossOriginOpenerPolicy,
  CrossOriginResourcePolicy,
} from "./httpSecurityHeader.type.js";

/**
 * Validates a complete set of security headers.
 */
export function validateSecurityHeaders(
  headers: Readonly<Record<string, string>>,
): { readonly valid: boolean; readonly errors: readonly string[] } {
  const errors: string[] = [];

  const csp = headers["content-security-policy"];
  if (csp) {
    if (!csp.includes("default-src")) {
      errors.push("CSP should include default-src directive");
    }
  }

  const hsts = headers["strict-transport-security"];
  if (hsts) {
    const maxAgeMatch = hsts.match(/max-age=(\d+)/);
    if (!maxAgeMatch) {
      errors.push("HSTS must include max-age directive");
    }
  }

  const referrerPolicy = headers["referrer-policy"];
  if (referrerPolicy) {
    if (!validateReferrerPolicy(referrerPolicy)) {
      errors.push(`Invalid Referrer-Policy value: ${referrerPolicy}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates a header name.
 */
export function validateHeaderName(
  name: string,
): { readonly valid: boolean; readonly error?: string } {
  if (!name || name.length === 0) {
    return { valid: false, error: "Header name cannot be empty" };
  }

  if (/\s/.test(name)) {
    return { valid: false, error: "Header name cannot contain whitespace" };
  }

  if (/[:;=]/.test(name)) {
    return { valid: false, error: "Header name contains invalid characters" };
  }

  return { valid: true };
}

/**
 * Validates a header value.
 */
export function validateHeaderValue(
  value: string,
): { readonly valid: boolean; readonly error?: string } {
  if (value.includes("\r") || value.includes("\n")) {
    return { valid: false, error: "Header value cannot contain CRLF" };
  }

  return { valid: true };
}

/**
 * Validates a Referrer-Policy value.
 */
export function validateReferrerPolicy(
  value: string,
): value is ReferrerPolicyValue {
  const validPolicies: readonly string[] = [
    "no-referrer",
    "no-referrer-when-downgrade",
    "origin",
    "origin-when-cross-origin",
    "same-origin",
    "strict-origin",
    "strict-origin-when-cross-origin",
    "unsafe-url",
    "",
  ];
  return validPolicies.includes(value);
}

/**
 * Validates a Cross-Origin-Embedder-Policy value.
 */
export function validateCrossOriginEmbedderPolicy(
  value: string,
): value is CrossOriginEmbedderPolicy {
  const validPolicies: readonly string[] = [
    "require-corp",
    "credentialless",
    "unsafe-none",
  ];
  return validPolicies.includes(value);
}

/**
 * Validates a Cross-Origin-Opener-Policy value.
 */
export function validateCrossOriginOpenerPolicy(
  value: string,
): value is CrossOriginOpenerPolicy {
  const validPolicies: readonly string[] = [
    "unsafe-none",
    "same-origin-allow-popups",
    "same-origin",
    "restrict-properties",
    "restrict-properties-plus-coep",
  ];
  return validPolicies.includes(value);
}

/**
 * Validates a Cross-Origin-Resource-Policy value.
 */
export function validateCrossOriginResourcePolicy(
  value: string,
): value is CrossOriginResourcePolicy {
  const validPolicies: readonly string[] = [
    "same-site",
    "same-origin",
    "cross-origin",
  ];
  return validPolicies.includes(value);
}
