/**
 * Utility helpers for the documentation package.
 */

/**
 * Normalizes a document ID to a consistent format.
 * Strips leading/trailing dots, collapses consecutive dots.
 */
export function normalizeDocumentId(id: string): string {
  return id
    .replace(/\.+/g, ".")
    .replace(/^\.|\.$/g, "")
    .trim();
}

/**
 * Generates a document ID from a file path.
 * Converts path separators to dots and removes extension.
 */
export function documentIdFromPath(path: string): string {
  return normalizeDocumentId(
    path.replace(/\.[^.]+$/, "").replace(/[/\\]/g, "."),
  );
}

/**
 * Resolves a relative document link against a base ID.
 * "guides.http" + "./routing" → "guides.http.routing"
 */
export function resolveDocumentLink(baseId: string, link: string): string {
  if (link.startsWith("/")) {
    return normalizeDocumentId(link.slice(1));
  }

  const baseParts = baseId.split(".");
  baseParts.pop();

  const linkParts = link.split("/");

  for (const part of linkParts) {
    if (part === "..") {
      baseParts.pop();
    } else if (part !== "." && part !== "") {
      baseParts.push(part);
    }
  }

  return normalizeDocumentId(baseParts.join("."));
}

/**
 * Extracts the title from markdown content (first heading).
 */
export function extractTitleFromMarkdown(markdown: string): string | undefined {
  const match = markdown.match(/^# ([^\n]+)$/m);
  return match?.[1]?.trim();
}

/**
 * Extracts headings from markdown content.
 */
export function extractHeadings(
  markdown: string,
): readonly { level: number; text: string }[] {
  const results: { level: number; text: string }[] = [];
  const pattern = /^(#{1,6}) ([^\n]+)$/gm;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(markdown)) !== null) {
    const hashes = match[1];
    const headingText = match[2];

    if (hashes && headingText) {
      results.push({
        level: hashes.length,
        text: headingText.trim(),
      });
    }
  }

  return Object.freeze(results);
}

/**
 * Strips markdown formatting to plain text.
 */
export function stripMarkdown(markdown: string): string {
  return markdown
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .trim();
}
