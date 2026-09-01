/**
 * Fluent builder for creating documentation documents.
 *
 * Provides a chainable API that validates inputs and
 * produces immutable DocumentationDocument objects.
 */

import type {
  DocumentationContent,
  DocumentationDocument,
  DocumentationCategory,
  DocumentationMetadata,
  DocumentationStatus,
} from "../docsTypes/index.js";

/**
 * Options for creating a document via the builder.
 */
export interface DocumentBuilderOptions {
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

/**
 * Creates a documentation document from structured options.
 *
 * @example
 * ```ts
 * const doc = createDocument({
 *   id: "guides.http.routing",
 *   title: "HTTP Routing",
 *   content: { type: "markdown", value: "# Routing\n\n..." },
 *   category: "guide",
 *   tags: ["http", "routing"],
 * });
 * ```
 */
export function createDocument(
  options: DocumentBuilderOptions,
): DocumentationDocument {
  validateDocumentOptions(options);

  return Object.freeze({
    id: options.id,
    title: options.title,
    description: options.description,
    content: options.content,
    category: options.category,
    tags: options.tags ? Object.freeze([...options.tags]) : undefined,
    version: options.version,
    status: options.status,
    metadata: options.metadata,
    deprecated: options.deprecated,
    deprecatedMessage: options.deprecatedMessage,
    visibility: options.visibility,
  });
}

/**
 * Validates document builder options.
 * Throws on invalid input.
 */
function validateDocumentOptions(options: DocumentBuilderOptions): void {
  if (!options.id || options.id.trim().length === 0) {
    throw new Error("Document ID is required.");
  }

  if (!options.title || options.title.trim().length === 0) {
    throw new Error("Document title is required.");
  }

  if (!options.content) {
    throw new Error("Document content is required.");
  }
}

/**
 * Creates a markdown document.
 */
export function createMarkdownDocument(
  id: string,
  title: string,
  markdown: string,
  options?: Partial<DocumentBuilderOptions>,
): DocumentationDocument {
  return createDocument({
    id,
    title,
    content: { type: "markdown", value: markdown },
    ...options,
  });
}

/**
 * Creates a structured document from AST nodes.
 */
export function createStructuredDocument(
  id: string,
  title: string,
  nodes: DocumentationContent extends { readonly nodes: infer N } ? N : never,
  options?: Partial<DocumentBuilderOptions>,
): DocumentationDocument {
  return createDocument({
    id,
    title,
    content: {
      type: "structured",
      value: nodes,
    } as unknown as DocumentationContent,
    ...options,
  });
}
