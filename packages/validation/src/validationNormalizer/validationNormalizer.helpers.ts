/**
 * String normalization helpers.
 */

/** Trims leading and trailing whitespace. */
export function normalizeTrim(value: string): string {
  return value.trim();
}

/** Converts consecutive whitespace characters into a single space. */
export function normalizeWhitespace(value: string): string {
  return value.trim().replace(/\s+/gu, " ");
}

/** Converts a string to lowercase. */
export function normalizeLowercase(value: string): string {
  return value.toLowerCase();
}

/** Converts a string to uppercase. */
export function normalizeUppercase(value: string): string {
  return value.toUpperCase();
}

/** Normalizes Unicode text using NFC normalization. */
export function normalizeUnicode(value: string): string {
  return value.normalize("NFC");
}

/** Normalizes an email address. */
export function normalizeEmail(value: string): string {
  return normalizeUnicode(normalizeWhitespace(value)).toLowerCase();
}

/** Normalizes a URL by removing surrounding whitespace. */
export function normalizeUrl(value: string): string {
  return normalizeWhitespace(normalizeUnicode(value));
}

/** Normalizes an identifier by trimming and lowercasing it. */
export function normalizeIdentifier(value: string): string {
  return normalizeLowercase(normalizeWhitespace(normalizeUnicode(value)));
}

/** Removes surrounding quotes from a string. */
export function normalizeQuotes(value: string): string {
  const normalized = value.trim();
  if (
    normalized.length >= 2 &&
    ((normalized.startsWith('"') && normalized.endsWith('"')) ||
      (normalized.startsWith("'") && normalized.endsWith("'")))
  ) {
    return normalized.slice(1, -1);
  }
  return normalized;
}

/** Removes Unicode byte-order marks from the beginning of text. */
export function removeBom(value: string): string {
  return value.replace(/^\uFEFF/u, "");
}

/** Normalizes an array by applying a normalizer to every item. */
export function normalizeArray<T>(
  values: readonly T[],
  normalizer: (value: T) => T,
): T[] {
  return values.map(normalizer);
}

/** Normalizes an array asynchronously. */
export async function normalizeArrayAsync<T>(
  values: readonly T[],
  normalizer: (value: T) => T | Promise<T>,
): Promise<T[]> {
  return Promise.all(values.map(normalizer));
}

/** Composes multiple normalizers into one. */
export function composeNormalizers<T>(
  ...normalizers: readonly ((value: T) => T)[]
): (value: T) => T {
  return (value: T): T => {
    let current = value;
    for (const normalizer of normalizers) current = normalizer(current);
    return current;
  };
}

/** Creates a normalizer that only changes a value when the predicate returns true. */
export function conditionalNormalizer<T>(
  predicate: (value: T) => boolean,
  normalizer: (value: T) => T,
): (value: T) => T {
  return (value: T): T => (predicate(value) ? normalizer(value) : value);
}

/** Normalizes an optional string. */
export function normalizeOptionalString(
  value: string | undefined,
): string | undefined {
  if (value === undefined) return undefined;
  return normalizeWhitespace(normalizeUnicode(value));
}

/** Normalizes a nullable string. */
export function normalizeNullableString(value: string | null): string | null {
  if (value === null) return null;
  return normalizeWhitespace(normalizeUnicode(value));
}

/** Normalizes an optional nullable string. */
export function normalizeOptionalNullableString(
  value: string | null | undefined,
): string | null | undefined {
  if (value === null || value === undefined) return value;
  return normalizeWhitespace(normalizeUnicode(value));
}
