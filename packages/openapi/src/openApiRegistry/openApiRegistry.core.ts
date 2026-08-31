import type { OpenAPIDocument } from "../openApiTypes/openApiTypes.core.js";
import type { OpenAPIPathItem } from "../openApiTypes/openApiTypes.core.js";
import type { OpenAPIOperation } from "../openApiTypes/openApiTypes.core.js";
import type { OpenAPIParameter } from "../openApiTypes/openApiTypes.core.js";
import type { OpenAPIRequestBody } from "../openApiTypes/openApiTypes.core.js";
import type { OpenAPISchema } from "../openApiTypes/openApiTypes.core.js";
import type { OpenAPISecurityScheme } from "../openApiTypes/openApiTypes.core.js";
import type { OpenAPITag } from "../openApiTypes/openApiTypes.core.js";
import type { OpenAPIReference } from "../openApiTypes/openApiTypes.core.js";
import type { OpenAPIVersion } from "../openApiTypes/openApiTypes.core.js";
import type { OpenAPIRoute, OpenAPIRegistry } from "./openApiRegistry.type.js";
import { COMPONENT_REF_PREFIX, DEFAULT_OPENAPI_VERSION } from "../openApiConstants/openApiConstants.core.js";
import {
  OpenAPIComponentConflictError,
  OpenAPIDocumentError,
  OpenAPIOperationError,
  OpenAPIVersionError,
} from "../openApiErrors/openApiError.core.js";

/**
 * Default OpenAPI registry implementation.
 */
export class OpenAPIRegistryImpl implements OpenAPIRegistry {
  public readonly version: string;

  private readonly routes: Map<string, OpenAPIRoute> = new Map();

  private readonly schemas: Map<string, OpenAPISchema> = new Map();

  private readonly responses: Map<string, unknown> = new Map();

  private readonly parameters: Map<string, OpenAPIParameter> = new Map();

  private readonly requestBodies: Map<string, OpenAPIRequestBody> = new Map();

  private readonly headers: Map<string, unknown> = new Map();

  private readonly examples: Map<string, unknown> = new Map();

  private readonly securitySchemes: Map<string, OpenAPISecurityScheme> = new Map();

  private readonly tags: Map<string, OpenAPITag> = new Map();

  private readonly links: Map<string, unknown> = new Map();

  private readonly callbacks: Map<string, unknown> = new Map();

  constructor(version: string = DEFAULT_OPENAPI_VERSION) {
    this.version = version;
  }

  public registerRoute(route: OpenAPIRoute): void {
    const key = this.routeKey(route.method, route.path);
    const operation: OpenAPIOperation = Object.freeze({
      ...route.operation,
      responses: Object.freeze({ ...route.operation.responses }),
    });

    if (this.routes.has(key)) {
      const existing = this.routes.get(key)!;
      throw new OpenAPIOperationError(
        `Duplicate operation for ${route.method.toUpperCase()} ${route.path}.`,
        existing.operation.operationId,
      );
    }

    this.routes.set(key, { ...route, operation });
  }

  public registerSchema(name: string, schema: OpenAPISchema): void {
    if (this.schemas.has(name)) {
      throw new OpenAPIComponentConflictError(`schemas/${name}`);
    }

    this.schemas.set(name, Object.freeze({ ...schema }));
  }

  public registerResponse(name: string, response: unknown): void {
    if (this.responses.has(name)) {
      throw new OpenAPIComponentConflictError(`responses/${name}`);
    }

    this.responses.set(name, Object.freeze({ ...(response as object) }));
  }

  public registerParameter(name: string, parameter: OpenAPIParameter): void {
    if (this.parameters.has(name)) {
      throw new OpenAPIComponentConflictError(`parameters/${name}`);
    }

    this.parameters.set(name, Object.freeze({ ...parameter }));
  }

  public registerRequestBody(name: string, body: OpenAPIRequestBody): void {
    if (this.requestBodies.has(name)) {
      throw new OpenAPIComponentConflictError(`requestBodies/${name}`);
    }

    this.requestBodies.set(name, Object.freeze({ ...body }));
  }

  public registerHeader(name: string, header: unknown): void {
    if (this.headers.has(name)) {
      throw new OpenAPIComponentConflictError(`headers/${name}`);
    }

    this.headers.set(name, Object.freeze({ ...(header as object) }));
  }

  public registerExample(name: string, example: unknown): void {
    if (this.examples.has(name)) {
      throw new OpenAPIComponentConflictError(`examples/${name}`);
    }

    this.examples.set(name, Object.freeze({ ...(example as object) }));
  }

