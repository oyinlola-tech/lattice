/**
 * JSON logger formatter.
 */

import { serializeLoggerEntry } from "../../loggerEntry/loggerEntrySerialize.js";

import type {
  JsonLoggerFormatterOptions,
  LoggerFormatter,
} from "../loggerFormatter.type.js";

import { createLoggerFormatter } from "../loggerFormatter.core.js";

/**
 * Removes undefined values recursively.
 */
function removeUndefinedValues(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => removeUndefinedValues(item));
  }

  if (value && typeof value === "object" && !(value instanceof Date)) {
    const result: Record<string, unknown> = {};

    for (const [key, item] of Object.entries(value)) {
      if (item === undefined) {
        continue;
      }

      result[key] = removeUndefinedValues(item);
    }

    return result;
  }

  return value;
}

/**
 * Creates a JSON formatter.
 */
export function createJsonLoggerFormatter(
  options: JsonLoggerFormatterOptions = {},
): LoggerFormatter<string> {
  const pretty = options.pretty ?? false;

  const indent = options.indent ?? 2;

  return createLoggerFormatter(
    (entry) => {
      const serialized = serializeLoggerEntry(entry);

      const normalized = options.includeUndefined
        ? serialized
        : removeUndefinedValues(serialized);

      return JSON.stringify(normalized, null, pretty ? indent : undefined);
    },
    {
      name: options.name ?? "json",
    },
  );
}
