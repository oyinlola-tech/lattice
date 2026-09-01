import type {
  OpenAPIDocument,
  OpenAPIPathItem,
  OpenAPIOperation,
  OpenAPIParameter,
  OpenAPIRequestBody,
  OpenAPISchema,
  OpenAPISecurityScheme,
  OpenAPITag,
  OpenAPIReference,
  OpenAPIVersion,
} from "../openApiTypes/openApiTypes.core.js";
import type { OpenAPIRoute, OpenAPIRegistry } from "./openApiRegistry.type.js";
import {
  COMPONENT_REF_PREFIX,
  DEFAULT_OPENAPI_VERSION,
} from "../openApiConstants/openApiConstants.core.js";
import {
  OpenAPIComponentConflictError,
  OpenAPIDocumentError,
  OpenAPIOperationError,
  OpenAPIVersionError,
} from "../openApiErrors/openApiError.core.js";

/** Default OpenAPI registry implementation. */
export class OpenAPIRegistryImpl implements OpenAPIRegistry {
  public readonly version: string;
  private readonly routes = new Map<string, OpenAPIRoute>();
  private readonly schemas = new Map<string, OpenAPISchema>();
  private readonly responses = new Map<string, unknown>();
  private readonly parameters = new Map<string, OpenAPIParameter>();
  private readonly requestBodies = new Map<string, OpenAPIRequestBody>();
  private readonly headers = new Map<string, unknown>();
  private readonly examples = new Map<string, unknown>();
  private readonly securitySchemes = new Map<string, OpenAPISecurityScheme>();
  private readonly tags = new Map<string, OpenAPITag>();
  private readonly links = new Map<string, unknown>();
  private readonly callbacks = new Map<string, unknown>();

  constructor(version: string = DEFAULT_OPENAPI_VERSION) {
    this.version = version;
  }

  public registerRoute(route: OpenAPIRoute): void {
    const key = `${route.method}:${route.path}`;
    const existing = this.routes.get(key);
    if (existing)
      throw new OpenAPIOperationError(
        `Duplicate operation for ${route.method.toUpperCase()} ${route.path}: ${existing.operation.operationId ?? "unknown"}.`,
      );
    this.routes.set(key, {
      ...route,
      operation: Object.freeze({
        ...route.operation,
        responses: Object.freeze({ ...route.operation.responses }),
      }),
    });
  }

  public registerSchema(name: string, schema: OpenAPISchema): void {
    if (this.schemas.has(name))
      throw new OpenAPIComponentConflictError(`schemas/${name}`);
    this.schemas.set(name, Object.freeze({ ...schema }));
  }

  public registerResponse(name: string, response: unknown): void {
    if (this.responses.has(name))
      throw new OpenAPIComponentConflictError(`responses/${name}`);
    this.responses.set(name, Object.freeze({ ...(response as object) }));
  }

  public registerParameter(name: string, parameter: OpenAPIParameter): void {
    if (this.parameters.has(name))
      throw new OpenAPIComponentConflictError(`parameters/${name}`);
    this.parameters.set(name, Object.freeze({ ...parameter }));
  }

  public registerRequestBody(name: string, body: OpenAPIRequestBody): void {
    if (this.requestBodies.has(name))
      throw new OpenAPIComponentConflictError(`requestBodies/${name}`);
    this.requestBodies.set(name, Object.freeze({ ...body }));
  }

  public registerHeader(name: string, header: unknown): void {
    if (this.headers.has(name))
      throw new OpenAPIComponentConflictError(`headers/${name}`);
    this.headers.set(name, Object.freeze({ ...(header as object) }));
  }

  public registerExample(name: string, example: unknown): void {
    if (this.examples.has(name))
      throw new OpenAPIComponentConflictError(`examples/${name}`);
    this.examples.set(name, Object.freeze({ ...(example as object) }));
  }

  public registerSecurityScheme(
    name: string,
    scheme: OpenAPISecurityScheme,
  ): void {
    if (this.securitySchemes.has(name))
      throw new OpenAPIComponentConflictError(`securitySchemes/${name}`);
    this.securitySchemes.set(name, Object.freeze({ ...scheme }));
  }

  public registerTag(tag: OpenAPITag): void {
    if (!this.tags.has(tag.name))
      this.tags.set(tag.name, Object.freeze({ ...tag }));
  }

  public ref(
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
  ): OpenAPIReference {
    return { $ref: `${COMPONENT_REF_PREFIX}/${section}/${name}` };
  }

  public generate(): OpenAPIDocument {
    if (
      !["3.0.0", "3.0.1", "3.0.2", "3.0.3", "3.1.0", "3.1.1"].includes(
        this.version,
      )
    )
      throw new OpenAPIVersionError(this.version);

    const paths: Record<string, OpenAPIPathItem> = {};
    for (const [, route] of this.routes) {
      const operation: OpenAPIOperation = Object.freeze({
        ...route.operation,
        responses: Object.freeze({ ...route.operation.responses }),
      });
      const existing = paths[route.path] ?? {};
      paths[route.path] = Object.freeze({
        ...existing,
        ...(route.method === "get" ? { get: operation } : {}),
        ...(route.method === "put" ? { put: operation } : {}),
        ...(route.method === "post" ? { post: operation } : {}),
        ...(route.method === "delete" ? { delete: operation } : {}),
        ...(route.method === "options" ? { options: operation } : {}),
        ...(route.method === "head" ? { head: operation } : {}),
        ...(route.method === "patch" ? { patch: operation } : {}),
        ...(route.method === "trace" ? { trace: operation } : {}),
        ...(route.operation.parameters?.length
          ? { parameters: Object.freeze([...route.operation.parameters]) }
          : {}),
      });
    }

    const components: Record<string, unknown> = {};
    const componentMaps: Array<[string, Map<string, unknown>]> = [
      ["schemas", this.schemas as Map<string, unknown>],
      ["responses", this.responses],
      ["parameters", this.parameters as Map<string, unknown>],
      ["requestBodies", this.requestBodies as Map<string, unknown>],
      ["headers", this.headers],
      ["examples", this.examples],
      ["securitySchemes", this.securitySchemes as Map<string, unknown>],
      ["links", this.links],
      ["callbacks", this.callbacks],
    ];
    for (const [key, map] of componentMaps) {
      if (map.size > 0)
        components[key] = Object.freeze(Object.fromEntries(map));
    }

    try {
      return Object.freeze({
        openapi: this.version,
        info: { title: "Lattice API", version: "1.0.0" },
        paths: Object.freeze(paths),
        ...(Object.keys(components).length > 0
          ? { components: Object.freeze(components) }
          : {}),
        ...(this.tags.size > 0
          ? { tags: Object.freeze(Array.from(this.tags.values())) }
          : {}),
      }) as OpenAPIDocument;
    } catch (error) {
      throw new OpenAPIDocumentError(
        `Failed to generate OpenAPI document: ${(error as Error).message}`,
      );
    }
  }

  public clear(): void {
    for (const map of [
      this.routes,
      this.schemas,
      this.responses,
      this.parameters,
      this.requestBodies,
      this.headers,
      this.examples,
      this.securitySchemes,
      this.tags,
      this.links,
      this.callbacks,
    ])
      map.clear();
  }
}
