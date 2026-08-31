/**
 * Navigation model for documentation.
 *
 * Provides breadcrumb generation, tree flattening, and
 * link resolution for documentation navigation structures.
 */

import type {
  DocumentationBreadcrumb,
  DocumentationNavigationItem,
} from "../docsTypes/index.js";

/**
 * Generates breadcrumbs for a given document ID
 * by walking the navigation tree.
 */
export function getBreadcrumbs(
  documentId: string,
  items: readonly DocumentationNavigationItem[],
): readonly DocumentationBreadcrumb[] {
  const path: DocumentationBreadcrumb[] = [];

  function walk(
    nodes: readonly DocumentationNavigationItem[],
  ): boolean {
    for (const node of nodes) {
      if (node.documentId === documentId) {
        path.push({ title: node.title, documentId: node.documentId });
        return true;
      }

      if (node.children) {
        path.push({ title: node.title });
        if (walk(node.children)) {
          return true;
        }
        path.pop();
      }
    }

    return false;
  }

  walk(items);
  return Object.freeze(path);
}

/**
 * Flattens a navigation tree into a list of all document IDs in order.
 */
export function flattenNavigation(
  items: readonly DocumentationNavigationItem[],
): readonly string[] {
  const result: string[] = [];

  function walk(
    nodes: readonly DocumentationNavigationItem[],
  ): void {
    for (const node of nodes) {
      if (node.documentId) {
        result.push(node.documentId);
      }

      if (node.children) {
        walk(node.children);
      }
    }
  }

  walk(items);
  return Object.freeze(result);
}

/**
 * Finds a navigation item by document ID.
 */
export function findNavigationItem(
  documentId: string,
  items: readonly DocumentationNavigationItem[],
): DocumentationNavigationItem | undefined {
  for (const node of items) {
    if (node.documentId === documentId) {
      return node;
    }

    if (node.children) {
      const found = findNavigationItem(documentId, node.children);
      if (found) return found;
    }
  }

  return undefined;
}

/**
 * Gets sibling document IDs for a given document.
 */
export function getSiblings(
  documentId: string,
  items: readonly DocumentationNavigationItem[],
): readonly string[] {
  function walk(
    nodes: readonly DocumentationNavigationItem[],
  ): string[] | undefined {
    for (const node of nodes) {
      if (node.documentId === documentId) {
        return nodes
          .filter((n) => n.documentId)
          .map((n) => n.documentId!);
      }

      if (node.children) {
        const result = walk(node.children);
        if (result) return result;
      }
    }

    return undefined;
  }

  return Object.freeze(walk(items) ?? []);
}
