/**
 * HTTP header validation.
 *
 * Validates header names (token format) and values (no CR/LF),
 * and provides combined header validation.
 */

import type {
  HTTPHeaderValidationResult,
  HTTPValidationResult,
} from "./httpValidationTypes.type.js";
import { isHTTPToken } from "./httpValidationToken.js";

export function isValidHeaderName(
  name: string | undefined | null,
): name is string {
  return isHTTPToken(name);
}

export function validateHeaderName(name: string): HTTPValidationResult {
  if (!isValidHeaderName(name)) {
    return {
      valid: false,
      reason: "Invalid HTTP header name.",
    };
  }

  return {
    valid: true,
    value: name.toLowerCase(),
  };
}

export function isValidHeaderValue(
  value: string | undefined | null,
): value is string {
  if (value === undefined || value === null) {
    return false;
  }

  /*
   * Reject CR/LF to prevent header injection.
   * Horizontal tab is permitted by HTTP field-value rules.
   */
  return !/[\r\n]/.test(value);
}

export function validateHeaderValue(value: string): HTTPValidationResult {
  if (!isValidHeaderValue(value)) {
    return {
      valid: false,
      reason: "Header value contains an invalid CR or LF character.",
    };
  }

  return {
    valid: true,
    value,
  };
}

export function validateHeader(
  name: string,
  value: string,
): HTTPHeaderValidationResult {
  const nameResult = validateHeaderName(name);

  if (!nameResult.valid) {
    return {
      valid: false,
      name,
      headerValue: value,
      reason: nameResult.reason,
    };
  }

  const valueResult = validateHeaderValue(value);

  if (!valueResult.valid) {
    return {
      valid: false,
      name: nameResult.value,
      headerValue: value,
      reason: valueResult.reason,
    };
  }

  return {
    valid: true,
    name: nameResult.value,
    headerValue: value,
    value: `${nameResult.value}: ${value}`,
  };
}
