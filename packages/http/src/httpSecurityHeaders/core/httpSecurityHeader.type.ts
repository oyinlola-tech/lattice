/**
 * Security headers types and constants.
 *
 * @module httpSecurityHeaders/types
 */

export interface SecurityHeadersOptions {
  readonly contentSecurityPolicy?: boolean | string;
  readonly strictTransportSecurity?:
    | boolean
    | {
        readonly maxAge?: number;
        readonly includeSubDomains?: boolean;
        readonly preload?: boolean;
      };
  readonly xContentTypeOptions?: boolean;
  readonly xFrameOptions?: boolean | XFrameOptions;
  readonly xXssProtection?: boolean | string;
  readonly referrerPolicy?: boolean | ReferrerPolicyValue;
  readonly permissionsPolicy?: boolean | PermissionsPolicy;
  readonly crossOriginEmbedderPolicy?: boolean | CrossOriginEmbedderPolicy;
  readonly crossOriginOpenerPolicy?: boolean | CrossOriginOpenerPolicy;
  readonly crossOriginResourcePolicy?: boolean | CrossOriginResourcePolicy;
  readonly xPermittedCrossDomainPolicies?:
    boolean | XPermittedCrossDomainPolicy;
  readonly expectCt?:
    | boolean
    | {
        readonly maxAge?: number;
        readonly enforce?: boolean;
        readonly reportUri?: string;
      };
}

export type SecurityHeaders = {
  readonly "content-security-policy"?: string;
  readonly "strict-transport-security"?: string;
  readonly "x-content-type-options"?: string;
  readonly "x-frame-options"?: string;
  readonly "x-xss-protection"?: string;
  readonly "referrer-policy"?: string;
  readonly "permissions-policy"?: string;
  readonly "cross-origin-embedder-policy"?: string;
  readonly "cross-origin-opener-policy"?: string;
  readonly "cross-origin-resource-policy"?: string;
  readonly "x-permitted-cross-domain-policies"?: string;
  readonly "expect-ct"?: string;
};

export type XFrameOptions = "DENY" | "SAMEORIGIN" | `ALLOW-FROM ${string}`;

export type ReferrerPolicyValue =
  | "no-referrer"
  | "no-referrer-when-downgrade"
  | "origin"
  | "origin-when-cross-origin"
  | "same-origin"
  | "strict-origin"
  | "strict-origin-when-cross-origin"
  | "unsafe-url"
  | "";

export type CrossOriginEmbedderPolicy =
  "require-corp" | "credentialless" | "unsafe-none";

export type CrossOriginOpenerPolicy =
  | "unsafe-none"
  | "same-origin-allow-popups"
  | "same-origin"
  | "restrict-properties"
  | "restrict-properties-plus-coep";

export type CrossOriginResourcePolicy =
  "same-site" | "same-origin" | "cross-origin";

export type XPermittedCrossDomainPolicy =
  "none" | "master-only" | "by-content-type" | "all";

export type PermissionsPolicy = Readonly<
  Record<string, PermissionsPolicyValue>
>;

export type PermissionsPolicyValue = boolean | readonly string[] | string;

export const SECURITY_HEADER_NAMES = {
  CSP: "content-security-policy",
  HSTS: "strict-transport-security",
  XCTO: "x-content-type-options",
  XFO: "x-frame-options",
  XSS: "x-xss-protection",
  RP: "referrer-policy",
  PP: "permissions-policy",
  COEP: "cross-origin-embedder-policy",
  COOP: "cross-origin-opener-policy",
  CORP: "cross-origin-resource-policy",
  XPCDP: "x-permitted-cross-domain-policies",
  EC: "expect-ct",
} as const;

export const DEFAULT_REFERRER_POLICY: ReferrerPolicyValue =
  "strict-origin-when-cross-origin";

export const DEFAULT_X_CONTENT_TYPE_OPTIONS = "nosniff" as const;
