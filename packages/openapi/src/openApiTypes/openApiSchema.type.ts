/**
 * OpenAPI schema types.
 */

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
