/**
 * Logger context and source formatting helpers.
 */

import type {
  LoggerEntry,
} from "../../loggerEntry/loggerEntry.type.js";

/**
 * Formats logger context.
 */
export function formatContext(
  entry:
    LoggerEntry,
):
  string {
  if (
    !entry.context
  ) {
    return "";
  }

  const values:
    string[] =
    [];

  for (
    const [
      key,
      value,
    ] of Object.entries(
      entry.context,
    )
  ) {
    if (
      value ===
        undefined ||
      value ===
        null
    ) {
      continue;
    }

    values.push(
      `${key}=${String(value)}`,
    );
  }

  return values.length >
    0
    ? `[${values.join(" ")}]`
    : "";
}

/**
 * Formats logger source information.
 */
export function formatSource(
  entry:
    LoggerEntry,
):
  string {
  const source =
    entry.source;

  if (
    !source
  ) {
    return "";
  }

  const location:
    string[] =
    [];

  if (
    source.file
  ) {
    location.push(
      source.file,
    );
  }

  if (
    source.line !==
      undefined
  ) {
    location.push(
      String(
        source.line,
      ),
    );
  }

  const functionName =
    source.function
      ? ` ${source.function}`
      : "";

  return location.length >
    0
    ? `[${location.join(":")}${functionName}]`
    : "";
}
