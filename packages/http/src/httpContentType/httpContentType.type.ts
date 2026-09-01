/**
 * HTTP Content-Type type definitions.
 */

export interface ContentType {
  readonly type: string;
  readonly subtype: string;
  readonly parameters: Readonly<Record<string, string>>;
}

export interface ContentTypeParameter {
  readonly name: string;
  readonly value: string;
}

export interface ContentTypeMatchOptions {
  readonly allowWildcard?: boolean;
  readonly ignoreParameters?: boolean;
}
