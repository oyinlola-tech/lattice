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

  const content = document.content.value;

  if (content.length > 100_000) {
    return { valid: true, issues: [] };
  }

  let pos = 0;

  while (pos < content.length) {
    const openBracket = content.indexOf("[", pos);

    if (openBracket === -1) break;

    const closeBracket = content.indexOf("]", openBracket + 1);

    if (closeBracket === -1) break;

    if (content[closeBracket + 1] !== "(") {
      pos = closeBracket + 1;
      continue;
    }

    const closeParen = content.indexOf(")", closeBracket + 2);

    if (closeParen === -1) break;

    const target = content.slice(closeBracket + 2, closeParen);

    if (!target) {
      pos = closeParen + 1;
      continue;
    }

    if (target.startsWith("http://") || target.startsWith("https://")) {
      pos = closeParen + 1;
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

    pos = closeParen + 1;
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}
