/**
 * Individual security header builders.
 *
 * @module httpSecurityHeaders/individual
 */

import type {
  XFrameOptions,
  ReferrerPolicyValue,
  CrossOriginEmbedderPolicy,
  CrossOriginOpenerPolicy,
  CrossOriginResourcePolicy,
  PermissionsPolicy,
  XPermittedCrossDomainPolicy,
} from "./core/httpSecurityHeader.type.js";

/**
 * Creates a Content-Security-Policy header.
 */
export function contentSecurityPolicyHeader(
  directives: string | Record<string, readonly string[]>,
): string {
  if (typeof directives === "string") {
    return directives;
  }

  return Object.entries(directives)
    .map(([key, values]) => {
      if (Array.isArray(values)) {
        return `${key} ${values.join(" ")}`;
      }
      return key;
    })
    .join("; ");
}

/**
 * Creates a Strict-Transport-Security header.
 */
export function strictTransportSecurityHeader(
  options: {
    readonly maxAge?: number;
    readonly includeSubDomains?: boolean;
    readonly preload?: boolean;
  } = {},
): string {
  const maxAge = options.maxAge ?? 31536000;
  const parts = [`max-age=${maxAge}`];

  if (options.includeSubDomains) {
    parts.push("includeSubDomains");
  }
  if (options.preload) {
    parts.push("preload");
  }

  return parts.join("; ");
}

/**
 * Creates an X-Content-Type-Options header.
 */
export function xContentTypeOptionsHeader(): string {
  return "nosniff";
}

/**
 * Creates an X-Frame-Options header.
 */
export function xFrameOptionsHeader(option: XFrameOptions = "DENY"): string {
  return option;
}

/**
 * Creates a Referrer-Policy header.
 */
export function referrerPolicyHeader(
  policy: ReferrerPolicyValue = "strict-origin-when-cross-origin",
): string {
  return policy;
}

/**
 * Creates a Permissions-Policy header.
 */
export function permissionsPolicyHeader(policy: PermissionsPolicy): string {
  return Object.entries(policy)
    .map(([feature, value]) => {
      if (typeof value === "boolean") {
        return `${feature}=${value ? "*" : "()"}`;
      }
      if (Array.isArray(value)) {
        return `${feature}=(${value.join(" ")})`;
      }
      return `${feature}=${value}`;
    })
    .join(", ");
}

/**
 * Creates a Cross-Origin-Embedder-Policy header.
 */
export function crossOriginEmbedderPolicyHeader(
  policy: CrossOriginEmbedderPolicy = "require-corp",
): string {
  return policy;
}

/**
 * Creates a Cross-Origin-Opener-Policy header.
 */
export function crossOriginOpenerPolicyHeader(
  policy: CrossOriginOpenerPolicy = "same-origin",
): string {
  return policy;
}

/**
 * Creates a Cross-Origin-Resource-Policy header.
 */
export function crossOriginResourcePolicyHeader(
  policy: CrossOriginResourcePolicy = "same-site",
): string {
  return policy;
}

/**
 * Creates an X-Permitted-Cross-Domain-Policies header.
 */
export function xPermittedCrossDomainPoliciesHeader(
  policy: XPermittedCrossDomainPolicy = "none",
): string {
  return policy;
}
