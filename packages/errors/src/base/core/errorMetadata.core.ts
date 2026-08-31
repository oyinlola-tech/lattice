import type { ErrorMetadata, ErrorMetadataValue } from "./errorMetadata.type.js";

/** Creates an immutable metadata object. */
export function createErrorMetadata(metadata: ErrorMetadata | undefined | null): Readonly<ErrorMetadata> {
  if (metadata === undefined || metadata === null) return Object.freeze({});
  return Object.freeze({ ...metadata });
}

/** Merges multiple metadata objects. Later metadata objects override earlier values. */
export function mergeErrorMetadata(...metadata: readonly (ErrorMetadata | undefined | null)[]): Readonly<ErrorMetadata> {
  const merged: Record<string, ErrorMetadataValue> = {};

  for (const current of metadata) {
    if (current === undefined || current === null) continue;
    for (const [key, value] of Object.entries(current)) {
      if (value !== undefined) merged[key] = value;
    }
  }

  return Object.freeze(merged);
}

/** Reads a metadata property. */
export function getErrorMetadataValue(metadata: ErrorMetadata | undefined | null, key: string): ErrorMetadataValue | undefined {
  if (metadata === undefined || metadata === null) return undefined;
  return metadata[key];
}

/** Determines whether metadata contains a property. */
export function hasErrorMetadata(metadata: ErrorMetadata | undefined | null, key: string): boolean {
  return metadata !== undefined && metadata !== null && Object.prototype.hasOwnProperty.call(metadata, key);
}

/** Removes a metadata property. */
export function omitErrorMetadata(metadata: ErrorMetadata | undefined | null, ...keys: readonly string[]): Readonly<ErrorMetadata> {
  if (metadata === undefined || metadata === null) return Object.freeze({});

  const omitted = { ...metadata };
  for (const key of keys) delete omitted[key];
  return Object.freeze(omitted);
}

/** Selects only the requested metadata properties. */
export function pickErrorMetadata(metadata: ErrorMetadata | undefined | null, keys: readonly string[]): Readonly<ErrorMetadata> {
  if (metadata === undefined || metadata === null) return Object.freeze({});

  const selected: Record<string, ErrorMetadataValue> = {};
  for (const key of keys) {
    const value = metadata[key];
    if (value !== undefined) selected[key] = value;
  }

  return Object.freeze(selected);
}

/** Converts metadata into a plain JSON-safe object. */
export function serializeErrorMetadata(metadata: ErrorMetadata | undefined | null): Record<string, ErrorMetadataValue> {
  if (metadata === undefined || metadata === null) return {};
  return { ...metadata } as Record<string, ErrorMetadataValue>;
}

/** Determines whether an arbitrary value is valid error metadata. */
export function isErrorMetadataValue(value: unknown): value is ErrorMetadataValue {
  if (value === null || typeof value === "string" || typeof value === "boolean") return true;
  if (typeof value === "number") return Number.isFinite(value);
  if (Array.isArray(value)) return value.every(isErrorMetadataValue);

  if (typeof value === "object") {
    return Object.values(value as Record<string, unknown>).every(
      (entry) => entry === undefined || isErrorMetadataValue(entry),
    );
  }

  return false;
}

/**
 * Sanitizes arbitrary metadata by removing unsupported values.
 *
 * This is useful before serializing unknown data into logs or API responses.
 */
export function sanitizeErrorMetadata(metadata: Record<string, unknown> | undefined | null): Readonly<ErrorMetadata> {
  if (metadata === undefined || metadata === null) return Object.freeze({});

  const sanitized: Record<string, ErrorMetadataValue> = {};
  for (const [key, value] of Object.entries(metadata)) {
    if (value !== undefined && isErrorMetadataValue(value)) sanitized[key] = value;
  }

  return Object.freeze(sanitized);
}
