/**
 * @lattice/observability — Redaction
 *
 * Redacts sensitive fields from log contexts and trace attributes.
 * Never automatically dumps passwords, tokens, cookies, or auth headers.
 */

import type { RedactionConfig } from "../types.js";

/** Default sensitive field names. */
const DEFAULT_SENSITIVE_FIELDS = [
  "password",
  "secret",
  "token",
  "authorization",
  "cookie",
  "access_token",
  "refresh_token",
  "api_key",
  "apiKey",
  "accessToken",
  "refreshToken",
  "credit_card",
  "creditCard",
  "ssn",
  "social_security",
];

const DEFAULT_REPLACEMENT = "[REDACTED]";

/**
 * Creates a redactor that replaces sensitive values in objects.
 */
export function createRedactor(config?: RedactionConfig): (key: string, value: unknown) => unknown {
  const fields = new Set(
    (config?.fields ?? DEFAULT_SENSITIVE_FIELDS).map((f) => f.toLowerCase()),
  );
  const replacement = config?.replacement ?? DEFAULT_REPLACEMENT;
  const customRedactor = config?.customRedactor;

  return (key: string, value: unknown): unknown => {
    if (customRedactor) {
      const result = customRedactor(key, value);
      if (result !== value) return result;
    }

    if (fields.has(key.toLowerCase())) {
      return replacement;
    }

    return value;
  };
}

/**
 * Redacts sensitive fields from a plain object.
 * Returns a new object with sensitive values replaced.
 */
export function redactObject<T extends Record<string, unknown>>(
  obj: T,
  config?: RedactionConfig,
): T {
  const redactor = createRedactor(config);
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      result[key] = redactObject(value as Record<string, unknown>, config);
    } else {
      result[key] = redactor(key, value);
    }
  }

  return result as T;
}

/** Checks if a field name is sensitive. */
export function isSensitiveField(fieldName: string, config?: RedactionConfig): boolean {
  const fields = (config?.fields ?? DEFAULT_SENSITIVE_FIELDS).map((f) => f.toLowerCase());
  return fields.includes(fieldName.toLowerCase());
}
