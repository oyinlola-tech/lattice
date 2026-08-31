/**
 * Type definitions for frontmatter parsing.
 */

/**
 * Parsed frontmatter result.
 */
export interface ParsedFrontmatter {
  readonly metadata: FrontmatterMetadata;
  readonly content: string;
}

/**
 * Metadata extracted from frontmatter.
 */
export interface FrontmatterMetadata {
  readonly title?: string;
  readonly description?: string;
  readonly category?: string;
  readonly tags?: readonly string[];
  readonly version?: string;
  readonly status?: string;
  readonly deprecated?: boolean;
  readonly deprecatedMessage?: string;
  readonly visibility?: string;
  readonly [key: string]: unknown;
}
