import { BaseError } from "@lattice/errors";
import type { BaseErrorOptions } from "@lattice/errors";
import type { ErrorMetadataValue } from "@lattice/errors";
import { ErrorCategory } from "@lattice/errors";
import { ErrorCode } from "@lattice/errors";
import { ErrorSeverity } from "@lattice/errors";

/**
 * Options for creating an OpenAPI error.
 */
export interface OpenAPIErrorOptions
  extends Omit<BaseErrorOptions, "category"> {
  readonly category?: ErrorCategory;
  readonly operationId?: string;
  readonly componentName?: string;
  readonly schemaName?: string;
}

/**
 * Base error for all OpenAPI failures.
 */
export class OpenAPIError extends BaseError {
  public readonly operationId?: string;

  public readonly componentName?: string;

  public readonly schemaName?: string;

  constructor(
    message: string,
    options: OpenAPIErrorOptions = {},
  ) {
    super(
      message,
      {
        ...options,
        code: options.code ?? ErrorCode.OPENAPI_ERROR,
        category: options.category ?? ErrorCategory.OPENAPI,
        severity: options.severity ?? ErrorSeverity.ERROR,
        statusCode: options.statusCode ?? 500,
        expose: options.expose ?? false,
        isOperational: options.isOperational ?? true,
      },
    );

    this.operationId = options.operationId;
    this.componentName = options.componentName;
    this.schemaName = options.schemaName;
  }

  public override toJSON() {
    return {
      ...super.toJSON(),
      ...(this.operationId !== undefined ? { operationId: this.operationId } : {}),
      ...(this.componentName !== undefined ? { componentName: this.componentName } : {}),
      ...(this.schemaName !== undefined ? { schemaName: this.schemaName } : {}),
    };
  }
}

/**
 * Creates an OpenAPI error.
 */
export function createOpenAPIError(
  message: string,
  options: OpenAPIErrorOptions = {},
): OpenAPIError {
  return new OpenAPIError(message, options);
}

/**
 * Determines whether an unknown value is an OpenAPIError.
 */
export function isOpenAPIError(
  value: unknown,
): value is OpenAPIError {
  return value instanceof OpenAPIError;
}

/**
 * Error thrown when OpenAPI validation fails.
 */
export class OpenAPIValidationError extends OpenAPIError {
  public readonly issues: readonly OpenAPIValidationIssue[];

  constructor(
    issues: readonly OpenAPIValidationIssue[],
    options: OpenAPIErrorOptions = {},
  ) {
    super(
      `OpenAPI validation failed with ${issues.length} issue(s).`,
      {
        ...options,
        code: ErrorCode.OPENAPI_VALIDATION,
        statusCode: 400,
        expose: true,
        metadata: { issues: issues.map((issue) => ({ ...issue })) } as Record<string, ErrorMetadataValue>,
      },
    );

    this.issues = issues;
    this.name = "OpenAPIValidationError";
  }
}

/**
 * Error thrown when an OpenAPI document is invalid.
 */
export class OpenAPIDocumentError extends OpenAPIError {
  constructor(
    message: string,
    options: OpenAPIErrorOptions = {},
  ) {
    super(message, {
      ...options,
      code: ErrorCode.OPENAPI_DOCUMENT,
      statusCode: 400,
      expose: true,
    });

    this.name = "OpenAPIDocumentError";
  }
}

/**
 * Error thrown when an OpenAPI component is invalid.
 */
export class OpenAPIComponentError extends OpenAPIError {
  constructor(
    message: string,
    componentName?: string,
    options: OpenAPIErrorOptions = {},
  ) {
    super(message, {
      ...options,
      code: ErrorCode.OPENAPI_COMPONENT,
      componentName,
      statusCode: 400,
      expose: true,
    });

    this.name = "OpenAPIComponentError";
  }
}

/**
 * Error thrown when an OpenAPI component name conflicts.
 */
export class OpenAPIComponentConflictError extends OpenAPIError {
  constructor(
    componentName: string,
    options: OpenAPIErrorOptions = {},
  ) {
    super(
      `Component "${componentName}" already exists.`,
      {
        ...options,
        code: ErrorCode.OPENAPI_COMPONENT_CONFLICT,
        componentName,
        statusCode: 409,
        expose: true,
      },
    );

    this.name = "OpenAPIComponentConflictError";
  }
}

/**
 * Error thrown when an OpenAPI reference is broken.
 */
export class OpenAPIReferenceError extends OpenAPIError {
  constructor(
    reference: string,
    options: OpenAPIErrorOptions = {},
  ) {
    super(
      `Broken OpenAPI reference: ${reference}.`,
      {
        ...options,
        code: ErrorCode.OPENAPI_REFERENCE,
        statusCode: 400,
        expose: true,
        metadata: { reference } as Record<string, ErrorMetadataValue>,
      },
    );

    this.name = "OpenAPIReferenceError";
  }
}

/**
 * Error thrown when an OpenAPI route is invalid.
 */
export class OpenAPIRouteError extends OpenAPIError {
  constructor(
    message: string,
    options: OpenAPIErrorOptions = {},
  ) {
    super(message, {
      ...options,
      code: ErrorCode.OPENAPI_ROUTE,
      statusCode: 400,
      expose: true,
    });

    this.name = "OpenAPIRouteError";
  }
}

/**
 * Error thrown when an OpenAPI schema conversion fails.
 */
export class OpenAPISchemaError extends OpenAPIError {
  constructor(
    message: string,
    schemaName?: string,
    options: OpenAPIErrorOptions = {},
  ) {
    super(message, {
      ...options,
      code: ErrorCode.OPENAPI_SCHEMA,
      schemaName,
      statusCode: 400,
      expose: true,
    });

    this.name = "OpenAPISchemaError";
  }
}

/**
 * Error thrown when OpenAPI serialization fails.
 */
export class OpenAPISerializationError extends OpenAPIError {
  constructor(
    message: string,
    options: OpenAPIErrorOptions = {},
  ) {
    super(message, {
      ...options,
      code: ErrorCode.OPENAPI_SERIALIZATION,
      statusCode: 500,
      expose: false,
    });

    this.name = "OpenAPISerializationError";
  }
}

/**
 * Error thrown when an unsupported OpenAPI version is requested.
 */
export class OpenAPIVersionError extends OpenAPIError {
  constructor(
    version: string,
    options: OpenAPIErrorOptions = {},
  ) {
    super(
      `Unsupported OpenAPI version: ${version}.`,
      {
        ...options,
        code: ErrorCode.OPENAPI_VERSION,
        statusCode: 400,
        expose: true,
        metadata: { version } as Record<string, ErrorMetadataValue>,
      },
    );

    this.name = "OpenAPIVersionError";
  }
}

/**
 * Error thrown when an OpenAPI operation is invalid.
 */
export class OpenAPIOperationError extends OpenAPIError {
  constructor(
    message: string,
    operationId?: string,
    options: OpenAPIErrorOptions = {},
  ) {
    super(message, {
      ...options,
      code: ErrorCode.OPENAPI_OPERATION,
      operationId,
      statusCode: 400,
      expose: true,
    });

    this.name = "OpenAPIOperationError";
  }
}

/**
 * Validation issue structure.
 */
export interface OpenAPIValidationIssue {
  readonly path: string;

  readonly message: string;

  readonly severity: "error" | "warning";
}
