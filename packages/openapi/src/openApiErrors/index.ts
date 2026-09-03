/**
 * @zudolib/openapi/openApiErrors
 *
 * OpenAPI-specific error classes.
 */

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
} from "./openApiError.core.js";

export type {
  OpenAPIErrorOptions,
  OpenAPIValidationIssue,
} from "./openApiError.core.js";
