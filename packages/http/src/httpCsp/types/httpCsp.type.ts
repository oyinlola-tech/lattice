/**
 * CSP type definitions.
 */

export type CSPDirectiveValue =
  | string
  | readonly string[];

export interface CSPDirectives {
  readonly [directive: string]: readonly string[];
}

export interface CSPOptions {
  readonly directives?:
    | Readonly<
        Record<
          string,
          CSPDirectiveValue
        >
      >;
  readonly defaultSrc?: CSPDirectiveValue;
  readonly scriptSrc?: CSPDirectiveValue;
  readonly styleSrc?: CSPDirectiveValue;
  readonly imgSrc?: CSPDirectiveValue;
  readonly fontSrc?: CSPDirectiveValue;
  readonly connectSrc?: CSPDirectiveValue;
  readonly mediaSrc?: CSPDirectiveValue;
  readonly objectSrc?: CSPDirectiveValue;
  readonly frameSrc?: CSPDirectiveValue;
  readonly childSrc?: CSPDirectiveValue;
  readonly workerSrc?: CSPDirectiveValue;
  readonly manifestSrc?: CSPDirectiveValue;
  readonly baseUri?: CSPDirectiveValue;
  readonly formAction?: CSPDirectiveValue;
  readonly frameAncestors?: CSPDirectiveValue;
  readonly navigateTo?: CSPDirectiveValue;
  readonly reportUri?: CSPDirectiveValue;
  readonly reportTo?: CSPDirectiveValue;
  readonly sandbox?: CSPDirectiveValue;
  readonly upgradeInsecureRequests?: boolean;
  readonly blockAllMixedContent?: boolean;
  readonly requireTrustedTypesFor?: CSPDirectiveValue;
  readonly trustedTypes?: CSPDirectiveValue;
}

export interface CSPNonceOptions {
  readonly length?: number;
  readonly encoding?: "base64" | "base64url";
}

export interface CSPResult {
  readonly policy: string;
  readonly header: string;
  readonly directives: CSPDirectives;
}
