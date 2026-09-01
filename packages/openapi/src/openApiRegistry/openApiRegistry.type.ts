import type { OpenAPIDocument } from "../openApiTypes/openApiTypes.core.js";
import type { OpenAPIPathItem } from "../openApiTypes/openApiTypes.core.js";
import type { OpenAPIOperation } from "../openApiTypes/openApiTypes.core.js";
import type { OpenAPIParameter } from "../openApiTypes/openApiTypes.core.js";
import type { OpenAPIRequestBody } from "../openApiTypes/openApiTypes.core.js";
import type { OpenAPISchema } from "../openApiTypes/openApiTypes.core.js";
import type { OpenAPISecurityScheme } from "../openApiTypes/openApiTypes.core.js";
import type { OpenAPITag } from "../openApiTypes/openApiTypes.core.js";
import type { OpenAPIReference } from "../openApiTypes/openApiTypes.core.js";
import {
  COMPONENT_REF_PREFIX,
  DEFAULT_OPENAPI_VERSION,
} from "../openApiConstants/openApiConstants.core.js";
import {
  OpenAPIComponentConflictError,
  OpenAPIDocumentError,
  OpenAPIOperationError,
} from "../openApiErrors/openApiError.core.js";

/**
 * A registered route in the OpenAPI registry.
 */
export interface OpenAPIRoute {
  readonly method:
    "get" | "put" | "post" | "delete" | "options" | "head" | "patch" | "trace";

  readonly path: string;

  readonly operation: OpenAPIOperation;
}

/**
 * Component registration entry.
 */
export interface OpenAPIComponentRegistration<T> {
  readonly name: string;

  readonly value: T;
}

/**
 * OpenAPI registry for collecting routes, schemas, and components.
 */
export interface OpenAPIRegistry {
  readonly version: string;

  registerRoute(route: OpenAPIRoute): void;

  registerSchema(name: string, schema: OpenAPISchema): void;

  registerResponse(name: string, response: unknown): void;

  registerParameter(name: string, parameter: OpenAPIParameter): void;

  registerRequestBody(name: string, body: OpenAPIRequestBody): void;

  registerHeader(name: string, header: unknown): void;

  registerExample(name: string, example: unknown): void;

  registerSecurityScheme(name: string, scheme: OpenAPISecurityScheme): void;

  registerTag(tag: OpenAPITag): void;

  ref(
    section:
      | "schemas"
      | "responses"
      | "parameters"
      | "requestBodies"
      | "headers"
      | "examples"
      | "securitySchemes"
      | "links"
      | "callbacks",
    name: string,
  ): OpenAPIReference;

  generate(): OpenAPIDocument;

  clear(): void;
}
