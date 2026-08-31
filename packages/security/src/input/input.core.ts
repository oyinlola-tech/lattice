/**
 * @lattice/security — Input Sanitization
 *
 * Sanitizes user input against common attack patterns.
 */

import type { InputSanitizationConfig } from "../types/security.type.js";
import {
  PROTOTYPE_POLLUTION_KEYS,
  SQL_INJECTION_PATTERNS,
  XSS_PATTERNS,
} from "../types/security.type.js";

/** Null byte pattern. */
const NULL_BYTE_PATTERN = /\x00/g;

/** Control character pattern (except tab, newline, carriage return). */
const CONTROL_CHAR_PATTERN = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;

/**
 * Checks if a string contains SQL injection patterns.
 *
 * @param input - The string to check.
 * @returns True if SQL injection patterns are detected.
 */
export function containsSqlInjection(input: string): boolean {
  return SQL_INJECTION_PATTERNS.some((pattern) => pattern.test(input));
}

/**
 * Checks if a string contains XSS patterns.
 *
 * @param input - The string to check.
 * @returns True if XSS patterns are detected.
 */
export function containsXss(input: string): boolean {
  return XSS_PATTERNS.some((pattern) => pattern.test(input));
}

/**
 * Checks if a string contains prototype pollution keys.
 *
 * @param input - The string to check.
 * @returns True if prototype pollution keys are detected.
 */
export function containsPrototypePollution(input: string): boolean {
  return PROTOTYPE_POLLUTION_KEYS.includes(
    input as (typeof PROTOTYPE_POLLUTION_KEYS)[number],
  );
}

/**
 * Sanitizes a string by removing dangerous characters.
 *
 * @param input - The string to sanitize.
 * @param config - Optional sanitization configuration.
 * @returns The sanitized string.
 */
export function sanitizeString(
  input: string,
  config?: InputSanitizationConfig,
): string {
  let sanitized = input;

  // Strip null bytes
  if (config?.stripNullBytes !== false) {
    sanitized = sanitized.replace(NULL_BYTE_PATTERN, "");
  }

  // Strip control characters
  sanitized = sanitized.replace(CONTROL_CHAR_PATTERN, "");

  // Truncate if max length configured
  if (config?.maxStringLength && sanitized.length > config.maxStringLength) {
    sanitized = sanitized.slice(0, config.maxStringLength);
  }

  // Custom sanitizer
  if (config?.customSanitizer) {
    sanitized = config.customSanitizer(sanitized);
  }

  return sanitized;
}

/**
 * Sanitizes an object by recursively cleaning its values.
 *
 * @param obj - The object to sanitize.
 * @param config - Optional sanitization configuration.
 * @returns The sanitized object.
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  config?: InputSanitizationConfig,
): T {
  const sanitized = { ...obj } as Record<string, unknown>;

  for (const [key, value] of Object.entries(sanitized)) {
    // Check for prototype pollution keys
    if (config?.preventPrototypePollution !== false) {
      if (containsPrototypePollution(key)) {
        delete sanitized[key];
        continue;
      }
    }

    // Sanitize string values
    if (typeof value === "string") {
      sanitized[key] = sanitizeString(value, config);
    } else if (typeof value === "object" && value !== null) {
      // Recursively sanitize nested objects
      if (Array.isArray(value)) {
        sanitized[key] = value.map((item) =>
          typeof item === "object" && item !== null
            ? sanitizeObject(item as Record<string, unknown>, config)
            : typeof item === "string"
              ? sanitizeString(item, config)
              : item,
        );
      } else {
        sanitized[key] = sanitizeObject(
          value as Record<string, unknown>,
          config,
        );
      }
    }
  }

  return sanitized as T;
}

/**
 * Validates that a string contains only safe characters.
 *
 * @param input - The string to validate.
 * @param allowedPattern - Optional regex pattern for allowed characters.
 * @returns True if the string is safe.
 */
export function isSafeString(
  input: string,
  allowedPattern?: RegExp,
): boolean {
  // Check for null bytes
  if (NULL_BYTE_PATTERN.test(input)) {
    return false;
  }

  // Check for control characters
  if (CONTROL_CHAR_PATTERN.test(input)) {
    return false;
  }

  // Check custom pattern
  if (allowedPattern && !allowedPattern.test(input)) {
    return false;
  }

  return true;
}

/**
 * Checks for common attack patterns in a string.
 *
 * @param input - The string to check.
 * @returns An array of detected threats.
 */
export function detectThreats(input: string): string[] {
  const threats: string[] = [];

  if (containsSqlInjection(input)) {
    threats.push("SQL_INJECTION");
  }

  if (containsXss(input)) {
    threats.push("XSS");
  }

  if (NULL_BYTE_PATTERN.test(input)) {
    threats.push("NULL_BYTE");
  }

  if (CONTROL_CHAR_PATTERN.test(input)) {
    threats.push("CONTROL_CHARACTERS");
  }

  return threats;
}

/**
 * HTML-escapes a string to prevent XSS.
 *
 * @param input - The string to escape.
 * @returns The escaped string.
 */
export function escapeHtml(input: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };

  return input.replace(/[&<>"']/g, (char) => map[char] ?? char);
}

/**
 * Strips HTML tags from a string.
 *
 * @param input - The string to strip.
 * @returns The string with HTML tags removed.
 */
export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, "");
}
