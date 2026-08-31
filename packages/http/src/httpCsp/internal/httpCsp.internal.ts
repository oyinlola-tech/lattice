/**
 * Internal CSP helpers for splitting, normalizing, and freezing directives.
 */

import type { CSPDirectiveValue, CSPDirectives } from '../types/httpCsp.type.js';
import { normalizeDirectiveName } from '../validation/httpCsp.validation.js';

export function splitPolicy(
  value: string,
): string[] {
  const result: string[] = [];
  let current = "";

  for (const character of value) {
    if (character === ";") {
      if (current.trim().length > 0) {
        result.push(current.trim());
      }
      current = "";
      continue;
    }
    current += character;
  }

  if (current.trim().length > 0) {
    result.push(current.trim());
  }

  return result;
}

export function normalizeDirectiveValues(
  values: CSPDirectiveValue,
): string[] {
  const result =
    typeof values === "string"
      ? values.trim().split(/\s+/)
      : values.map((value) => value.trim()).filter(Boolean);

  return result.filter(Boolean);
}

export function freezeDirectives(
  directives: Record<string, readonly string[]>,
): CSPDirectives {
  const result: Record<string, readonly string[]> = {};

  for (const [name, values] of Object.entries(directives)) {
    result[name] = Object.freeze([...values]);
  }

  return Object.freeze(result);
}

export function addOptionalDirective(
  target: Record<string, readonly string[]>,
  name: string,
  value: CSPDirectiveValue | undefined,
): void {
  if (value === undefined) {
    return;
  }
  target[name] = normalizeDirectiveValues(value);
}

export function mergeDirectives(
  target: Record<string, readonly string[]>,
  source: Readonly<Record<string, CSPDirectiveValue>>,
): void {
  for (const [rawName, rawValue] of Object.entries(source)) {
    const name = normalizeDirectiveName(rawName);
    target[name] = normalizeDirectiveValues(rawValue);
  }
}

export function sourceMatchesHost(
  configured: string,
  requested: string,
): boolean {
  if (configured === requested) {
    return true;
  }

  if (configured.startsWith("*.")) {
    const suffix = configured.slice(1);
    return requested.endsWith(suffix);
  }

  return false;
}
