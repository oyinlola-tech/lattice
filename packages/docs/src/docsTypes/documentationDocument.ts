/**
 * Core document interface for documentation pages.
 *
 * Documents are the fundamental unit of content in the docs package.
 * Each document has a stable ID, structured content, and metadata.
 */

import type { DocumentationContent } from "./documentationContent.js";
import type {
  DocumentationCategory,
  DocumentationMetadata,
  DocumentationStatus,
} from "./documentationMetadata.js";

/**
 * A documentation page.
 *
 * IDs must be stable dot-separated identifiers (e.g. "guides.http.routing").
 * Titles can change without breaking links.
 */
export interface DocumentationDocument {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly content: DocumentationContent;
  readonly category?: DocumentationCategory;
  readonly tags?: readonly string[];
  readonly version?: string;
  readonly status?: DocumentationStatus;
  readonly metadata?: DocumentationMetadata;
  readonly deprecated?: boolean;
  readonly deprecatedMessage?: string;
  readonly visibility?: "SERVER" | "CLIENT";
}
