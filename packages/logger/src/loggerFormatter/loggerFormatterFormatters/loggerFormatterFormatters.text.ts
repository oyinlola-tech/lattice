/**
 * Text logger formatter.
 */

import type {
  LoggerFormatter,
  TextLoggerFormatterOptions,
} from "../loggerFormatter.type.js";

import {
  createLoggerFormatter,
} from "../loggerFormatter.core.js";

import {
  formatContext,
  formatSource,
} from "./loggerFormatterFormatters.context.js";

import {
  formatMetadata,
  formatError,
} from "./loggerFormatterFormatters.metadata.js";

/**
 * Creates a human-readable text formatter.
 */
export function createTextLoggerFormatter(
  options: TextLoggerFormatterOptions = {},
): LoggerFormatter<string> {
  const includeTimestamp = options.includeTimestamp ?? true;
  const includeLogger = options.includeLogger ?? true;
  const includeMetadata = options.includeMetadata ?? true;
  const includeContext = options.includeContext ?? true;
  const includeSource = options.includeSource ?? false;
  const includeStackTrace = options.includeStackTrace ?? true;
  const metadataSeparator = options.metadataSeparator ?? " ";

  return createLoggerFormatter((entry) => {
    const parts: string[] = [];

    if (includeTimestamp) {
      parts.push(entry.timestamp.toISOString());
    }

    parts.push(`[${entry.levelName.toUpperCase()}]`);

    if (includeLogger && entry.logger) {
      parts.push(`[${entry.logger}]`);
    }

    parts.push(entry.message);

    if (includeContext && entry.context) {
      const context = formatContext(entry);
      if (context) { parts.push(context); }
    }

    if (includeSource && entry.source) {
      const source = formatSource(entry);
      if (source) { parts.push(source); }
    }

    if (includeMetadata && Object.keys(entry.metadata).length > 0) {
      parts.push(formatMetadata(entry.metadata, metadataSeparator));
    }

    if (entry.error) {
      parts.push(formatError(entry.error, includeStackTrace));
    }

    return parts.join(" ");
  }, { name: options.name ?? "text" });
}
