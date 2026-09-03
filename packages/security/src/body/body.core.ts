/**
 * @zudolib/security — Body Validation
 *
 * Validates request body size and content type against configurable limits.
 */

import type {
  BodyLimitConfig,
  BodyLimitPresets,
} from "../types/security.type.js";

/** Default body limits for common use cases. */
export const DEFAULT_BODY_LIMITS: BodyLimitPresets = {
  /** JSON API: 1MB */
  json: 1_048_576,
  /** Authentication endpoints: 256KB */
  auth: 262_144,
  /** File upload: 100MB */
  upload: 104_857_600,
  /** Webhook payloads: 2MB */
  webhook: 2_097_152,
};

/** Default maximum body size (1MB). */
const DEFAULT_MAX_BODY_SIZE = 1_048_576;

/**
 * Validates the Content-Length header value.
 *
 * @param contentLength - The Content-Length header value.
 * @returns An error message if invalid, or undefined.
 */
export function validateContentLength(
  contentLength: string | undefined,
): string | undefined {
  if (contentLength === undefined) {
    return undefined; // No Content-Length is fine (chunked transfer)
  }

  const parsed = parseInt(contentLength, 10);

  if (isNaN(parsed)) {
    return `Content-Length is not a valid number: ${contentLength}`;
  }

  if (parsed < 0) {
    return `Content-Length cannot be negative: ${parsed}`;
  }

  if (!Number.isSafeInteger(parsed)) {
    return `Content-Length is not a safe integer: ${contentLength}`;
  }

  return undefined;
}

/**
 * Validates that a body size is within the allowed limit.
 *
 * @param actualSize - The actual body size in bytes.
 * @param maxSize - The maximum allowed size in bytes.
 * @param contentType - Optional content type for context in error messages.
 * @returns An error message if too large, or undefined.
 */
export function validateBodySize(
  actualSize: number,
  maxSize?: number,
  contentType?: string,
): string | undefined {
  const limit = maxSize ?? DEFAULT_MAX_BODY_SIZE;

  if (actualSize > limit) {
    const context = contentType ? ` for ${contentType}` : "";
    return `Body size ${actualSize} bytes exceeds maximum ${limit} bytes${context}`;
  }

  return undefined;
}

/**
 * Gets the appropriate body limit for a given content type.
 *
 * @param contentType - The Content-Type header value.
 * @param presetLimits - Optional custom preset limits.
 * @returns The maximum body size in bytes.
 */
export function getBodyLimitForContentType(
  contentType: string | undefined,
  presetLimits?: Partial<BodyLimitPresets>,
): number {
  const limits = { ...DEFAULT_BODY_LIMITS, ...presetLimits };

  if (!contentType) {
    return limits.json;
  }

  const type = contentType.toLowerCase();

  if (type.includes("json")) {
    return limits.json;
  }

  if (type.includes("x-www-form-urlencoded") || type.includes("multipart")) {
    // Check if it's likely an auth form
    if (type.includes("login") || type.includes("auth")) {
      return limits.auth;
    }
    return limits.upload;
  }

  if (type.includes("octet-stream")) {
    return limits.upload;
  }

  if (type.includes("xml")) {
    return limits.webhook;
  }

  return limits.json;
}

/**
 * Validates a body limit configuration.
 *
 * @param config - The body limit configuration to validate.
 * @returns An error message if invalid, or undefined.
 */
export function validateBodyLimitConfig(
  config: BodyLimitConfig,
): string | undefined {
  if (config.maxSize <= 0) {
    return `Body limit maxSize must be positive, got: ${config.maxSize}`;
  }

  if (config.maxSize > 1_073_741_824) {
    // 1GB
    return `Body limit maxSize ${config.maxSize} exceeds maximum allowed (1GB)`;
  }

  return undefined;
}

/**
 * Creates a body size checker function for use in middleware.
 *
 * @param maxSize - The maximum body size in bytes.
 * @param contentType - Optional content type to check against.
 * @returns A function that checks if a size is within limits.
 */
export function createBodySizeChecker(
  maxSize: number,
  contentType?: string,
): (size: number) => { allowed: boolean; error?: string } {
  return (size: number) => {
    const error = validateBodySize(size, maxSize, contentType);
    return {
      allowed: error === undefined,
      error,
    };
  };
}
