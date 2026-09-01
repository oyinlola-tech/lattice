/**
 * @oyinlola141/lattice-security
 *
 * Security primitives for the Lattice framework.
 *
 * Provides input validation, header security, URL normalization,
 * body limits, cookie security, CORS, CSRF, rate limiting, and
 * security headers with secure defaults.
 *
 * @example
 * ```ts
 * import { validateHeaders, validateUrl, generateSecurityHeaders } from '@oyinlola141/lattice-security';
 *
 * // Validate request headers
 * const result = validateHeaders(request.headers);
 * if (!result.valid) {
 *   throw new Error(result.errors.join(', '));
 * }
 *
 * // Validate URL
 * const urlResult = validateUrl(request.url);
 *
 * // Add security headers
 * const headers = generateSecurityHeaders();
 * ```
 *
 * @packageDocumentation
 */

/* ─── Types ──────────────────────────────────────────────────────────────── */
export type {
  HeaderSecurityConfig,
  HeaderValidationResult,
  BodyLimitConfig,
  BodyLimitPresets,
  UrlValidationConfig,
  UrlValidationResult,
  CookieSecurityConfig,
  ParsedCookie,
  CorsConfig,
  CsrfConfig,
  RateLimitConfig,
  RateLimitRequest,
  RateLimitResponse,
  RateLimitResult,
  SecurityHeadersConfig,
  RequestValidationConfig,
  InputSanitizationConfig,
} from "./types/security.type.js";

export {
  PROTOTYPE_POLLUTION_KEYS,
  SQL_INJECTION_PATTERNS,
  XSS_PATTERNS,
} from "./types/security.type.js";

/* ─── Header Security ────────────────────────────────────────────────────── */
export {
  validateHeaderName,
  validateHeaderValue,
  validateHeaders,
  sanitizeHeaderValue,
  isHopByHopHeader,
} from "./header/index.js";

/* ─── URL Validation ─────────────────────────────────────────────────────── */
export {
  validateUrl,
  normalizePath,
  validateRequestTarget,
  isSafeUrl,
} from "./url/index.js";

/* ─── Body Validation ────────────────────────────────────────────────────── */
export {
  DEFAULT_BODY_LIMITS,
  validateContentLength,
  validateBodySize,
  getBodyLimitForContentType,
  validateBodyLimitConfig,
  createBodySizeChecker,
} from "./body/index.js";

/* ─── Cookie Security ────────────────────────────────────────────────────── */
export {
  parseCookieHeader,
  serializeCookie,
  createSecureCookie,
  validateCookieName,
  validateCookieValue,
  stripSensitiveCookies,
} from "./cookie/index.js";

/* ─── CORS ───────────────────────────────────────────────────────────────── */
export type { CorsHeaders } from "./cors/index.js";
export {
  isOriginAllowed,
  generatePreflightHeaders,
  generateSimpleHeaders,
  isMethodAllowed,
  getDisallowedHeaders,
} from "./cors/index.js";
export { cors } from "./cors/cors.namespace.js";

/* ─── CSRF ───────────────────────────────────────────────────────────────── */
export {
  generateCsrfToken,
  validateCsrfToken,
  requiresCsrfProtection,
  extractCsrfTokenFromHeaders,
  extractCsrfTokenFromCookies,
  generateCsrfCookie,
} from "./csrf/index.js";

/* ─── Rate Limiting ──────────────────────────────────────────────────────── */
export {
  defaultKeyGenerator,
  defaultHandler,
  createRateLimiter,
  extractClientIp,
} from "./rateLimit/index.js";
export { rateLimit } from "./rateLimit/rateLimit.namespace.js";

/* ─── Security Headers ───────────────────────────────────────────────────── */
export { SECURITY_HEADER_NAMES } from "./headers/index.js";
export {
  generateSecurityHeaders,
  getMissingSecurityHeaders,
  generateCspNonce,
  validateCspDirective,
} from "./headers/index.js";

/* ─── Input Sanitization ─────────────────────────────────────────────────── */
export {
  containsSqlInjection,
  containsXss,
  containsPrototypePollution,
  sanitizeString,
  sanitizeObject,
  isSafeString,
  detectThreats,
  escapeHtml,
  stripHtml,
} from "./input/index.js";
