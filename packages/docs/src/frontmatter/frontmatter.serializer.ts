/**
 * Frontmatter serializer — converts metadata back to YAML-like format.
 */

import type { FrontmatterMetadata } from "./frontmatter.types.js";

const FRONTMATTER_DELIMITER = "---";

/**
 * Serializes metadata back into a frontmatter string.
 */
export function serializeFrontmatter(
  metadata: FrontmatterMetadata,
  content: string,
): string {
  const lines: string[] = [FRONTMATTER_DELIMITER];

  for (const [key, value] of Object.entries(metadata)) {
    if (value === undefined || value === null) continue;

    if (Array.isArray(value)) {
      lines.push(`${key}:`);
      for (const item of value) {
        lines.push(`  - ${item}`);
      }
    } else if (typeof value === "boolean") {
      lines.push(`${key}: ${value ? "true" : "false"}`);
    } else {
      lines.push(`${key}: ${value}`);
    }
  }

  lines.push(FRONTMATTER_DELIMITER);
  lines.push("");
  lines.push(content);

  return lines.join("\n");
}
