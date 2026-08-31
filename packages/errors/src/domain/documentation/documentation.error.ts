/**
 * Documentation error classes — re-exports from focused files.
 */

export {
  DocumentationError,
  createDocumentationError,
  isDocumentationError,
} from "./documentationError.base.js";
export type { DocumentationErrorOptions } from "./documentationError.base.js";

export {
  DocumentParseError,
  DocumentValidationError,
  DuplicateDocumentError,
  DocumentNotFoundError,
  BrokenDocumentationLinkError,
  InvalidFrontmatterError,
  InvalidNavigationError,
  ExampleValidationError,
  GenerationError,
  DocumentationVersionError,
} from "./documentationError.types.js";
