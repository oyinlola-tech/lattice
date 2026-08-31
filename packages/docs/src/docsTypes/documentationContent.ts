/**
 * Content model for documentation documents.
 *
 * Supports multiple content formats: markdown, MDX, HTML,
 * and structured AST nodes for multi-format rendering.
 */

/** A single node in a structured documentation AST. */
export type DocumentationNode =
  | HeadingNode
  | ParagraphNode
  | CodeNode
  | ListNode
  | LinkNode
  | TableNode
  | QuoteNode
  | CalloutNode;

/** Heading node with level 1-6. */
export interface HeadingNode {
  readonly type: "heading";
  readonly level: 1 | 2 | 3 | 4 | 5 | 6;
  readonly value: string;
}

/** Paragraph node. */
export interface ParagraphNode {
  readonly type: "paragraph";
  readonly value: string;
}

/** Code block node. */
export interface CodeNode {
  readonly type: "code";
  readonly language?: string;
  readonly value: string;
}

/** List node (ordered or unordered). */
export interface ListNode {
  readonly type: "list";
  readonly ordered: boolean;
  readonly items: readonly string[];
}

/** Link node. */
export interface LinkNode {
  readonly type: "link";
  readonly href: string;
  readonly value: string;
}

/** Table node. */
export interface TableNode {
  readonly type: "table";
  readonly headers: readonly string[];
  readonly rows: readonly (readonly string[])[];
}

/** Blockquote node. */
export interface QuoteNode {
  readonly type: "quote";
  readonly value: string;
}

/** Callout/admonition node. */
export interface CalloutNode {
  readonly type: "callout";
  readonly kind: "note" | "warning" | "tip" | "danger";
  readonly value: string;
}

/** Markdown content. */
export interface MarkdownContent {
  readonly type: "markdown";
  readonly value: string;
}

/** MDX content. */
export interface MDXContent {
  readonly type: "mdx";
  readonly value: string;
}

/** HTML content. */
export interface HTMLContent {
  readonly type: "html";
  readonly value: string;
}

/** Structured content using AST nodes. */
export interface StructuredContent {
  readonly type: "structured";
  readonly nodes: readonly DocumentationNode[];
}

/**
 * Union of all supported content types.
 * A document can use any of these formats.
 */
export type DocumentationContent =
  | MarkdownContent
  | MDXContent
  | HTMLContent
  | StructuredContent;
