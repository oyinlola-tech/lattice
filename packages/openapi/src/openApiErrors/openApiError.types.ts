/**
 * Specific OpenAPI error subclasses.
 */

import { OpenAPIError, type OpenAPIErrorOptions } from "./openApiError.base.js";

/** Error thrown when OpenAPI validation fails. */
export class OpenAPIValidationError extends OpenAPIError {
  constructor(message: string, issues?: readonly unknown[], options: OpenAPIErrorOptions = {}) {
    super(message, { ...options, code: options.code ?? "OPENAPI_VALIDATION", statusCode: 400, expose: true });
    this.name = "OpenAPIValidationError";
  }
}

/** Error thrown when the OpenAPI document is invalid. */
export class OpenAPIDocumentError extends OpenAPIError {
  constructor(message: string, options: OpenAPIErrorOptions = {}) {
    super(message, { ...options, code: options.code ?? "OPENAPI_DOCUMENT", statusCode: 500, expose: false });
    this.name = "OpenAPIDocumentError";
  }
}

/** Error thrown when an OpenAPI component is invalid. */
export class OpenAPIComponentError extends OpenAPIError {
  constructor(message: string, options: OpenAPIErrorOptions = {}) {
    super(message, { ...options, code: options.code ?? "OPENAPI_COMPONENT", statusCode: 500, expose: false });
    this.name = "OpenAPIComponentError";
  }
}

/** Error thrown when an OpenAPI component conflicts with an existing component. */
export class OpenAPIComponentConflictError extends OpenAPIError {
  constructor(message: string, options: OpenAPIErrorOptions = {}) {
    super(message, { ...options, code: options.code ?? "OPENAPI_COMPONENT_CONFLICT", statusCode: 409, expose: true });
    this.name = "OpenAPIComponentConflictError";
  }
}

/** Error thrown when an OpenAPI reference is invalid. */
export class OpenAPIReferenceError extends OpenAPIError {
  constructor(message: string, options: OpenAPIErrorOptions = {}) {
    super(message, { ...options, code: options.code ?? "OPENAPI_REFERENCE", statusCode: 400, expose: true });
    this.name = "OpenAPIReferenceError";
  }
}

/** Error thrown when an OpenAPI route is invalid. */
export class OpenAPIRouteError extends OpenAPIError {
  constructor(message: string, options: OpenAPIErrorOptions = {}) {
    super(message, { ...options, code: options.code ?? "OPENAPI_ROUTE", statusCode: 500, expose: false });
    this.name = "OpenAPIRouteError";
  }
}

/** Error thrown when an OpenAPI schema is invalid. */
export class OpenAPISchemaError extends OpenAPIError {
  constructor(message: string, options: OpenAPIErrorOptions = {}) {
    super(message, { ...options, code: options.code ?? "OPENAPI_SCHEMA", statusCode: 500, expose: false });
    this.name = "OpenAPISchemaError";
  }
}

/** Error thrown when OpenAPI serialization fails. */
export class OpenAPISerializationError extends OpenAPIError {
  constructor(message: string, options: OpenAPIErrorOptions = {}) {
    super(message, { ...options, code: options.code ?? "OPENAPI_SERIALIZATION", statusCode: 500, expose: false });
    this.name = "OpenAPISerializationError";
  }
}

/** Error thrown when the OpenAPI version is unsupported. */
export class OpenAPIVersionError extends OpenAPIError {
  constructor(message: string, options: OpenAPIErrorOptions = {}) {
    super(message, { ...options, code: options.code ?? "OPENAPI_VERSION", statusCode: 400, expose: true });
    this.name = "OpenAPIVersionError";
  }
}

/** Error thrown when an OpenAPI operation is invalid. */
export class OpenAPIOperationError extends OpenAPIError {
  constructor(message: string, options: OpenAPIErrorOptions = {}) {
    super(message, { ...options, code: options.code ?? "OPENAPI_OPERATION", statusCode: 500, expose: false });
    this.name = "OpenAPIOperationError";
  }
}

/** A single validation issue. */
export interface OpenAPIValidationIssue {
  readonly path: readonly (string | number)[];
  readonly message: string;
  readonly severity: "error" | "warning";
}
