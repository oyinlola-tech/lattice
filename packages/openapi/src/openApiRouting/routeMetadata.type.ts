import type { OpenAPIOperation } from "../openApiTypes/openApiTypes.core.js";
import type { OpenAPIParameter } from "../openApiTypes/openApiTypes.core.js";
import type { OpenAPIRequestBody } from "../openApiTypes/openApiTypes.core.js";

/**
 * Metadata attached to a route for OpenAPI generation.
 */
export interface RouteOpenAPIMetadata {
  readonly operationId?: string;

  readonly summary?: string;

  readonly description?: string;

  readonly tags?: readonly string[];

  readonly deprecated?: boolean;

  readonly parameters?: readonly RouteParameterMetadata[];

  readonly requestBody?: OpenAPIRequestBody;

  readonly responses?: Record<string, unknown>;

  readonly security?: readonly Record<string, readonly string[]>[];

  readonly servers?: readonly {
    readonly url: string;
    readonly description?: string;
  }[];
}

/**
 * Parameter metadata for OpenAPI generation.
 */
export interface RouteParameterMetadata {
  readonly name: string;

  readonly in: "query" | "header" | "path" | "cookie";

  readonly description?: string;

  readonly required?: boolean;

  readonly deprecated?: boolean;

  readonly schema?: unknown;

  readonly example?: unknown;
}

/**
 * Route metadata container.
 */
export interface RouteMetadata {
  readonly openapi?: RouteOpenAPIMetadata;
}
