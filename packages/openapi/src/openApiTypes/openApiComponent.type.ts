/**
 * OpenAPI component types (responses, request bodies, media types, etc.).
 */

import type { OpenAPIParameter } from "./openApiPath.type.js";

export interface OpenAPIComponents {
  readonly schemas?: Readonly<Record<string, import("./openApiSchema.type.js").OpenAPISchema>>;
  readonly responses?: Readonly<Record<string, OpenAPIResponse>>;
  readonly parameters?: Readonly<Record<string, OpenAPIParameter>>;
  readonly examples?: Readonly<Record<string, OpenAPIExample>>;
  readonly requestBodies?: Readonly<Record<string, OpenAPIRequestBody>>;
  readonly headers?: Readonly<Record<string, OpenAPIHeader>>;
  readonly securitySchemes?: Readonly<Record<string, import("./openApiSecurity.type.js").OpenAPISecurityScheme>>;
  readonly links?: Readonly<Record<string, OpenAPILink>>;
  readonly callbacks?: Readonly<Record<string, Readonly<Record<string, import("./openApiPath.type.js").OpenAPIPathItem>>>>;
}

export interface OpenAPIResponse {
  readonly description: string;
  readonly headers?: Readonly<Record<string, OpenAPIHeader>>;
  readonly content?: Readonly<Record<string, OpenAPIMediaType>>;
  readonly links?: Readonly<Record<string, OpenAPILink>>;
}

export type { OpenAPIParameter, OpenAPIParameterLocation } from "./openApiPath.type.js";

export interface OpenAPIRequestBody {
  readonly description?: string;
  readonly content: Readonly<Record<string, OpenAPIMediaType>>;
  readonly required?: boolean;
  readonly extensions?: Readonly<Record<string, unknown>>;
}

export interface OpenAPIMediaType {
  readonly schema?: unknown;
  readonly example?: unknown;
  readonly examples?: Readonly<Record<string, OpenAPIExample>>;
  readonly encoding?: Readonly<Record<string, OpenAPIEncoding>>;
  readonly extensions?: Readonly<Record<string, unknown>>;
}

export interface OpenAPIEncoding {
  readonly contentType?: string;
  readonly headers?: Readonly<Record<string, OpenAPIHeader>>;
  readonly style?: string;
  readonly explode?: boolean;
  readonly allowReserved?: boolean;
}

export interface OpenAPIHeader {
  readonly description?: string;
  readonly required?: boolean;
  readonly deprecated?: boolean;
  readonly style?: string;
  readonly explode?: boolean;
  readonly allowEmptyValue?: boolean;
  readonly schema?: unknown;
  readonly example?: unknown;
  readonly examples?: Readonly<Record<string, OpenAPIExample>>;
  readonly content?: Readonly<Record<string, OpenAPIMediaType>>;
}

export interface OpenAPILink {
  readonly operationId?: string;
  readonly parameters?: Readonly<Record<string, unknown>>;
  readonly requestBody?: unknown;
  readonly description?: string;
  readonly server?: import("./openApiDocument.type.js").OpenAPIServer;
  readonly expression?: string;
}

export interface OpenAPIExample {
  readonly summary?: string;
  readonly description?: string;
  readonly value?: unknown;
  readonly externalUrl?: string;
}
