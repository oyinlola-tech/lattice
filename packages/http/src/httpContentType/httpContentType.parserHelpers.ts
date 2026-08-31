/**
 * Internal parser helper functions for HTTP Content-Type parsing.
 */

import type {
  ContentTypeParameter,
} from "./httpContentType.type.js";

export function isValidToken(
  value: string,
): boolean {
  return /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/.test(
    value,
  );
}

export function splitParameters(
  value: string,
): string[] {
  const parts: string[] = [];
  let current = "";
  let quoted = false;
  let escaped = false;

  for (const character of value) {
    if (escaped) {
      current += character;
      escaped = false;
      continue;
    }

    if (
      quoted &&
      character === "\\"
    ) {
      current += character;
      escaped = true;
      continue;
    }

    if (character === '"') {
      quoted = !quoted;
      current += character;
      continue;
    }

    if (
      character === ";" &&
      !quoted
    ) {
      parts.push(
        current.trim(),
      );
      current = "";
      continue;
    }

    current += character;
  }

  if (
    current.trim().length > 0
  ) {
    parts.push(
      current.trim(),
    );
  }

  return parts;
}

export function parseParameter(
  value: string,
): ContentTypeParameter | undefined {
  const separator =
    value.indexOf("=");

  if (separator <= 0) {
    return undefined;
  }

  const name = value
    .slice(0, separator)
    .trim()
    .toLowerCase();

  let parameterValue = value
    .slice(separator + 1)
    .trim();

  if (!isValidToken(name)) {
    return undefined;
  }

  if (
    parameterValue.startsWith(
      '"',
    ) &&
    parameterValue.endsWith(
      '"',
    ) &&
    parameterValue.length >= 2
  ) {
    parameterValue =
      unquoteParameterValue(
        parameterValue,
      );
  }

  return {
    name,
    value: parameterValue,
  };
}

export function quoteParameterValue(
  value: string,
): string {
  if (isValidToken(value)) {
    return value;
  }

  return `"${value
    .replaceAll("\\", "\\\\")
    .replaceAll('"', '\\"')}"`;
}

export function unquoteParameterValue(
  value: string,
): string {
  let result = "";

  for (
    let index = 1;
    index < value.length - 1;
    index += 1
  ) {
    const character =
      value[index];

    if (
      character === "\\" &&
      index < value.length - 2
    ) {
      index += 1;
      result += value[index];
      continue;
    }

    result += character;
  }

  return result;
}
