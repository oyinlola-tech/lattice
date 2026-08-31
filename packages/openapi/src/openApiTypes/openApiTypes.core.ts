/**
 * @lattice/openapi/openApiTypes
 *
 * All OpenAPI specification types in one module to avoid circular dependencies.
 */

/**
 * Supported OpenAPI specification versions.
 */
export type OpenAPIVersion =
  | "3.0.0"
  | "3.0.1"
  | "3.0.2"
  | "3.0.3"
  | "3.1.0"
  | "3.1.1";

/**
 * The root OpenAPI document object.
 */
export interface OpenAPIDocument {
  readonly openapi: string;

  readonly info: OpenAPIInfo;

  readonly servers?: readonly OpenAPIServer[];

  readonly paths: OpenAPIPaths;

  readonly components?: OpenAPIComponents;

  readonly security?: readonly OpenAPISecurityRequirement[];

  readonly tags?: readonly OpenAPITag[];

  readonly externalDocs?: OpenAPIExternalDocumentation;
}

/**
 * Reusable component schemas, responses, parameters, etc.
 */
export interface OpenAPIComponents {
  readonly schemas?: Readonly<Record<string, OpenAPISchema>>;

  readonly responses?: Readonly<Record<string, OpenAPIResponse>>;

  readonly parameters?: Readonly<Record<string, OpenAPIParameter>>;

  readonly examples?: Readonly<Record<string, OpenAPIExample>>;

  readonly requestBodies?: Readonly<Record<string, OpenAPIRequestBody>>;

  readonly headers?: Readonly<Record<string, OpenAPIHeader>>;

  readonly securitySchemes?: Readonly<Record<string, OpenAPISecurityScheme>>;

  readonly links?: Readonly<Record<string, OpenAPILink>>;

  readonly callbacks?: Readonly<Record<string, Readonly<Record<string, OpenAPIPathItem>>>>;
}

export interface OpenAPISecurityRequirement {
  readonly [key: string]: readonly string[];
}

export interface OpenAPIResponse {
  readonly description: string;

  readonly headers?: Readonly<Record<string, OpenAPIHeader>>;

  readonly content?: Readonly<Record<string, OpenAPIMediaType>>;

  readonly links?: Readonly<Record<string, OpenAPILink>>;
}

export interface OpenAPIParameter {
  readonly name: string;

  readonly in: OpenAPIParameterLocation;

  readonly description?: string;

  readonly required?: boolean;

  readonly deprecated?: boolean;

  readonly allowEmptyValue?: boolean;

  readonly schema?: unknown;

  readonly example?: unknown;

  readonly examples?: Readonly<Record<string, OpenAPIExample>>;

  readonly content?: Readonly<Record<string, OpenAPIMediaType>>;
}

export type OpenAPIParameterLocation = "query" | "header" | "path" | "cookie";

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

  readonly server?: OpenAPIServer;

  readonly expression?: string;
}

export interface OpenAPIExample {
  readonly summary?: string;

  readonly description?: string;

  readonly value?: unknown;

  readonly externalUrl?: string;
}

export type OpenAPIPaths = Readonly<
  Record<string, OpenAPIPathItem | undefined>
>;

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

  readonly servers?: readonly OpenAPIServer[];

  readonly $ref?: string;
}

export interface OpenAPIOperation {
  readonly tags?: readonly string[];

  readonly summary?: string;

  readonly description?: string;

  readonly operationId?: string;

  readonly parameters?: readonly OpenAPIParameter[];

  readonly requestBody?: OpenAPIRequestBody;

  readonly responses: OpenAPIResponses;

  readonly callbacks?: Readonly<Record<string, Readonly<Record<string, OpenAPIPathItem>>>>;

  readonly deprecated?: boolean;

  readonly security?: readonly OpenAPISecurityRequirement[];

  readonly servers?: readonly OpenAPIServer[];

  readonly externalDocs?: OpenAPIExternalDocumentation;
}

export type OpenAPIResponses = Readonly<
  Record<string, OpenAPIResponse>
>;

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

export interface OpenAPIExternalDocumentation {
  readonly description?: string;

  readonly url: string;
}

export interface OpenAPISchema {
  readonly title?: string;

  readonly type?: string;

  readonly properties?: Readonly<Record<string, OpenAPISchema>>;

  readonly required?: readonly string[];

  readonly description?: string;

  readonly format?: string;

  readonly default?: unknown;

  readonly nullable?: boolean;

  readonly readOnly?: boolean;

  readonly writeOnly?: boolean;

  readonly deprecated?: boolean;

  readonly example?: unknown;

  readonly enum?: readonly unknown[];

  readonly $ref?: string;

  readonly allOf?: readonly OpenAPISchema[];

  readonly oneOf?: readonly OpenAPISchema[];

  readonly anyOf?: readonly OpenAPISchema[];

  readonly items?: OpenAPISchema;

  readonly additionalProperties?: OpenAPISchema | boolean;

  readonly discriminator?: OpenAPIDiscriminator;

  readonly xml?: OpenAPIXml;

  readonly extensions?: Readonly<Record<string, unknown>>;
}

export interface OpenAPIDiscriminator {
  readonly propertyName: string;

  readonly mapping?: Readonly<Record<string, string>>;

  readonly oneOf?: readonly OpenAPISchema[];
}

export interface OpenAPIXml {
  readonly name?: string;

  readonly namespace?: string;

  readonly prefix?: string;

  readonly attribute?: boolean;

  readonly wrapped?: boolean;
}

export interface OpenAPISecurityScheme {
  readonly type: "apiKey" | "http" | "mutualTLS" | "oauth2" | "openIdConnect";

  readonly description?: string;

  readonly name?: string;

  readonly in?: "query" | "header" | "cookie";

  readonly scheme?: string;

  readonly bearerFormat?: string;

  readonly flows?: OpenAPIOAuthFlows;

  readonly openIdConnectUrl?: string;
}

export interface OpenAPIOAuthFlows {
  readonly implicit?: OpenAPIOAuthFlow;

  readonly password?: OpenAPIOAuthFlow;

  readonly clientCredentials?: OpenAPIOAuthFlow;

  readonly authorizationCode?: OpenAPIOAuthFlow;
}

export interface OpenAPIOAuthFlow {
  readonly authorizationUrl?: string;

  readonly tokenUrl?: string;

  readonly refreshUrl?: string;

  readonly scopes?: Readonly<Record<string, string>>;
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
