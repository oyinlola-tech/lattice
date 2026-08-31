/**
 * Validates internal links within markdown documentation.
 */

import type { DocumentationDocument } from "../docsTypes/index.js";
import type { ValidationResult, ValidationIssue } from "./validator.types.js";

/**
 * Validates internal links in a document's markdown content.
 */
export function validateLinks(
  document: DocumentationDocument,
  registeredIds: ReadonlySet<string>,
): ValidationResult {
  const issues: ValidationIssue[] = [];

  if (document.content.type !== "markdown") {
    return { valid: true, issues: [] };
  }

  const linkPattern = /\[([^\]\[]*)\]\(([^)]+)\)/g;
  const content = document.content.value;
  let match: RegExpExecArray | null;

  while ((match = linkPattern.exec(content)) !== null) {
    const target = match[2];

    if (!target) continue;

    if (target.startsWith("http://") || target.startsWith("https://")) {
      continue;
    }

    const cleanTarget = target.replace(/\.md$/, "").replace(/^\.\//, "");

    if (!registeredIds.has(cleanTarget)) {
      issues.push({
        severity: "warning",
        code: "BROKEN_LINK",
        message: `Document "${document.id}" links to "${target}" which is not registered.`,
        documentId: document.id,
      });
    }
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}
