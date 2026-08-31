/**
 * Validates a single document for structural correctness.
 */

import type { DocumentationDocument } from "../docsTypes/index.js";
import type { ValidationResult, ValidationIssue } from "./validator.types.js";

/**
 * Validates a single document.
 */
export function validateDocument(
  document: DocumentationDocument,
): ValidationResult {
  const issues: ValidationIssue[] = [];

  if (!document.id || document.id.trim().length === 0) {
    issues.push({
      severity: "error",
      code: "MISSING_ID",
      message: "Document ID is required.",
    });
  }

  if (!document.title || document.title.trim().length === 0) {
    issues.push({
      severity: "error",
      code: "MISSING_TITLE",
      message: `Document "${document.id}" is missing a title.`,
      documentId: document.id,
    });
  }

  if (!document.content) {
    issues.push({
      severity: "error",
      code: "MISSING_CONTENT",
      message: `Document "${document.id}" is missing content.`,
      documentId: document.id,
    });
  }

  if (document.deprecated && !document.deprecatedMessage) {
    issues.push({
      severity: "warning",
      code: "DEPRECATED_WITHOUT_MESSAGE",
      message: `Document "${document.id}" is deprecated but has no deprecation message.`,
      documentId: document.id,
    });
  }

  return {
    valid: issues.filter((i) => i.severity === "error").length === 0,
    issues,
  };
}
