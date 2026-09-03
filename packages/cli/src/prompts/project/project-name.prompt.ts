/**
 * @oyinlola141/lattice-cli — Project Name Prompt
 *
 * Prompts for the project name.
 */

import * as p from "@clack/prompts";

export async function promptProjectName(overrides?: string): Promise<string> {
  const value =
    overrides ??
    (await p.text({
      message: "What is your project name?",
      placeholder: "my-project",
      validate(value) {
        if (!value || value.trim().length === 0) {
          return "Project name is required.";
        }
        if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
          return "Only alphanumeric, hyphens, and underscores allowed.";
        }
      },
    }));

  if (p.isCancel(value)) {
    p.cancel("Operation cancelled.");
    process.exit(0);
  }

  return value;
}
