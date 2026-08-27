/**
 * Logger entry value serialization.
 */

/**
 * Serializes an error-like object into a plain object.
 */
export function serializeLoggerError(error: { name?: string; message: string; stack?: string }): Record<string, unknown> {
  return {
    name: error.name,
    message: error.message,
    stack: error.stack,
  };
}

/**
 * Converts arbitrary values into safer serializable values.
 */
export function serializeLoggerValue(
  value: unknown,
  seen: WeakSet<object> = new WeakSet<object>(),
): unknown {
  if (value === null || value === undefined || typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value;
  }

  if (typeof value === "bigint") { return value.toString(); }
  if (value instanceof Date) { return value.toISOString(); }
  if (value instanceof Error) { return serializeLoggerError(value); }
  if (typeof value === "function") { return `[Function ${value.name || "anonymous"}]`; }
  if (typeof value === "symbol") { return value.toString(); }
  if (typeof value !== "object") { return String(value); }
  if (seen.has(value)) { return "[Circular]"; }

  seen.add(value);

  if (Array.isArray(value)) {
    return value.map((item) => serializeLoggerValue(item, seen));
  }

  const result: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value)) {
    result[key] = serializeLoggerValue(item, seen);
  }
  return result;
}
