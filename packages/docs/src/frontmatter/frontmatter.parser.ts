/**
 * Frontmatter parser for markdown documentation.
 *
 * Parses YAML-like frontmatter delimited by `---` markers
 * and extracts metadata alongside the remaining content.
 */

import type { ParsedFrontmatter, FrontmatterMetadata } from "./frontmatter.types.js";

const FRONTMATTER_DELIMITER = "---";

/**
 * Parses YAML-like frontmatter from a markdown string.
 *
 * Expects content to begin with `---`, followed by key-value pairs,
 * followed by another `---`.
 */
export function parseFrontmatter(
  raw: string,
): ParsedFrontmatter {
  const trimmed = raw.trimStart();

  if (!trimmed.startsWith(FRONTMATTER_DELIMITER)) {
    return { metadata: {}, content: raw };
  }

  const afterFirst = trimmed.slice(FRONTMATTER_DELIMITER.length);
  const endIndex = afterFirst.indexOf(FRONTMATTER_DELIMITER);

  if (endIndex === -1) {
    return { metadata: {}, content: raw };
  }

  const yamlBlock = afterFirst.slice(0, endIndex).trim();
  const remainingContent = afterFirst
    .slice(endIndex + FRONTMATTER_DELIMITER.length)
    .trimStart();

  const metadata = parseYamlLike(yamlBlock);

  return { metadata, content: remainingContent };
}

/**
 * Minimal YAML-like parser for frontmatter key-value pairs.
 */
function parseYamlLike(yaml: string): FrontmatterMetadata {
  const result: Record<string, unknown> = {};
  const lines = yaml.split("\n");
  let currentKey: string | null = null;
  let currentArray: string[] | null = null;

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith("- ")) {
      if (currentKey && currentArray) {
        currentArray.push(trimmed.slice(2).trim());
      }
      continue;
    }

    if (currentKey && currentArray) {
      result[currentKey] = Object.freeze(currentArray);
      currentArray = null;
      currentKey = null;
    }

    const colonIndex = trimmed.indexOf(":");
    if (colonIndex === -1) continue;

    const key = trimmed.slice(0, colonIndex).trim();
    const value = trimmed.slice(colonIndex + 1).trim();

    if (value === "") {
      currentKey = key;
      currentArray = [];
      continue;
    }

    result[key] = parseScalar(value);
  }

  if (currentKey && currentArray) {
    result[currentKey] = Object.freeze(currentArray);
  }

  return Object.freeze(result) as FrontmatterMetadata;
}

/**
 * Parses a scalar YAML value into its appropriate JS type.
 */
function parseScalar(value: string): string | number | boolean {
  if (value === "true") return true;
  if (value === "false") return false;

  if (/^\d+$/.test(value)) {
    return Number(value);
  }

  return value;
}
