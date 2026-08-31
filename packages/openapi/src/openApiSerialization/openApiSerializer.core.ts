import type { OpenAPIDocument } from "../openApiTypes/openApiTypes.core.js";
import { OpenAPISerializationError } from "../openApiErrors/openApiError.core.js";

/**
 * Serializes an OpenAPI document to JSON string.
 */
export function toOpenAPIJSON(document: OpenAPIDocument): string {
  try {
    return JSON.stringify(document, null, 2);
  } catch (error) {
    throw new OpenAPISerializationError(
      `Failed to serialize OpenAPI document to JSON: ${(error as Error).message}`,
    );
  }
}

/**
 * Serializes an OpenAPI document to YAML string.
 *
 * Note: This requires a YAML library. For now, returns JSON as a fallback.
 */
export function toOpenAPIYAML(document: OpenAPIDocument): string {
  try {
    return JSON.stringify(document, null, 2);
  } catch (error) {
    throw new OpenAPISerializationError(
      `Failed to serialize OpenAPI document to YAML: ${(error as Error).message}`,
    );
  }
}
