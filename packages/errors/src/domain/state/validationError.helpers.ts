/**
 * Validation issue helper functions.
 */

import { ErrorCode } from "../../base/types/errorCode.type.js";
import type { ValidationIssue } from "./validationError.base.js";

/** Creates a validation issue. */
export function createValidationIssue(
  message: string,
  options: Omit<ValidationIssue, "message"> = {},
): ValidationIssue {
  return Object.freeze({ ...options, message });
}

/** Creates a required-field validation issue. */
export function requiredFieldIssue(field: string, message = `${field} is required.`): ValidationIssue {
  return createValidationIssue(message, {
    field,
    code: ErrorCode.MISSING_FIELD,
  });
}

/** Creates an invalid-field validation issue. */
export function invalidFieldIssue(field: string, message = `${field} is invalid.`, value?: unknown): ValidationIssue {
  return createValidationIssue(message, {
    field,
    code: ErrorCode.INVALID_FIELD,
    value,
  });
}
