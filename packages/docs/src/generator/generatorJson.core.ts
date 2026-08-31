/**
 * JSON output generation for documentation documents.
 */

import type { DocumentationDocument } from "../docsTypes/index.js";

/**
 * Generates a JSON representation of a document.
 */
export function generateJSON(
  document: DocumentationDocument,
): Record<string, unknown> {
  return {
    id: document.id,
    title: document.title,
    description: document.description,
    category: document.category,
    tags: document.tags,
    version: document.version,
    status: document.status,
    deprecated: document.deprecated,
    deprecatedMessage: document.deprecatedMessage,
    content: document.content,
    metadata: document.metadata,
  };
}

/**
 * Generates a JSON index for an entire registry of documents.
 */
export function generateIndex(
  documents: readonly DocumentationDocument[],
): Record<string, unknown>[] {
  return documents.map((doc) => ({
    id: doc.id,
    title: doc.title,
    description: doc.description,
    category: doc.category,
    tags: doc.tags,
    version: doc.version,
    status: doc.status,
  }));
}
