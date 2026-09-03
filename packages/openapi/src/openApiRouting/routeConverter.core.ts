import type { OpenAPIOperation } from "../openApiTypes/openApiTypes.core.js";
import type { RouteMetadata } from "./routeMetadata.type.js";

/**
 * Converts a Zudo-style route path to an OpenAPI path template.
 *
 * Example:
 *   "/users/:id" -> "/users/{id}"
 *   "/users/:id?": throws (optional path params not supported in OpenAPI)
 */
export function toOpenAPIPath(path: string): string {
  if (path.includes(":")) {
    const segments = path.split("/");
    const openApiSegments = segments.map((segment) => {
      if (segment.startsWith(":") && segment.endsWith("?")) {
        throw new Error(
          `Optional path parameter "${segment}" is not supported in OpenAPI. ` +
            `Use separate routes or a query parameter instead.`,
        );
      }
      if (segment.startsWith(":")) {
        return `{${segment.slice(1)}}`;
      }
      return segment;
    });

    return openApiSegments.join("/");
  }

  return path;
}

/**
 * Maps Zudo HTTP methods to OpenAPI methods.
 */
export const ZUDO_TO_OPENAPI_METHODS = [
  "get",
  "put",
  "post",
  "delete",
  "options",
  "head",
  "patch",
  "trace",
] as const;

/**
 * Converts a route with metadata into an OpenAPI operation.
 */
export function convertRouteToOpenAPI(
  method: string,
  path: string,
  metadata?: RouteMetadata,
): { method: string; path: string; operation: OpenAPIOperation } {
  const openApiPath = toOpenAPIPath(path);
  const openApiMetadata = metadata?.openapi;

  const operation: OpenAPIOperation = {
    responses: openApiMetadata?.responses
      ? {
          "200": {
            description: "OK",
            ...((openApiMetadata.responses["200"] as object) ?? {}),
          },
        }
      : { "200": { description: "OK" } },
    ...(openApiMetadata?.operationId
      ? { operationId: openApiMetadata.operationId }
      : {}),
    ...(openApiMetadata?.summary ? { summary: openApiMetadata.summary } : {}),
    ...(openApiMetadata?.description
      ? { description: openApiMetadata.description }
      : {}),
    ...(openApiMetadata?.tags?.length
      ? { tags: [...openApiMetadata.tags] }
      : {}),
    ...(openApiMetadata?.deprecated !== undefined
      ? { deprecated: openApiMetadata.deprecated }
      : {}),
    ...(openApiMetadata?.parameters?.length
      ? { parameters: [...openApiMetadata.parameters] }
      : {}),
    ...(openApiMetadata?.requestBody
      ? { requestBody: openApiMetadata.requestBody }
      : {}),
    ...(openApiMetadata?.security?.length
      ? { security: [...openApiMetadata.security] }
      : {}),
    ...(openApiMetadata?.servers?.length
      ? { servers: [...openApiMetadata.servers] }
      : {}),
  };

  return {
    method,
    path: openApiPath,
    operation,
  };
}