  public registerSecurityScheme(name: string, scheme: OpenAPISecurityScheme): void {
    if (this.securitySchemes.has(name)) {
      throw new OpenAPIComponentConflictError(`securitySchemes/${name}`);
    }

    this.securitySchemes.set(name, Object.freeze({ ...scheme }));
  }

  public registerTag(tag: OpenAPITag): void {
    if (this.tags.has(tag.name)) {
      return;
    }

    this.tags.set(tag.name, Object.freeze({ ...tag }));
  }

  public ref(
    section: "schemas" | "responses" | "parameters" | "requestBodies" | "headers" | "examples" | "securitySchemes" | "links" | "callbacks",
    name: string,
  ): OpenAPIReference {
    return {
      $ref: `${COMPONENT_REF_PREFIX}/${section}/${name}`,
    };
  }

  public generate(): OpenAPIDocument {
    if (!this.isValidVersion(this.version)) {
      throw new OpenAPIVersionError(this.version);
    }

    const paths: Record<string, OpenAPIPathItem> = {};

    for (const [, route] of this.routes) {
      const operation: OpenAPIOperation = Object.freeze({
        ...route.operation,
        responses: Object.freeze({ ...route.operation.responses }),
      });

      const existing = paths[route.path] ?? {};
      const pathItem: OpenAPIPathItem = {
        ...existing,
        ...(route.method === "get" ? { get: operation } : {}),
        ...(route.method === "put" ? { put: operation } : {}),
        ...(route.method === "post" ? { post: operation } : {}),
        ...(route.method === "delete" ? { delete: operation } : {}),
        ...(route.method === "options" ? { options: operation } : {}),
        ...(route.method === "head" ? { head: operation } : {}),
        ...(route.method === "patch" ? { patch: operation } : {}),
        ...(route.method === "trace" ? { trace: operation } : {}),
        ...(route.operation.parameters?.length ? { parameters: Object.freeze([...route.operation.parameters]) } : {}),
      };

      paths[route.path] = Object.freeze(pathItem);
    }

    const components: Record<string, unknown> = {};

    if (this.schemas.size > 0) {
      components.schemas = Object.freeze(Object.fromEntries(this.schemas));
    }
    if (this.responses.size > 0) {
      components.responses = Object.freeze(Object.fromEntries(this.responses));
    }
    if (this.parameters.size > 0) {
      components.parameters = Object.freeze(Object.fromEntries(this.parameters));
    }
    if (this.requestBodies.size > 0) {
      components.requestBodies = Object.freeze(Object.fromEntries(this.requestBodies));
    }
    if (this.headers.size > 0) {
      components.headers = Object.freeze(Object.fromEntries(this.headers));
    }
    if (this.examples.size > 0) {
      components.examples = Object.freeze(Object.fromEntries(this.examples));
    }
    if (this.securitySchemes.size > 0) {
      components.securitySchemes = Object.freeze(Object.fromEntries(this.securitySchemes));
    }
    if (this.links.size > 0) {
      components.links = Object.freeze(Object.fromEntries(this.links));
    }
    if (this.callbacks.size > 0) {
      components.callbacks = Object.freeze(Object.fromEntries(this.callbacks));
    }

    try {
      return Object.freeze({
        openapi: this.version,
        info: {
          title: "Lattice API",
          version: "1.0.0",
        },
        paths: Object.freeze(paths),
        ...(Object.keys(components).length > 0 ? { components: Object.freeze(components) } : {}),
        ...(this.tags.size > 0 ? { tags: Object.freeze(Array.from(this.tags.values())) } : {}),
      }) as OpenAPIDocument;
    } catch (error) {
      throw new OpenAPIDocumentError(
        `Failed to generate OpenAPI document: ${(error as Error).message}`,
      );
    }
  }

  public clear(): void {
    this.routes.clear();
    this.schemas.clear();
    this.responses.clear();
    this.parameters.clear();
    this.requestBodies.clear();
    this.headers.clear();
    this.examples.clear();
    this.securitySchemes.clear();
    this.tags.clear();
    this.links.clear();
    this.callbacks.clear();
  }

  private routeKey(method: string, path: string): string {
    return `${method}:${path}`;
  }

  private isValidVersion(version: string): boolean {
    return [
      "3.0.0",
      "3.0.1",
      "3.0.2",
      "3.0.3",
      "3.1.0",
      "3.1.1",
    ].includes(version);
  }
}
