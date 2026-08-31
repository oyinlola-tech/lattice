import type { OpenAPIReference } from "../openApiTypes/openApiTypes.core.js";

/**
 * Creates an OpenAPI component reference.
 *
 * @param section - The component section (e.g., "schemas", "responses")
 * @param name - The component name
 */
export function createComponentReference(
  section: string,
  name: string,
): OpenAPIReference {
  return {
    $ref: `#/components/${section}/${name}`,
  };
}
