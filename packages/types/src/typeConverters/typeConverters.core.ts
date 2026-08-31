/**
 * Runtime type conversion helpers.
 *
 * @module typeConverters/typeConverters
 */

/**
 * Safely parse JSON with a fallback value.
 */
export function safeJsonParse<T>(
  json: string,
  fallback: T,
): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

/**
 * Convert a value to a string safely.
 */
export function toString(value: unknown, fallback = ""): string {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return fallback;
  }
}

/**
 * Convert a value to a number safely.
 */
export function toNumber(value: unknown, fallback = NaN): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const num = Number(value);
    return Number.isNaN(num) ? fallback : num;
  }
  return fallback;
}

/**
 * Convert a value to a boolean safely.
 */
export function toBoolean(value: unknown, fallback = false): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const lower = value.toLowerCase().trim();
    if (lower === "true" || lower === "1" || lower === "yes") return true;
    if (lower === "false" || lower === "0" || lower === "no" || lower === "") return false;
  }
  if (typeof value === "number") return value !== 0;
  return fallback;
}

/**
 * Convert a value to an array (wrapping non-arrays).
 */
export function toArray<T>(value: T | T[]): T[] {
  if (Array.isArray(value)) return value;
  return [value];
}

/**
 * Convert a Map to a plain object.
 */
export function mapToObject<K extends string | number | symbol, V>(
  map: Map<K, V>,
): Record<K, V> {
  const obj = {} as Record<K, V>;
  for (const [key, value] of map) {
    obj[key] = value;
  }
  return obj;
}

/**
 * Convert a plain object to a Map.
 */
export function objectToMap<K extends string | number | symbol, V>(
  obj: Record<K, V>,
): Map<K, V> {
  return new Map(Object.entries(obj) as [K, V][]);
}

/**
 * Convert snake_case to camelCase.
 */
export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Convert camelCase to snake_case.
 */
export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

/**
 * Convert kebab-case to camelCase.
 */
export function kebabToCamel(str: string): string {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Convert camelCase to kebab-case.
 */
export function camelToKebab(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}
