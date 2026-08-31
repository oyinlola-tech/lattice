/**
 * JSON-compatible primitive values.
 */
export type ErrorMetadataPrimitive = string | number | boolean | null;

/**
 * Values that can safely be attached to an error as metadata.
 *
 * Metadata should remain serializable so it can be transported through
 * logs, APIs, queues, and monitoring systems.
 */
export type ErrorMetadataValue =
  | ErrorMetadataPrimitive
  | readonly ErrorMetadataValue[]
  | { readonly [key: string]: ErrorMetadataValue };

/**
 * Metadata associated with an application error.
 */
export interface ErrorMetadata {
  readonly [key: string]: ErrorMetadataValue | undefined;
}
