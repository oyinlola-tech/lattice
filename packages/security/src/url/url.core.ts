/**
 * @zudo/security — URL Validation
 *
 * Validates and normalizes URLs, prevents path traversal attacks,
 * and ensures request targets are safe.
 */

import type {
  UrlValidationConfig,
  UrlValidationResult,
} from "../types/security.type.js";

/** Default maximum URL length. */
const DEFAULT_MAX_URL_LENGTH = 2048;

/** Default allowed protocols. */
const DEFAULT_ALLOWED_PROTOCOLS = ["http:", "https:"];

/**
 * Path traversal patterns that indicate directory traversal attacks.
 */
const TRAVERSAL_PATTERNS = [
  /\.\./, // Simple ..
  /%2e%2e/i, // URL-encoded ..
  /%252e%252e/i, // Double-encoded ..
  /\.\.%2f/i, // Mixed encoding
  /\.\.%5c/i, // Mixed encoding with backslash
];

/**
 * Null byte patterns.
 */
const NULL_BYTE_PATTERNS = [
  /\x00/, // Actual null byte
  /%00/i, // URL-encoded null byte
  /%2500/i, // Double-encoded null byte
];

/**
 * Invalid percent-encoding patterns.
 */
const INVALID_PERCENT_ENCODING = /%[^0-9a-fA-F]|%(?:[0-9a-fA-F][^0-9a-fA-F])/;

/**
 * Validates a URL against security configuration.
 *
 * @param url - The URL string to validate.
 * @param config - Optional validation configuration.
 * @returns Validation result.
 */
export function validateUrl(
  url: string,
  config?: UrlValidationConfig,
): UrlValidationResult {
  const errors: string[] = [];
  const allowedProtocols =
    config?.allowedProtocols ?? DEFAULT_ALLOWED_PROTOCOLS;
  const maxLength = config?.maxLength ?? DEFAULT_MAX_URL_LENGTH;

  // Check length
  if (url.length > maxLength) {
    errors.push(`URL length ${url.length} exceeds maximum ${maxLength}`);
  }

  // Check for null bytes
  for (const pattern of NULL_BYTE_PATTERNS) {
    if (pattern.test(url)) {
      errors.push("URL contains null bytes");
      break;
    }
  }

  // Check for invalid percent encoding
  if (INVALID_PERCENT_ENCODING.test(url)) {
    errors.push("URL contains invalid percent encoding");
  }

  // Try to parse as URL
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    errors.push("URL is malformed");
    return { valid: false, errors };
  }

  // Check protocol
  if (!allowedProtocols.includes(parsed.protocol)) {
    errors.push(
      `Protocol "${parsed.protocol}" is not allowed (allowed: ${allowedProtocols.join(", ")})`,
    );
  }

  // Check for path traversal (check raw URL, not normalized pathname)
  if (config?.blockTraversal !== false) {
    // Extract raw path from URL before normalization
    const rawPath = url.split("?")[0]?.split("#")[0] ?? "";
    for (const pattern of TRAVERSAL_PATTERNS) {
      if (pattern.test(rawPath)) {
        errors.push("URL contains path traversal attempts");
        break;
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Normalizes a URL path by resolving . and .. segments.
 *
 * @param pathname - The path to normalize.
 * @returns The normalized path.
 */
export function normalizePath(pathname: string): string {
  // Split into segments
  const segments = pathname.split("/");
  const normalized: string[] = [];

  for (const segment of segments) {
    if (segment === "." || segment === "") {
      // Skip current directory references and empty segments
      continue;
    }
    if (segment === "..") {
      // Go up one level if possible
      normalized.pop();
    } else {
      normalized.push(segment);
    }
  }

  return "/" + normalized.join("/");
}

/**
 * Validates a request target (URI path + query).
 *
 * @param target - The request target (e.g., "/users?page=1").
 * @param config - Optional validation configuration.
 * @returns Validation result.
 */
export function validateRequestTarget(
  target: string,
  config?: UrlValidationConfig,
): UrlValidationResult {
  const errors: string[] = [];

  // Check for null bytes
  for (const pattern of NULL_BYTE_PATTERNS) {
    if (pattern.test(target)) {
      errors.push("Request target contains null bytes");
      break;
    }
  }

  // Check for path traversal
  if (config?.blockTraversal !== false) {
    for (const pattern of TRAVERSAL_PATTERNS) {
      if (pattern.test(target)) {
        errors.push("Request target contains path traversal attempts");
        break;
      }
    }
  }

  // Check for control characters (except tab)
  if (/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(target)) {
    errors.push("Request target contains control characters");
  }

  // Normalize if requested
  let normalized: string | undefined;
  if (config?.normalizePaths) {
    const [path, ...queryParts] = target.split("?");
    const query = queryParts.join("?");
    normalized = normalizePath(path ?? "");
    if (query) {
      normalized += "?" + query;
    }
  }

  return {
    valid: errors.length === 0,
    normalized,
    errors,
  };
}

/**
 * Checks if a URL is safe to follow (not pointing to internal resources).
 *
 * @param url - The URL to check.
 * @returns True if the URL appears safe.
 */
export function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);

    // Block file:// protocol
    if (parsed.protocol === "file:") {
      return false;
    }

    // Block internal network ranges (basic check)
    const hostname = parsed.hostname;
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "::1" ||
      hostname.startsWith("192.168.") ||
      hostname.startsWith("10.") ||
      hostname.startsWith("172.")
    ) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}
