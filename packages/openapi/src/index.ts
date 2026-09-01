/**
 * @oyinlola141/lattice-openapi
 *
 * API contract and documentation engine for the Lattice framework.
 *
 * Generates OpenAPI specifications from application routes, schemas,
 * and metadata. Supports OpenAPI 3.0 and 3.1.
 *
 * @example
 * ```ts
 * import { OpenAPIManager } from "@oyinlola141/lattice-openapi";
 *
 * const manager = new OpenAPIManager("3.1.0");
 *
 * manager.addRoute({
 *   method: "get",
 *   path: "/users/:id",
 *   metadata: {
 *     openapi: {
 *       operationId: "users.get",
 *       summary: "Get a user",
 *       responses: { "200": { description: "User found" } },
 *     },
 *   },
 * });
 *
 * const document = manager.generate();
 * const json = manager.toJSON();
 * ```
 */

export { OpenAPIDocumentBuilder } from "./openApiDocument/openApiDocument.builder.js";
export type { OpenAPIDocumentOptions } from "./openApiDocument/openApiDocument.builder.js";

export { OpenAPIRegistryImpl } from "./openApiRegistry/openApiRegistry.core.js";
export type {
  OpenAPIRegistry,
  OpenAPIRoute,
  OpenAPIComponentRegistration,
} from "./openApiRegistry/openApiRegistry.type.js";

export {
  OpenAPIError,
  OpenAPIValidationError,
  OpenAPIDocumentError,
  OpenAPIComponentError,
  OpenAPIComponentConflictError,
  OpenAPIReferenceError,
  OpenAPIRouteError,
  OpenAPISchemaError,
  OpenAPISerializationError,
  OpenAPIVersionError,
  OpenAPIOperationError,
  createOpenAPIError,
  isOpenAPIError,
} from "./openApiErrors/openApiError.core.js";

export type {
  OpenAPIErrorOptions,
  OpenAPIValidationIssue,
} from "./openApiErrors/openApiError.core.js";

export {
  DEFAULT_OPENAPI_VERSION,
  MAX_OPERATION_ID_LENGTH,
  COMPONENT_REF_PREFIX,
  DEFAULT_MEDIA_TYPE,
  STATUS_CODE_CATEGORIES,
  DEFAULT_SERVER_URL,
  DOCUMENT_CACHE_TTL_MS,
} from "./openApiConstants/openApiConstants.core.js";

export {
  toOpenAPIPath,
  convertRouteToOpenAPI,
  LATTICE_TO_OPENAPI_METHODS,
  OpenAPIRouteScannerImpl,
} from "./openApiRouting/index.js";
export type {
  RouteMetadata,
  RouteOpenAPIMetadata,
  RouteParameterMetadata,
  RouteInfo,
} from "./openApiRouting/index.js";

export {
  convertSchema,
  createSchemaConverter,
} from "./openApiSchema/schemaConverter.core.js";
export type {
  SchemaConverter,
  SchemaConversionResult,
} from "./openApiSchema/schemaConverter.core.js";

export { SchemaRegistryImpl } from "./openApiSchema/schemaRegistry.core.js";
export type { SchemaRegistry } from "./openApiSchema/schemaRegistry.core.js";

export { createComponentReference } from "./openApiSchema/references.core.js";

export { OpenAPIValidatorImpl } from "./openApiValidation/openApiValidator.core.js";
export type { OpenAPIValidator } from "./openApiValidation/openApiValidator.core.js";

export {
  toOpenAPIJSON,
  toOpenAPIYAML,
} from "./openApiSerialization/openApiSerializer.core.js";

export { OpenAPIManager } from "./openApiHttp/openApiHttpAdapter.core.js";

export type {
  OpenAPIVersion,
  OpenAPIDocument,
  OpenAPIComponents,
  OpenAPISecurityRequirement,
  OpenAPIParameterLocation,
  OpenAPIResponse,
  OpenAPIParameter,
  OpenAPIRequestBody,
  OpenAPIMediaType,
  OpenAPIEncoding,
  OpenAPIHeader,
  OpenAPILink,
  OpenAPIExample,
  OpenAPIPaths,
  OpenAPIPathItem,
  OpenAPIOperation,
  OpenAPIResponses,
  OpenAPIServer,
  OpenAPIServerVariable,
  OpenAPIInfo,
  OpenAPIContact,
  OpenAPILicense,
  OpenAPIExternalDocumentation,
  OpenAPISchema,
  OpenAPIDiscriminator,
  OpenAPIXml,
  OpenAPISecurityScheme,
  OpenAPIOAuthFlows,
  OpenAPIOAuthFlow,
  OpenAPITag,
  OpenAPIReference,
} from "./openApiTypes/openApiTypes.core.js";
