/**
 * Validates navigation tree references against registered documents.
 */

import type { DocumentationNavigationItem } from "../../docsTypes/index.js";
import type { ValidationResult, ValidationIssue } from "../validator.types.js";

/**
 * Validates navigation tree references.
 */
export function validateNavigation(
  items: readonly DocumentationNavigationItem[],
  registeredIds: ReadonlySet<string>,
): ValidationResult {
  const issues: ValidationIssue[] = [];

  function walk(nodes: readonly DocumentationNavigationItem[]): void {
    for (const node of nodes) {
      if (node.documentId && !registeredIds.has(node.documentId)) {
        issues.push({
          severity: "error",
          code: "NAVIGATION_UNKNOWN_DOCUMENT",
          message: `Navigation item "${node.title}" references unknown document "${node.documentId}".`,
        });
      }

      if (node.children) {
        walk(node.children);
      }
    }
  }

  walk(items);

  return {
    valid: issues.length === 0,
    issues,
  };
}
