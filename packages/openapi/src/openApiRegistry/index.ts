/**
 * @zudoliblib/openapi/openApiRegistry
 *
 * OpenAPI registry for collecting routes, schemas, and components.
 */

export type {
  OpenAPIRegistry,
  OpenAPIRoute,
  OpenAPIComponentRegistration,
} from "./openApiRegistry.type.js";
export { OpenAPIRegistryImpl } from "./openApiRegistry.core.js";
