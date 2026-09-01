/**
 * CSP policy validation.
 */

import type { CSPDirectives } from "../types/httpCsp.type.js";
import { parseCSP } from "../parsing/httpCsp.parsing.js";
import { isValidDirectiveName } from "./httpCsp.validation.js";

export function validateCSP(policy: string | CSPDirectives): boolean {
  const directives = typeof policy === "string" ? parseCSP(policy) : policy;

  for (const [name, values] of Object.entries(directives)) {
    if (!isValidDirectiveName(name)) {
      return false;
    }

    for (const value of values) {
      if (value.includes(";")) {
        return false;
      }

      if (value.includes("\r") || value.includes("\n")) {
        return false;
      }
    }
  }

  return true;
}
