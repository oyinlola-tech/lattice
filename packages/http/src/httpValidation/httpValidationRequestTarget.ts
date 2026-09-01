/**
 * HTTP request target validation.
 *
 * Validates origin-form, absolute-form, authority-form, and asterisk-form
 * request targets per RFC 7230 Section 5.3.
 */

import type { HTTPValidationResult } from "./httpValidationTypes.type.js";
import { isValidAuthority } from "./httpValidationAuthority.js";
import { isValidURL } from "./httpValidationUrl.js";

export function isValidRequestTarget(
  target: string | undefined | null,
): boolean {
  if (target === undefined || target === null || target.length === 0) {
    return false;
  }

  if (/[\r\n]/.test(target)) {
    return false;
  }

  /*
   * HTTP origin-form normally starts with "/".
   * The absolute-form, authority-form, and asterisk-form are also valid
   * request-target forms.
   */
  if (target === "*") {
    return true;
  }

  if (target.startsWith("/")) {
    return true;
  }

  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(target)) {
    return isValidURL(target);
  }

  /*
   * CONNECT authority-form:
   * host:port
   */
  return isValidAuthority(target);
}

export function validateRequestTarget(target: string): HTTPValidationResult {
  if (!isValidRequestTarget(target)) {
    return {
      valid: false,
      reason: "Invalid HTTP request target.",
    };
  }

  return {
    valid: true,
    value: target,
  };
}
