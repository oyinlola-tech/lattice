/**
 * Validates an entire documentation set.
 */

import type { DocumentationDocument, DocumentationNavigationItem } from "../../docsTypes/index.js";
import type { ValidationResult, ValidationIssue } from "../validator.types.js";
import { validateDocument } from "../validatorDocument.core.js";
import { validateNoDuplicateIds } from "../validatorDuplicates.core.js";
import { validateLinks } from "../validatorLinks.core.js";
import { validateNavigation } from "./validatorNavigation.core.js";

/**
 * Validates all documents and optionally a navigation tree.
 */
export function validateAll(
  documents: readonly DocumentationDocument[],
  navigation?: readonly DocumentationNavigationItem[],
): ValidationResult {
  const allIssues: ValidationIssue[] = [];

  const idResult = validateNoDuplicateIds(documents);
  allIssues.push(...idResult.issues);

  const registeredIds = new Set(documents.map((d) => d.id));

  for (const doc of documents) {
    const docResult = validateDocument(doc);
    allIssues.push(...docResult.issues);

    const linkResult = validateLinks(doc, registeredIds);
    allIssues.push(...linkResult.issues);
  }

  if (navigation) {
    const navResult = validateNavigation(navigation, registeredIds);
    allIssues.push(...navResult.issues);
  }

  return {
    valid: allIssues.filter((i) => i.severity === "error").length === 0,
    issues: allIssues,
  };
}
