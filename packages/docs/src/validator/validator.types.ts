/**
 * Type definitions for document validation.
 */

/**
 * A single validation issue found in documentation.
 */
export interface ValidationIssue {
  readonly severity: "error" | "warning";
  readonly code: string;
  readonly message: string;
  readonly documentId?: string;
}

/**
 * Result of validating documentation.
 */
export interface ValidationResult {
  readonly valid: boolean;
  readonly issues: readonly ValidationIssue[];
}
