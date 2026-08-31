/**
 * Code example modeling and validation.
 *
 * Examples are first-class objects that can be validated,
 * rendered, and included in generated documentation.
 */

import type { DocumentationMetadata } from "../docsTypes/index.js";

/**
 * A code example for documentation.
 */
export interface DocumentationExample {
  readonly id: string;
  readonly title?: string;
  readonly language: string;
  readonly code: string;
  readonly description?: string;
  readonly metadata?: DocumentationMetadata;
}

/**
 * Result of validating an example.
 */
export interface ExampleValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

/**
 * Validates a documentation example.
 */
export function validateExample(
  example: DocumentationExample,
): ExampleValidationResult {
  const errors: string[] = [];

  if (!example.id || example.id.trim().length === 0) {
    errors.push("Example ID is required.");
  }

  if (!example.language || example.language.trim().length === 0) {
    errors.push(`Example "${example.id}" requires a language.`);
  }

  if (!example.code || example.code.trim().length === 0) {
    errors.push(`Example "${example.id}" requires code content.`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Renders an example as a markdown code block.
 */
export function renderExampleMarkdown(
  example: DocumentationExample,
): string {
  const lines: string[] = [];

  if (example.title) {
    lines.push(`### ${example.title}`);
    lines.push("");
  }

  if (example.description) {
    lines.push(example.description);
    lines.push("");
  }

  lines.push("```" + example.language);
  lines.push(example.code.trim());
  lines.push("```");

  return lines.join("\n");
}

/**
 * Renders an example as a JSON-serializable object.
 */
export function exampleToJSON(
  example: DocumentationExample,
): Record<string, unknown> {
  return {
    id: example.id,
    title: example.title,
    language: example.language,
    code: example.code,
    description: example.description,
  };
}
