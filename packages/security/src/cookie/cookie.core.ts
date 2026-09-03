/**
 * @zudo/security — Cookie Security
 *
 * Parses, validates, and serializes HTTP cookies with security best practices.
 */

import type {
  CookieSecurityConfig,
  ParsedCookie,
} from "../types/security.type.js";

/** Maximum cookie header size (4KB). */
const MAX_COOKIE_HEADER_SIZE = 4096;

/** Maximum number of cookies. */
const MAX_COOKIE_COUNT = 50;

/** Maximum individual cookie size. */
const MAX_COOKIE_SIZE = 1024;

/**
 * Parses a raw cookie header string into individual cookies.
 *
 * @param cookieHeader - The raw Cookie header value.
 * @param config - Optional security configuration.
 * @returns Array of parsed cookies, or error messages.
 */
export function parseCookieHeader(
  cookieHeader: string,
  config?: CookieSecurityConfig,
): { cookies: ParsedCookie[]; errors: string[] } {
  const errors: string[] = [];
  const maxSize = config?.maxSize ?? MAX_COOKIE_SIZE;
  const maxCount = config?.maxCount ?? MAX_COOKIE_COUNT;

  // Check total header size
  if (Buffer.byteLength(cookieHeader, "utf8") > MAX_COOKIE_HEADER_SIZE) {
    errors.push(
      `Cookie header size exceeds maximum ${MAX_COOKIE_HEADER_SIZE} bytes`,
    );
    return { cookies: [], errors };
  }

  // Split by semicolons
  const parts = cookieHeader.split(";");

  if (parts.length > maxCount) {
    errors.push(
      `Too many cookies: ${parts.length} exceeds maximum ${maxCount}`,
    );
  }

  const cookies: ParsedCookie[] = [];

  for (let i = 0; i < Math.min(parts.length, maxCount); i++) {
    const part = parts[i]?.trim();
    if (!part) continue;

    const eqIndex = part.indexOf("=");
    if (eqIndex === -1) {
      errors.push(`Cookie ${i}: missing equals sign in "${part}"`);
      continue;
    }

    const name = part.slice(0, eqIndex).trim();
    const value = part.slice(eqIndex + 1).trim();

    if (name.length === 0) {
      errors.push(`Cookie ${i}: empty cookie name`);
      continue;
    }

    if (Buffer.byteLength(value, "utf8") > maxSize) {
      errors.push(
        `Cookie "${name}" value size exceeds maximum ${maxSize} bytes`,
      );
      continue;
    }

    cookies.push({ name, value });
  }

  return { cookies, errors };
}

/**
 * Serializes a parsed cookie into a Set-Cookie header value.
 *
 * @param cookie - The cookie to serialize.
 * @param config - Optional security configuration for defaults.
 * @returns The serialized Set-Cookie header value.
 */
export function serializeCookie(
  cookie: ParsedCookie,
  config?: CookieSecurityConfig,
): string {
  const parts = [`${cookie.name}=${cookie.value}`];

  if (cookie.path) {
    parts.push(`Path=${cookie.path}`);
  }

  if (cookie.domain) {
    parts.push(`Domain=${cookie.domain}`);
  }

  if (cookie.maxAge !== undefined) {
    parts.push(`Max-Age=${cookie.maxAge}`);
  }

  if (cookie.expires) {
    parts.push(`Expires=${cookie.expires.toUTCString()}`);
  }

  // Apply security defaults from config
  const secure = cookie.secure ?? config?.secure ?? true;
  if (secure) {
    parts.push("Secure");
  }

  const httpOnly = cookie.httpOnly ?? config?.httpOnly ?? true;
  if (httpOnly) {
    parts.push("HttpOnly");
  }

  const sameSite = cookie.sameSite ?? config?.sameSite ?? "lax";
  parts.push(
    `SameSite=${sameSite.charAt(0).toUpperCase() + sameSite.slice(1)}`,
  );

  if (cookie.partitioned) {
    parts.push("Partitioned");
  }

  return parts.join("; ");
}

/**
 * Creates a Set-Cookie header value with secure defaults.
 *
 * @param name - Cookie name.
 * @param value - Cookie value.
 * @param options - Optional cookie attributes.
 * @param config - Optional security configuration.
 * @returns The serialized Set-Cookie header value.
 */
export function createSecureCookie(
  name: string,
  value: string,
  options?: Partial<Omit<ParsedCookie, "name" | "value">>,
  config?: CookieSecurityConfig,
): string {
  return serializeCookie({ name, value, ...options }, config);
}

/**
 * Validates a cookie name for safety.
 *
 * @param name - The cookie name to validate.
 * @returns An error message if invalid, or undefined.
 */
export function validateCookieName(name: string): string | undefined {
  if (name.length === 0) {
    return "Cookie name cannot be empty";
  }

  if (name.length > 256) {
    return `Cookie name exceeds maximum length of 256: ${name.length}`;
  }

  // RFC 6265: cookie name cannot contain certain characters
  if (/[\s,;=]/.test(name)) {
    return `Cookie name contains invalid characters: ${name}`;
  }

  return undefined;
}

/**
 * Validates a cookie value for safety.
 *
 * @param value - The cookie value to validate.
 * @returns An error message if invalid, or undefined.
 */
export function validateCookieValue(value: string): string | undefined {
  // Check for semicolons (used as delimiter)
  if (value.includes(";")) {
    return "Cookie value cannot contain semicolons";
  }

  // Check for control characters
  if (/[\x00-\x1F\x7F]/.test(value)) {
    return "Cookie value contains control characters";
  }

  return undefined;
}

/**
 * Strips security-sensitive cookies from a cookie header.
 *
 * @param cookieHeader - The raw Cookie header.
 * @param sensitiveNames - Names of cookies to strip (case-insensitive).
 * @returns The cleaned cookie header.
 */
export function stripSensitiveCookies(
  cookieHeader: string,
  sensitiveNames: readonly string[] = ["session", "token", "auth", "jwt"],
): string {
  const lowerSensitive = sensitiveNames.map((n) => n.toLowerCase());

  return cookieHeader
    .split(";")
    .map((pair) => pair.trim())
    .filter((pair) => {
      const eqIndex = pair.indexOf("=");
      if (eqIndex === -1) return false;
      const name = pair.slice(0, eqIndex).trim().toLowerCase();
      return !lowerSensitive.includes(name);
    })
    .join("; ");
}
