/**
 * @oyinlola141/lattice-cli — Confirmation Prompt
 *
 * Prompts for confirmation before generation.
 */

import * as p from "@clack/prompts";

export async function promptConfirmation(
  message: string,
  initialValue = true,
): Promise<boolean> {
  const value = await p.confirm({
    message,
    initialValue,
  });

  if (p.isCancel(value)) {
    p.cancel("Operation cancelled.");
    process.exit(0);
  }

  return value;
}
