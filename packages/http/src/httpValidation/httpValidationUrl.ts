/**
 * HTTP URL validation.
 *
 * Validates general URLs and HTTP/HTTPS-specific URLs.
 */

import type { HTTPValidationResult } from "./httpValidationTypes.type.js";

export function isValidURL(
  value: string | undefined | null,
  base?: string | URL,
): boolean {
  if (value === undefined || value === null || value.trim().length === 0) {
    return false;
  }

  try {
    new URL(value, base);

    return true;
  } catch {
    return false;
  }
}

export function validateURL(
  value: string,
  base?: string | URL,
): HTTPValidationResult {
  if (!isValidURL(value, base)) {
    return {
      valid: false,
      reason: "Invalid URL.",
    };
  }

  try {
    return {
      valid: true,
      value: new URL(value, base).href,
    };
  } catch {
    return {
      valid: false,
      reason: "Invalid URL.",
    };
  }
}

export function isValidHTTPURL(value: string | undefined | null): boolean {
  if (!isValidURL(value)) {
    return false;
  }

  try {
    const url = new URL(value!);

    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function validateHTTPURL(value: string): HTTPValidationResult {
  if (!isValidHTTPURL(value)) {
    return {
      valid: false,
      reason: "URL must use the HTTP or HTTPS protocol.",
    };
  }

  return {
    valid: true,
    value: new URL(value).href,
  };
}
