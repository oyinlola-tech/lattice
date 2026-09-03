/**
 * @oyinlola141/lattice-cli — Database Prompt
 *
 * Prompts for database selection.
 */

import * as p from "@clack/prompts";
import type { DatabaseProvider } from "../../types/projectConfiguration.type.js";

export async function promptDatabase(
  overrides?: DatabaseProvider,
): Promise<DatabaseProvider> {
  const value =
    overrides ??
    (await p.select({
      message: "Select database",
      options: [
        {
          value: "postgresql",
          label: "PostgreSQL",
          hint: "Recommended for production",
        },
        {
          value: "mysql",
          label: "MySQL",
          hint: "Widely used relational database",
        },
        {
          value: "sqlite",
          label: "SQLite",
          hint: "Lightweight, file-based",
        },
      ],
      initialValue: "postgresql",
    }));

  if (p.isCancel(value)) {
    p.cancel("Operation cancelled.");
    process.exit(0);
  }

  return value;
}
