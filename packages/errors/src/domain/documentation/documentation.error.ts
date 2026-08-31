import { BaseError } from "../../base/core/baseError.core.js";
import type { BaseErrorOptions } from "../../base/types/baseError.type.js";
import { ErrorCategory } from "../../base/types/errorCategory.type.js";
import { ErrorCode } from "../../base/types/errorCode.type.js";
import { ErrorSeverity } from "../../base/types/errorSeverity.type.js";

/**
 * Options for creating a documentation error.
 */
export interface DocumentationErrorOptions
  extends Omit<BaseErrorOptions, "category"> {
  readonly category?: ErrorCategory;
}

/**
 * Base error for all documentation-related failures.
 */
export class DocumentationError extends BaseError {
  constructor(
    message = "A documentation error occurred.",
    options: DocumentationErrorOptions = {},
  ) {
    super(message, {
      ...options,
      code: options.code ?? ErrorCode.DOCUMENTATION_ERROR,
      category: options.category ?? ErrorCategory.DOCUMENTATION,
      severity: options.severity ?? ErrorSeverity.WARNING,
      isOperational: options.isOperational ?? true,
    });
  }
}

/**
 * Error raised when a document fails to parse.
 */
export class DocumentParseError extends DocumentationError {
  constructor(
    message = "Failed to parse document.",
    options: DocumentationErrorOptions = {},
  ) {
    super(message, {
      ...options,
      code: options.code ?? ErrorCode.DOCUMENT_PARSE,
    });
  }
}

/**
 * Error raised when a document fails validation.
 */
export class DocumentValidationError extends DocumentationError {
  constructor(
    message = "Document validation failed.",
    options: DocumentationErrorOptions = {},
  ) {
    super(message, {
      ...options,
      code: options.code ?? ErrorCode.DOCUMENT_VALIDATION,
    });
  }
}

/**
 * Error raised when a duplicate document ID is registered.
 */
export class DuplicateDocumentError extends DocumentationError {
  constructor(
    documentId: string,
    options: DocumentationErrorOptions = {},
  ) {
    super(`Duplicate document ID: "${documentId}".`, {
      ...options,
      code: options.code ?? ErrorCode.DOCUMENT_DUPLICATE,
    });
  }
}

/**
 * Error raised when a referenced document is not found.
 */
export class DocumentNotFoundError extends DocumentationError {
  constructor(
    documentId: string,
    options: DocumentationErrorOptions = {},
  ) {
    super(`Document not found: "${documentId}".`, {
      ...options,
      code: options.code ?? ErrorCode.DOCUMENT_NOT_FOUND,
    });
  }
}

/**
 * Error raised when an internal link points to a non-existent target.
 */
export class BrokenDocumentationLinkError extends DocumentationError {
  constructor(
    source: string,
    target: string,
    options: DocumentationErrorOptions = {},
  ) {
    super(
      `Broken link in "${source}": target "${target}" does not exist.`,
      {
        ...options,
        code: options.code ?? ErrorCode.DOCUMENT_LINK_BROKEN,
      },
    );
  }
}

/**
 * Error raised when frontmatter cannot be parsed.
 */
export class InvalidFrontmatterError extends DocumentationError {
  constructor(
    message = "Invalid frontmatter.",
    options: DocumentationErrorOptions = {},
  ) {
    super(message, {
      ...options,
      code: options.code ?? ErrorCode.DOCUMENT_FRONTMATTER_INVALID,
    });
  }
}

/**
 * Error raised when navigation references an unknown document.
 */
export class InvalidNavigationError extends DocumentationError {
  constructor(
    documentId: string,
    options: DocumentationErrorOptions = {},
  ) {
    super(
      `Navigation references unknown document: "${documentId}".`,
      {
        ...options,
        code: options.code ?? ErrorCode.DOCUMENT_NAVIGATION_INVALID,
      },
    );
  }
}

/**
 * Error raised when a code example fails validation.
 */
export class ExampleValidationError extends DocumentationError {
  constructor(
    exampleId: string,
    message = "Example validation failed.",
    options: DocumentationErrorOptions = {},
  ) {
    super(`Example "${exampleId}": ${message}`, {
      ...options,
      code: options.code ?? ErrorCode.DOCUMENT_EXAMPLE_INVALID,
    });
  }
}

/**
 * Error raised when documentation generation fails.
 */
export class GenerationError extends DocumentationError {
  constructor(
    message = "Documentation generation failed.",
    options: DocumentationErrorOptions = {},
  ) {
    super(message, {
      ...options,
      code: options.code ?? ErrorCode.DOCUMENT_GENERATION,
    });
  }
}

/**
 * Error raised when a documentation version is invalid.
 */
export class DocumentationVersionError extends DocumentationError {
  constructor(
    version: string,
    options: DocumentationErrorOptions = {},
  ) {
    super(`Invalid documentation version: "${version}".`, {
      ...options,
      code: options.code ?? ErrorCode.DOCUMENT_VERSION,
    });
  }
}
