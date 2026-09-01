/**
 * Markdown output generation for documentation documents.
 */

import type {
  DocumentationDocument,
  DocumentationContent,
} from "../docsTypes/index.js";
import type { MarkdownGeneratorOptions } from "./generator.types.js";
import { nodesToMarkdown } from "./generatorMarkdownNodes.js";

/**
 * Generates a markdown string from a document.
 */
export function generateMarkdown(
  document: DocumentationDocument,
  options: MarkdownGeneratorOptions = {},
): string {
  const { includeFrontmatter = true, includeMeta = false } = options;
  const lines: string[] = [];

  if (includeFrontmatter) {
    lines.push("---");
    lines.push(`title: ${document.title}`);

    if (document.description) {
      lines.push(`description: ${document.description}`);
    }

    if (document.category) {
      lines.push(`category: ${document.category}`);
    }

    if (document.tags && document.tags.length > 0) {
      lines.push("tags:");
      for (const tag of document.tags) {
        lines.push(`  - ${tag}`);
      }
    }

    if (document.version) {
      lines.push(`version: ${document.version}`);
    }

    if (document.status) {
      lines.push(`status: ${document.status}`);
    }

    lines.push("---");
    lines.push("");
  }

  if (document.deprecated) {
    lines.push("> **DEPRECATED:**");
    if (document.deprecatedMessage) {
      lines.push(">");
      lines.push(`> ${document.deprecatedMessage}`);
    }
    lines.push("");
  }

  lines.push(contentToMarkdown(document.content));

  if (includeMeta && document.metadata) {
    lines.push("");
    lines.push("---");
    lines.push("");

    if (document.metadata.owner) {
      lines.push(`**Owner:** ${document.metadata.owner}`);
    }

    if (document.metadata.updatedAt) {
      lines.push(`**Updated:** ${document.metadata.updatedAt.toISOString()}`);
    }
  }

  return lines.join("\n");
}

/**
 * Converts content to markdown string.
 */
function contentToMarkdown(content: DocumentationContent): string {
  switch (content.type) {
    case "markdown":
      return content.value;
    case "html":
      return content.value;
    case "mdx":
      return content.value;
    case "structured":
      return nodesToMarkdown(content.nodes);
  }
}
