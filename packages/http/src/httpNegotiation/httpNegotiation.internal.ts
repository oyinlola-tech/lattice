/**
 * Internal utilities for HTTP content negotiation.
 *
 * Shared helper functions used by parsing, matching, and formatting
 * modules. These are not part of the public API.
 */

import type { NegotiationPreference } from "./httpNegotiation.types.js";

import { DEFAULT_NEGOTIATION_QUALITY } from "./httpNegotiation.types.js";

export function calculateSpecificity(
  value: string,
  parameters: Readonly<Record<string, string>>,
): number {
  const normalized = value.trim().toLowerCase();

  if (normalized.includes("/")) {
    return (
      mediaTypeSpecificityLocal(normalized) + Object.keys(parameters).length
    );
  }

  if (normalized.includes("-")) {
    return (
      languageSpecificityLocal(normalized) + Object.keys(parameters).length
    );
  }

  return (normalized === "*" ? 0 : 1) + Object.keys(parameters).length;
}

function mediaTypeSpecificityLocal(value: string): number {
  const slash = value.indexOf("/");

  if (slash <= 0 || slash === value.length - 1) {
    return 0;
  }

  const type = value.slice(0, slash);

  const subtype = value.slice(slash + 1);

  if (type === "*" && subtype === "*") {
    return 0;
  }

  if (subtype === "*") {
    return 1;
  }

  if (subtype.startsWith("*+")) {
    return 2;
  }

  return 3;
}

function languageSpecificityLocal(value: string): number {
  const normalized = value.trim().replace(/_/g, "-").toLowerCase();

  if (normalized === "*") {
    return 0;
  }

  return normalized.split("-").filter(Boolean).length;
}

export function splitParameters(value: string): string[] {
  const result: string[] = [];
  let current = "";
  let quoted = false;
  let escaped = false;

  for (const character of value) {
    if (escaped) {
      current += character;
      escaped = false;
      continue;
    }

    if (character === "\\") {
      current += character;
      escaped = true;
      continue;
    }

    if (character === '"') {
      quoted = !quoted;
      current += character;
      continue;
    }

    if (character === ";" && !quoted) {
      result.push(current);
      current = "";
      continue;
    }

    current += character;
  }

  result.push(current);

  return result;
}

export function unquote(value: string): string {
  const trimmed = value.trim();

  if (trimmed.length >= 2 && trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return trimmed.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, "\\");
  }

  return trimmed;
}

export function quoteIfNeeded(value: string): string {
  if (/^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/.test(value)) {
    return value;
  }

  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

export function normalizeToken(value: string): string {
  return value.trim().toLowerCase();
}

export function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}
