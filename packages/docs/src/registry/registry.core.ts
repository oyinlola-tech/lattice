/**
 * Document registry with O(1) lookup by ID.
 *
 * Provides registration, retrieval, and iteration over
 * documentation documents. Prevents duplicate IDs.
 */

import type {
  DocumentationDocument,
  DocumentationProvider,
} from "../docsTypes/index.js";

/**
 * Registry for managing documentation documents.
 */
export class DocumentRegistry implements DocumentationProvider {
  private readonly documents = new Map<string, DocumentationDocument>();

  /**
   * Registers a document. Throws if the ID is already registered.
   */
  register(document: DocumentationDocument): void {
    if (this.documents.has(document.id)) {
      throw new Error(
        `Duplicate document ID: "${document.id}".`,
      );
    }

    this.documents.set(document.id, Object.freeze(document));
  }

  /**
   * Registers multiple documents.
   */
  registerAll(
    documents: readonly DocumentationDocument[],
  ): void {
    for (const doc of documents) {
      this.register(doc);
    }
  }

  /**
   * Retrieves a document by ID. Returns undefined if not found.
   */
  get(id: string): DocumentationDocument | undefined {
    return this.documents.get(id);
  }

  /**
   * Returns all registered documents.
   */
  getAll(): readonly DocumentationDocument[] {
    return Object.freeze([...this.documents.values()]);
  }

  /**
   * Returns the number of registered documents.
   */
  get size(): number {
    return this.documents.size;
  }

  /**
   * Checks if a document ID is registered.
   */
  has(id: string): boolean {
    return this.documents.has(id);
  }

  /**
   * Removes a document by ID. Returns true if it existed.
   */
  delete(id: string): boolean {
    return this.documents.delete(id);
  }

  /**
   * Clears all registered documents.
   */
  clear(): void {
    this.documents.clear();
  }

  /**
   * Returns all document IDs.
   */
  ids(): readonly string[] {
    return Object.freeze([...this.documents.keys()]);
  }

  /**
   * Filters documents by category.
   */
  byCategory(
    category: string,
  ): readonly DocumentationDocument[] {
    return Object.freeze(
      [...this.documents.values()].filter(
        (doc) => doc.category === category,
      ),
    );
  }

  /**
   * Filters documents by tag.
   */
  byTag(tag: string): readonly DocumentationDocument[] {
    return Object.freeze(
      [...this.documents.values()].filter(
        (doc) => doc.tags?.includes(tag),
      ),
    );
  }
}

/**
 * Creates a new document registry.
 */
export function createDocumentRegistry(): DocumentRegistry {
  return new DocumentRegistry();
}
