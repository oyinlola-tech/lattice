/**
 * HTTP message validation.
 *
 * Validates a complete HTTP message (method, URL, headers, status code).
 */

import type { HTTPValidationResult } from "./httpValidationTypes.type.js";
import { isValidHTTPMethod } from "./httpValidationMethod.js";
import { validateHeader } from "./httpValidationHeader.js";
import { isValidURL } from "./httpValidationUrl.js";
import { isValidStatusCode } from "./httpValidationStatusCode.js";

export function validateHTTPMessage(options: {
  readonly method?: string;
  readonly url?: string;
  readonly headers?: Readonly<Record<string, string>>;
  readonly statusCode?: number;
}): HTTPValidationResult {
  if (options.method !== undefined && !isValidHTTPMethod(options.method)) {
    return {
      valid: false,
      reason: "Invalid HTTP method.",
    };
  }

  if (options.url !== undefined && !isValidURL(options.url)) {
    return {
      valid: false,
      reason: "Invalid HTTP URL.",
    };
  }

  if (
    options.statusCode !== undefined &&
    !isValidStatusCode(options.statusCode)
  ) {
    return {
      valid: false,
      reason: "Invalid HTTP status code.",
    };
  }

  if (options.headers) {
    for (const [name, value] of Object.entries(options.headers)) {
      const result = validateHeader(name, value);

      if (!result.valid) {
        return {
          valid: false,
          reason: result.reason,
        };
      }
    }
  }

  return {
    valid: true,
  };
}
