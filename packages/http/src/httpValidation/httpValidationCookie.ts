/**
 * HTTP Cookie validation.
 *
 * Validates cookie names (token format) and values per RFC 6265.
 */

import { isHTTPToken } from "./httpValidationToken.js";

export function isValidCookieName(name: string | undefined | null): boolean {
  return isHTTPToken(name);
}

export function isValidCookieValue(value: string | undefined | null): boolean {
  if (value === undefined || value === null) {
    return false;
  }

  if (value.startsWith('"') && value.endsWith('"')) {
    return !/[\r\n]/.test(value);
  }

  return !/[()\s",;\\\r\n]/.test(value);
}
