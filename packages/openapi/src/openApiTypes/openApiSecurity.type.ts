/**
 * OpenAPI security types.
 */

export interface OpenAPISecurityRequirement {
  readonly [key: string]: readonly string[];
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
