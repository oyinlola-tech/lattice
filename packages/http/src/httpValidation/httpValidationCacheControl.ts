/**
 * HTTP Cache-Control validation.
 *
 * Validates Cache-Control directive syntax per RFC 7234.
 */

import { isHTTPToken } from "./httpValidationToken.js";

export function isValidCacheControl(value: string | undefined | null): boolean {
  if (value === undefined || value === null || value.trim().length === 0) {
    return false;
  }

  const directives = value.split(",");

  return directives.every((directive) => {
    const trimmed = directive.trim();

    if (trimmed.length === 0) {
      return false;
    }

    const separator = trimmed.indexOf("=");

    if (separator === -1) {
      return isHTTPToken(trimmed);
    }

    const name = trimmed.slice(0, separator).trim();

    const valuePart = trimmed.slice(separator + 1).trim();

    return isHTTPToken(name) && valuePart.length > 0;
  });
}
