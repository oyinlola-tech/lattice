import type { OpenAPIRoute } from "../openApiRegistry/openApiRegistry.type.js";
import type { OpenAPIOperation } from "../openApiTypes/openApiTypes.core.js";
import { toOpenAPIPath } from "./routeConverter.core.js";

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

  readonly requestBody?: unknown;

  readonly responses?: Record<string, unknown>;

  readonly security?: readonly Record<string, readonly string[]>[];

  readonly servers?: readonly { readonly url: string; readonly description?: string }[];
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

/**
 * Route information for scanning.
 */
export interface RouteInfo {
  readonly method: "get" | "put" | "post" | "delete" | "options" | "head" | "patch" | "trace";

  readonly path: string;

  readonly metadata?: {
    readonly openapi?: RouteOpenAPIMetadata;
  };
}

/**
 * Default OpenAPI route scanner implementation.
 */
export class OpenAPIRouteScannerImpl {
  private readonly routes: RouteInfo[] = [];

  public addRoute(route: RouteInfo): void {
    this.routes.push(route);
  }

  public scan(): readonly OpenAPIRoute[] {
    const result: OpenAPIRoute[] = [];

    for (const route of this.routes) {
      const openApiPath = toOpenAPIPath(route.path);

      const response200: OpenAPIOperation["responses"] = {
        "200": {
          description: "OK",
          ...(route.metadata?.openapi?.responses?.["200"]
            ? (route.metadata.openapi.responses["200"] as { description?: string })
            : {}),
        },
      };

      const operation: OpenAPIOperation = {
        ...(route.metadata?.openapi?.operationId ? { operationId: route.metadata.openapi.operationId } : {}),
        ...(route.metadata?.openapi?.summary ? { summary: route.metadata.openapi.summary } : {}),
        ...(route.metadata?.openapi?.description ? { description: route.metadata.openapi.description } : {}),
        ...(route.metadata?.openapi?.tags?.length ? { tags: [...route.metadata.openapi.tags] } : {}),
        ...(route.metadata?.openapi?.deprecated !== undefined ? { deprecated: route.metadata.openapi.deprecated } : {}),
        ...(route.metadata?.openapi?.parameters?.length ? { parameters: [...route.metadata.openapi.parameters] as OpenAPIOperation["parameters"] } : {}),
        ...(route.metadata?.openapi?.requestBody ? { requestBody: route.metadata.openapi.requestBody as OpenAPIOperation["requestBody"] } : {}),
        ...(route.metadata?.openapi?.security?.length ? { security: [...route.metadata.openapi.security] } : {}),
        ...(route.metadata?.openapi?.servers?.length ? { servers: [...route.metadata.openapi.servers] } : {}),
        responses: response200,
      };

      result.push({
        method: route.method,
        path: openApiPath,
        operation: operation as OpenAPIRoute["operation"],
      });
    }

    return result;
  }

  public clear(): void {
    this.routes.length = 0;
  }
}
