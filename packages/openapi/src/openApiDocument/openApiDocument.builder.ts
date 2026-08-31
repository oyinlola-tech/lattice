import type { OpenAPIDocument } from "../openApiTypes/openApiTypes.core.js";
import { DEFAULT_OPENAPI_VERSION } from "../openApiConstants/openApiConstants.core.js";
import { OpenAPIDocumentError } from "../openApiErrors/openApiError.core.js";

/**
 * Options for creating an OpenAPI document.
 */
export interface OpenAPIDocumentOptions {
  readonly info: {
    readonly title: string;
    readonly version: string;
    readonly description?: string;
    readonly summary?: string;
    readonly termsOfService?: string;
    readonly contact?: {
      readonly name?: string;
      readonly url?: string;
      readonly email?: string;
    };
    readonly license?: {
      readonly name: string;
      readonly url?: string;
    };
  };

  readonly openapi?: string;

  readonly servers?: readonly {
    readonly url: string;
    readonly description?: string;
    readonly variables?: Readonly<Record<string, { readonly enum?: readonly string[]; readonly default: string; readonly description?: string }>>;
  }[];

  readonly tags?: readonly {
    readonly name: string;
    readonly description?: string;
  }[];

  readonly security?: readonly Record<string, readonly string[]>[];
}

interface MutableDocument {
  openapi: string;
  info: {
    title: string;
    version: string;
    description?: string;
    summary?: string;
    termsOfService?: string;
    contact?: { name?: string; url?: string; email?: string };
    license?: { name: string; url?: string };
  };
  servers?: { url: string; description?: string; variables?: Record<string, { enum?: readonly string[]; default: string; description?: string }> }[];
  paths: Record<string, unknown>;
  components?: Record<string, unknown>;
  security?: Record<string, readonly string[]>[];
  tags?: { name: string; description?: string }[];
}

/**
 * Fluent builder for OpenAPI documents.
 */
export class OpenAPIDocumentBuilder {
  private readonly document: MutableDocument;

  constructor(options: {
    readonly info: {
      readonly title: string;
      readonly version: string;
      readonly description?: string;
      readonly summary?: string;
      readonly termsOfService?: string;
      readonly contact?: { readonly name?: string; readonly url?: string; readonly email?: string };
      readonly license?: { readonly name: string; readonly url?: string };
    };
    readonly openapi?: string;
    readonly servers?: readonly { readonly url: string; readonly description?: string; readonly variables?: Readonly<Record<string, { readonly enum?: readonly string[]; readonly default: string; readonly description?: string }>> }[];
    readonly tags?: readonly { readonly name: string; readonly description?: string }[];
    readonly security?: readonly Record<string, readonly string[]>[];
  }) {
    this.document = {
      openapi: options.openapi ?? DEFAULT_OPENAPI_VERSION,
      info: {
        title: options.info.title,
        version: options.info.version,
        description: options.info.description,
        summary: options.info.summary,
        termsOfService: options.info.termsOfService,
        contact: options.info.contact,
        license: options.info.license,
      },
      servers: options.servers?.map((s) => ({ ...s })),
      paths: {},
      components: {},
      security: options.security?.map((s) => ({ ...s })),
      tags: options.tags?.map((t) => ({ ...t })),
    };
  }

  public version(version: string): this {
    this.document.openapi = version;
    return this;
  }

  public addServer(server: {
    readonly url: string;
    readonly description?: string;
    readonly variables?: Readonly<Record<string, { readonly enum?: readonly string[]; readonly default: string; readonly description?: string }>>;
  }): this {
    this.document.servers = [...(this.document.servers ?? []), { ...server }];
    return this;
  }

  public addTag(tag: {
    readonly name: string;
    readonly description?: string;
  }): this {
    this.document.tags = [...(this.document.tags ?? []), { ...tag }];
    return this;
  }

  public addSecurity(security: Record<string, readonly string[]>): this {
    this.document.security = [...(this.document.security ?? []), { ...security }];
    return this;
  }

  public addPath(
    path: string,
    pathItem: Record<string, unknown>,
  ): this {
    this.document.paths[path] = pathItem;
    return this;
  }

  public addSchema(name: string, schema: unknown): this {
    const components = this.document.components ?? {};
    const schemas = { ...(components.schemas ?? {}), [name]: schema };
    this.document.components = { ...components, schemas };
    return this;
  }

  public addResponse(name: string, response: unknown): this {
    const components = this.document.components ?? {};
    const responses = { ...(components.responses ?? {}), [name]: response };
    this.document.components = { ...components, responses };
    return this;
  }

  public addParameter(name: string, parameter: unknown): this {
    const components = this.document.components ?? {};
    const parameters = { ...(components.parameters ?? {}), [name]: parameter };
    this.document.components = { ...components, parameters };
    return this;
  }

  public addSecurityScheme(name: string, scheme: unknown): this {
    const components = this.document.components ?? {};
    const securitySchemes = { ...(components.securitySchemes ?? {}), [name]: scheme };
    this.document.components = { ...components, securitySchemes };
    return this;
  }

  public build(): Readonly<OpenAPIDocument> {
    const paths = Object.keys(this.document.paths).length === 0
      ? {}
      : (this.document.paths as OpenAPIDocument["paths"]);

    const components: Record<string, unknown> = {};

    if (this.document.components) {
      for (const [key, value] of Object.entries(this.document.components)) {
        if (value && typeof value === "object" && Object.keys(value).length > 0) {
          components[key] = Object.freeze({ ...(value as object) });
        }
      }
    }

    return Object.freeze({
      openapi: this.document.openapi,
      info: Object.freeze(this.document.info) as OpenAPIDocument["info"],
      servers: this.document.servers?.length ? Object.freeze(this.document.servers) : undefined,
      paths: Object.freeze(paths) as OpenAPIDocument["paths"],
      ...(Object.keys(components).length > 0 ? { components: Object.freeze(components) } : {}),
      security: this.document.security?.length ? Object.freeze(this.document.security) : undefined,
      tags: this.document.tags?.length ? Object.freeze(this.document.tags) : undefined,
    }) as Readonly<OpenAPIDocument>;
  }
}
