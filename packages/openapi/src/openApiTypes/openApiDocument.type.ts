/**
 * OpenAPI document, info, and server types.
 */

/** Supported OpenAPI specification versions. */
export type OpenAPIVersion = "3.0.0" | "3.0.1" | "3.0.2" | "3.0.3" | "3.1.0" | "3.1.1";

/** The root OpenAPI document object. */
export interface OpenAPIDocument {
  readonly openapi: string;
  readonly info: OpenAPIInfo;
  readonly servers?: readonly OpenAPIServer[];
  readonly paths: import("./openApiPath.type.js").OpenAPIPaths;
  readonly components?: import("./openApiComponent.type.js").OpenAPIComponents;
  readonly security?: readonly import("./openApiSecurity.type.js").OpenAPISecurityRequirement[];
  readonly tags?: readonly OpenAPITag[];
  readonly externalDocs?: OpenAPIExternalDocumentation;
}

/** OpenAPI info object. */
export interface OpenAPIInfo {
  readonly title: string;
  readonly version: string;
  readonly description?: string;
  readonly summary?: string;
  readonly termsOfService?: string;
  readonly contact?: OpenAPIContact;
  readonly license?: OpenAPILicense;
}

export interface OpenAPIContact {
  readonly name?: string;
  readonly url?: string;
  readonly email?: string;
}

export interface OpenAPILicense {
  readonly name: string;
  readonly url?: string;
}

export interface OpenAPIServer {
  readonly url: string;
  readonly description?: string;
  readonly variables?: Readonly<Record<string, OpenAPIServerVariable>>;
}

export interface OpenAPIServerVariable {
  readonly enum?: readonly string[];
  readonly default: string;
  readonly description?: string;
}

export interface OpenAPIExternalDocumentation {
  readonly description?: string;
  readonly url: string;
}

export interface OpenAPITag {
  readonly name: string;
  readonly description?: string;
  readonly externalDocs?: OpenAPIExternalDocumentation;
  readonly extensions?: Readonly<Record<string, unknown>>;
}

export interface OpenAPIReference {
  readonly $ref: string;
  readonly summary?: string;
  readonly description?: string;
}
