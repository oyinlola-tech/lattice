/**
 * OpenAPI path, operation, and parameter types.
 */

export type OpenAPIPaths = Readonly<Record<string, OpenAPIPathItem | undefined>>;

export interface OpenAPIPathItem {
  readonly summary?: string;
  readonly description?: string;
  readonly get?: OpenAPIOperation;
  readonly put?: OpenAPIOperation;
  readonly post?: OpenAPIOperation;
  readonly delete?: OpenAPIOperation;
  readonly options?: OpenAPIOperation;
  readonly head?: OpenAPIOperation;
  readonly patch?: OpenAPIOperation;
  readonly trace?: OpenAPIOperation;
  readonly parameters?: readonly OpenAPIParameter[];
  readonly servers?: readonly import("./openApiDocument.type.js").OpenAPIServer[];
  readonly $ref?: string;
}

export interface OpenAPIOperation {
  readonly tags?: readonly string[];
  readonly summary?: string;
  readonly description?: string;
  readonly operationId?: string;
  readonly parameters?: readonly OpenAPIParameter[];
  readonly requestBody?: import("./openApiComponent.type.js").OpenAPIRequestBody;
  readonly responses: OpenAPIResponses;
  readonly callbacks?: Readonly<Record<string, Readonly<Record<string, OpenAPIPathItem>>>>;
  readonly deprecated?: boolean;
  readonly security?: readonly import("./openApiSecurity.type.js").OpenAPISecurityRequirement[];
  readonly servers?: readonly import("./openApiDocument.type.js").OpenAPIServer[];
  readonly externalDocs?: import("./openApiDocument.type.js").OpenAPIExternalDocumentation;
}

export type OpenAPIResponses = Readonly<Record<string, import("./openApiComponent.type.js").OpenAPIResponse>>;

export interface OpenAPIParameter {
  readonly name: string;
  readonly in: OpenAPIParameterLocation;
  readonly description?: string;
  readonly required?: boolean;
  readonly deprecated?: boolean;
  readonly allowEmptyValue?: boolean;
  readonly schema?: unknown;
  readonly example?: unknown;
  readonly examples?: Readonly<Record<string, import("./openApiComponent.type.js").OpenAPIExample>>;
  readonly content?: Readonly<Record<string, import("./openApiComponent.type.js").OpenAPIMediaType>>;
}

export type OpenAPIParameterLocation = "query" | "header" | "path" | "cookie";
