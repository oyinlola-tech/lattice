/**
 * @zudojs/openapi/openApiSchema
 *
 * Schema conversion and registry for OpenAPI generation.
 */

export type {
  SchemaConverter,
  SchemaConversionResult,
} from "./schemaConverter.core.js";
export {
  convertSchema,
  createSchemaConverter,
} from "./schemaConverter.core.js";

export type { SchemaRegistry } from "./schemaRegistry.core.js";
export { SchemaRegistryImpl } from "./schemaRegistry.core.js";

export { createComponentReference } from "./references.core.js";
