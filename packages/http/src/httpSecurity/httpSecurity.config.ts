/**
 * @lattice/http — Security configuration types.
 *
 * Defines the configuration for HTTP security features:
 * body limits, header validation, host validation, proxy trust,
 * timeouts, and abort propagation.
 */

/** Configuration for HTTP request security guards. */
export interface HTTPSecurityConfig {
  /** Maximum request body size in bytes (default: 1MB). */
  readonly maxBodySize?: number;
  /** Maximum number of headers allowed (default: 100). */
  readonly maxHeaders?: number;
  /** Maximum individual header value size in bytes (default: 8KB). */
  readonly maxHeaderValueSize?: number;
  /** Maximum request URL length (default: 2048). */
  readonly maxUrlLength?: number;
  /** Maximum query string length (default: 4096). */
  readonly maxQueryLength?: number;
  /** Allowed Host header values. Empty = allow all. */
  readonly allowedHosts?: readonly string[];
  /** Whether to trust X-Forwarded-* headers (default: false). */
  readonly trustProxy?: boolean;
  /** Number of trusted proxy hops (default: 0). */
  readonly trustedProxyCount?: number;
  /** Request timeout in milliseconds (default: 30000). */
  readonly requestTimeout?: number;
  /** Headers timeout in milliseconds (default: 10000). */
  readonly headersTimeout?: number;
  /** Keep-alive timeout in milliseconds (default: 5000). */
  readonly keepAliveTimeout?: number;
  /** Maximum request ID length (default: 128). */
  readonly maxRequestIdLength?: number;
  /** Characters allowed in request IDs (default: alphanumeric + hyphens + underscores). */
  readonly requestIdPattern?: RegExp;
  /** Whether to enable CRLF injection protection (default: true). */
  readonly enableCrlfProtection?: boolean;
  /** Whether to enable request smuggling protection (default: true). */
  readonly enableSmugglingProtection?: boolean;
}

/** Default security configuration. */
export const DEFAULT_SECURITY_CONFIG: Required<HTTPSecurityConfig> = Object.freeze({
  maxBodySize: 1_048_576, // 1MB
  maxHeaders: 100,
  maxHeaderValueSize: 8_192, // 8KB
  maxUrlLength: 2048,
  maxQueryLength: 4096,
  allowedHosts: [],
  trustProxy: false,
  trustedProxyCount: 0,
  requestTimeout: 30_000, // 30s
  headersTimeout: 10_000, // 10s
  keepAliveTimeout: 5_000, // 5s
  maxRequestIdLength: 128,
  requestIdPattern: /^[a-zA-Z0-9_-]+$/,
  enableCrlfProtection: true,
  enableSmugglingProtection: true,
});
