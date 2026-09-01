/**
 * Converts structured AST nodes to markdown strings.
 */

import type { DocumentationNode } from "../docsTypes/index.js";

/**
 * Converts a list of documentation nodes to markdown.
 */
export function nodesToMarkdown(nodes: readonly DocumentationNode[]): string {
  const lines: string[] = [];

  for (const node of nodes) {
    switch (node.type) {
      case "heading":
        lines.push(`${"#".repeat(node.level)} ${node.value}`);
        lines.push("");
        break;

      case "paragraph":
        lines.push(node.value);
        lines.push("");
        break;

      case "code":
        lines.push("```" + (node.language ?? ""));
        lines.push(node.value);
        lines.push("```");
        lines.push("");
        break;

      case "list":
        for (let i = 0; i < node.items.length; i++) {
          const prefix = node.ordered ? `${i + 1}. ` : "- ";
          lines.push(`${prefix}${node.items[i]}`);
        }
        lines.push("");
        break;

      case "link":
        lines.push(`[${node.value}](${node.href})`);
        lines.push("");
        break;

      case "table": {
        lines.push("| " + node.headers.join(" | ") + " |");
        lines.push("| " + node.headers.map(() => "---").join(" | ") + " |");
        for (const row of node.rows) {
          lines.push("| " + row.join(" | ") + " |");
        }
        lines.push("");
        break;
      }

      case "quote":
        lines.push(`> ${node.value}`);
        lines.push("");
        break;

      case "callout": {
        const labels: Record<string, string> = {
          note: "NOTE",
          warning: "WARNING",
          tip: "TIP",
          danger: "DANGER",
        };
        lines.push(
          `> **${labels[node.kind] ?? node.kind.toUpperCase()}:** ${node.value}`,
        );
        lines.push("");
        break;
      }
    }
  }

  return lines.join("\n");
}
