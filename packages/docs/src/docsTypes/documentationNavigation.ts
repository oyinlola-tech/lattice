/**
 * Navigation model for documentation.
 *
 * Navigation is modeled separately from documents so that
 * structure can be controlled independently of content.
 */

/** A single item in the documentation navigation tree. */
export interface DocumentationNavigationItem {
  readonly title: string;
  readonly documentId?: string;
  readonly children?: readonly DocumentationNavigationItem[];
}

/** Breadcrumb entry for a document. */
export interface DocumentationBreadcrumb {
  readonly title: string;
  readonly documentId?: string;
}

/** Search document for indexing. */
export interface SearchDocument {
  readonly id: string;
  readonly title: string;
  readonly content: string;
  readonly tags: readonly string[];
  readonly path: string;
}

/** Search result returned from a search query. */
export interface SearchResult {
  readonly id: string;
  readonly title: string;
  readonly path: string;
  readonly excerpt?: string;
  readonly score?: number;
}
