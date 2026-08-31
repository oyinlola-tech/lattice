/**
 * HTTP CORS utilities.
 *
 * Provides parsing, validation, policy evaluation, and response-header
 * generation for Cross-Origin Resource Sharing.
 */

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type CorsOrigin =
  | string
  | readonly string[]
  | ((origin: string) => boolean | Promise<boolean>);

export type CorsMethods =
  | string
  | readonly string[];

export type CorsHeaders =
  | string
  | readonly string[];

export interface CorsOptions {
  readonly origin?: CorsOrigin;
  readonly methods?: CorsMethods;
  readonly allowedHeaders?: CorsHeaders;
  readonly exposedHeaders?: CorsHeaders;
  readonly credentials?: boolean;
  readonly maxAge?: number;
  readonly preflightContinue?: boolean;
  readonly optionsSuccessStatus?: number;
}

export interface CorsRequest {
  readonly origin?: string;
  readonly method?: string;
  readonly requestMethod?: string;
  readonly requestHeaders?: string;
}

export interface CorsResult {
  readonly allowed: boolean;
  readonly headers: Readonly<
    Record<string, string>
  >;
  readonly preflight: boolean;
  readonly vary: readonly string[];
}

export interface CorsPolicy {
  readonly origin: CorsOrigin;
  readonly methods: readonly string[];
  readonly allowedHeaders: readonly string[];
  readonly exposedHeaders: readonly string[];
  readonly credentials: boolean;
  readonly maxAge?: number;
}

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

export const CORS_ORIGIN_HEADER =
  "Access-Control-Allow-Origin";

export const CORS_METHODS_HEADER =
  "Access-Control-Allow-Methods";

export const CORS_HEADERS_HEADER =
  "Access-Control-Allow-Headers";

export const CORS_EXPOSE_HEADERS_HEADER =
  "Access-Control-Expose-Headers";

export const CORS_CREDENTIALS_HEADER =
  "Access-Control-Allow-Credentials";

export const CORS_MAX_AGE_HEADER =
  "Access-Control-Max-Age";

export const CORS_REQUEST_METHOD_HEADER =
  "Access-Control-Request-Method";

export const CORS_REQUEST_HEADERS_HEADER =
  "Access-Control-Request-Headers";

export const CORS_VARY_HEADER =
  "Vary";

export const DEFAULT_CORS_METHODS =
  Object.freeze([
    "GET",
    "HEAD",
    "PUT",
    "PATCH",
    "POST",
    "DELETE",
  ]);

export const DEFAULT_OPTIONS_SUCCESS_STATUS =
  204;

/* -------------------------------------------------------------------------- */
/* Origin                                                                     */
/* -------------------------------------------------------------------------- */

export function normalizeOrigin(
  origin:
    | string
    | undefined
    | null,
): string | undefined {
  if (
    origin === undefined ||
    origin === null
  ) {
    return undefined;
  }

  const value =
    origin.trim();

  if (
    value.length === 0
  ) {
    return undefined;
  }

  return value;
}

export function isWildcardOrigin(
  origin:
    | string
    | undefined
    | null,
): boolean {
  return (
    normalizeOrigin(
      origin,
    ) === "*"
  );
}

export function isNullOrigin(
  origin:
    | string
    | undefined
    | null,
): boolean {
  return (
    normalizeOrigin(
      origin,
    ) === "null"
  );
}

export function isValidOrigin(
  origin:
    | string
    | undefined
    | null,
): boolean {
  const normalized =
    normalizeOrigin(
      origin,
    );

  if (
    !normalized
  ) {
    return false;
  }

  if (
    normalized === "*" ||
    normalized === "null"
  ) {
    return true;
  }

  try {
    const url =
      new URL(
        normalized,
      );

    return (
      url.protocol ===
        "http:" ||
      url.protocol ===
        "https:"
    );
  } catch {
    return false;
  }
}

/* -------------------------------------------------------------------------- */
/* Methods                                                                    */
/* -------------------------------------------------------------------------- */

export function normalizeMethods(
  methods:
    | CorsMethods
    | undefined,
): readonly string[] {
  if (
    methods === undefined
  ) {
    return DEFAULT_CORS_METHODS;
  }

  const values =
    typeof methods ===
    "string"
      ? splitHeaderList(
          methods,
        )
      : methods;

  return uniqueCaseInsensitive(
    values
      .map(
        (method) =>
          method.trim().toUpperCase(),
      )
      .filter(Boolean),
  );
}

export function isMethodAllowed(
  method:
    | string
    | undefined
    | null,
  allowedMethods:
    | CorsMethods,
): boolean {
  if (
    !method
  ) {
    return false;
  }

  const normalized =
    method
      .trim()
      .toUpperCase();

  return normalizeMethods(
    allowedMethods,
  ).some(
    (allowed) =>
      allowed ===
      normalized,
  );
}

/* -------------------------------------------------------------------------- */
/* Headers                                                                    */
/* -------------------------------------------------------------------------- */

export function normalizeHeaderNames(
  headers:
    | CorsHeaders
    | undefined,
): readonly string[] {
  if (
    headers === undefined
  ) {
    return [];
  }

  const values =
    typeof headers ===
    "string"
      ? splitHeaderList(
          headers,
        )
      : headers;

  return uniqueCaseInsensitive(
    values
      .map(
        (header) =>
          header.trim().toLowerCase(),
      )
      .filter(Boolean),
  );
}

export function areHeadersAllowed(
  requestedHeaders:
    | CorsHeaders
    | undefined,
  allowedHeaders:
    | CorsHeaders,
): boolean {
  const requested =
    normalizeHeaderNames(
      requestedHeaders,
    );

  if (
    requested.length ===
      0
  ) {
    return true;
  }

  const allowed =
    normalizeHeaderNames(
      allowedHeaders,
    );

  if (
    allowed.includes("*")
  ) {
    return true;
  }

  return requested.every(
    (header) =>
      allowed.includes(
        header,
      ),
  );
}

export function parseRequestedHeaders(
  value:
    | string
    | undefined
    | null,
): readonly string[] {
  return normalizeHeaderNames(
    value ??
      undefined,
  );
}

/* -------------------------------------------------------------------------- */
/* Origin Matching                                                            */
/* -------------------------------------------------------------------------- */

export async function matchesOrigin(
  configured:
    | CorsOrigin
    | undefined,
  requestOrigin:
    | string
    | undefined,
): Promise<boolean> {
  if (
    !requestOrigin
  ) {
    return false;
  }

  const origin =
    normalizeOrigin(
      requestOrigin,
    );

  if (
    !origin
  ) {
    return false;
  }

  if (
    configured ===
      undefined
  ) {
    return false;
  }

  if (
    typeof configured ===
    "function"
  ) {
    return Boolean(
      await configured(
        origin,
      ),
    );
  }

  if (
    typeof configured ===
    "string"
  ) {
    const configuredOrigin =
      configured.trim();

    if (
      configuredOrigin ===
      "*"
    ) {
      return true;
    }

    return (
      configuredOrigin ===
      origin
    );
  }

  return configured.some(
    (allowedOrigin) =>
      allowedOrigin ===
      "*" ||
      allowedOrigin ===
      origin,
  );
}

/* -------------------------------------------------------------------------- */
/* Policy                                                                     */
/* -------------------------------------------------------------------------- */

export function createCorsPolicy(
  options:
    | CorsOptions
    | undefined = {},
): CorsPolicy {
  const origin =
    options.origin ??
    "*";

  const methods =
    normalizeMethods(
      options.methods,
    );

  const allowedHeaders =
    normalizeHeaderNames(
      options.allowedHeaders,
    );

  const exposedHeaders =
    normalizeHeaderNames(
      options.exposedHeaders,
    );

  const credentials =
    options.credentials ??
    false;

  if (
    credentials &&
    typeof origin ===
      "string" &&
    origin.trim() ===
      "*"
  ) {
    throw new TypeError(
      "Wildcard CORS origin cannot be used with credentials.",
    );
  }

  if (
    options.maxAge !==
      undefined
  ) {
    validateMaxAge(
      options.maxAge,
    );
  }

  return {
    origin,
    methods,
    allowedHeaders,
    exposedHeaders,
    credentials,
    maxAge:
      options.maxAge,
  };
}

/* -------------------------------------------------------------------------- */
/* Request Classification                                                     */
/* -------------------------------------------------------------------------- */

export function isCorsRequest(
  request:
    | CorsRequest,
): boolean {
  return Boolean(
    normalizeOrigin(
      request.origin,
    ),
  );
}

export function isPreflightRequest(
  request:
    | CorsRequest,
): boolean {
  return Boolean(
    normalizeOrigin(
      request.origin,
    ) &&
      request.method
        ?.trim()
        .toUpperCase() ===
        "OPTIONS" &&
      request.requestMethod,
  );
}

export function isSimpleCorsRequest(
  request:
    | CorsRequest,
): boolean {
  return (
    isCorsRequest(
      request,
    ) &&
    !isPreflightRequest(
      request,
    )
  );
}

/* -------------------------------------------------------------------------- */
/* Preflight                                                                  */
/* -------------------------------------------------------------------------- */

export function validatePreflight(
  request:
    | CorsRequest,
  policy:
    | CorsPolicy,
): boolean {
  if (
    !isPreflightRequest(
      request,
    )
  ) {
    return false;
  }

  if (
    !request.requestMethod ||
    !isMethodAllowed(
      request.requestMethod,
      policy.methods,
    )
  ) {
    return false;
  }

  const requestedHeaders =
    parseRequestedHeaders(
      request.requestHeaders,
    );

  return areHeadersAllowed(
    requestedHeaders,
    policy.allowedHeaders,
  );
}

/* -------------------------------------------------------------------------- */
/* Response Headers                                                           */
/* -------------------------------------------------------------------------- */

export async function createCorsHeaders(
  request:
    | CorsRequest,
  policy:
    | CorsPolicy,
): Promise<Readonly<
  Record<string, string>
>> {
  const origin =
    normalizeOrigin(
      request.origin,
    );

  if (
    !origin
  ) {
    return {};
  }

  const originAllowed =
    await matchesOrigin(
      policy.origin,
      origin,
    );

  if (
    !originAllowed
  ) {
    return {};
  }

  const headers: Record<
    string,
    string
  > = {};

  const wildcardOrigin =
    typeof policy.origin ===
      "string" &&
    policy.origin.trim() ===
      "*";

  if (
    wildcardOrigin &&
    !policy.credentials
  ) {
    headers[
      CORS_ORIGIN_HEADER
    ] = "*";
  } else {
    headers[
      CORS_ORIGIN_HEADER
    ] = origin;
  }

  if (
    policy.credentials
  ) {
    headers[
      CORS_CREDENTIALS_HEADER
    ] = "true";
  }

  if (
    policy.exposedHeaders.length >
      0
  ) {
    headers[
      CORS_EXPOSE_HEADERS_HEADER
    ] =
      policy.exposedHeaders.join(
        ", ",
      );
  }

  if (
    isPreflightRequest(
      request,
    )
  ) {
    if (
      policy.methods.length >
        0
    ) {
      headers[
        CORS_METHODS_HEADER
      ] =
        policy.methods.join(
          ", ",
        );
    }

    if (
      policy.allowedHeaders.length >
        0
    ) {
      headers[
        CORS_HEADERS_HEADER
      ] =
        policy.allowedHeaders.join(
          ", ",
        );
    }

    if (
      policy.maxAge !==
        undefined
    ) {
      headers[
        CORS_MAX_AGE_HEADER
      ] = String(
        policy.maxAge,
      );
    }
  }

  return headers;
}

/* -------------------------------------------------------------------------- */
/* Full Evaluation                                                            */
/* -------------------------------------------------------------------------- */

export async function evaluateCors(
  request:
    | CorsRequest,
  options:
    | CorsOptions
    | CorsPolicy,
): Promise<CorsResult> {
  const policy =
    isCorsPolicy(
      options,
    )
      ? options
      : createCorsPolicy(
          options,
        );

  const origin =
    normalizeOrigin(
      request.origin,
    );

  if (
    !origin
  ) {
    return {
      allowed: false,
      headers: {},
      preflight: false,
      vary: [],
    };
  }

  const originAllowed =
    await matchesOrigin(
      policy.origin,
      origin,
    );

  if (
    !originAllowed
  ) {
    return {
      allowed: false,
      headers: {},
      preflight:
        isPreflightRequest(
          request,
        ),
      vary: [
        "Origin",
      ],
    };
  }

  const preflight =
    isPreflightRequest(
      request,
    );

  if (
    preflight &&
    !validatePreflight(
      request,
      policy,
    )
  ) {
    return {
      allowed: false,
      headers: {},
      preflight: true,
      vary: [
        "Origin",
        CORS_REQUEST_METHOD_HEADER,
        CORS_REQUEST_HEADERS_HEADER,
      ],
    };
  }

  const headers =
    await createCorsHeaders(
      request,
      policy,
    );

  const vary =
    getCorsVaryHeaders(
      request,
      policy,
    );

  return {
    allowed: true,
    headers,
    preflight,
    vary,
  };
}

/* -------------------------------------------------------------------------- */
/* Vary                                                                       */
/* -------------------------------------------------------------------------- */

export function getCorsVaryHeaders(
  request:
    | CorsRequest,
  policy:
    | CorsPolicy,
): readonly string[] {
  const vary =
    new Set<string>();

  const wildcardOrigin =
    typeof policy.origin ===
      "string" &&
    policy.origin.trim() ===
      "*";

  if (
    !wildcardOrigin ||
    policy.credentials
  ) {
    vary.add(
      "Origin",
    );
  }

  if (
    isPreflightRequest(
      request,
    )
  ) {
    vary.add(
      CORS_REQUEST_METHOD_HEADER,
    );

    if (
      request.requestHeaders
    ) {
      vary.add(
        CORS_REQUEST_HEADERS_HEADER,
      );
    }
  }

  return [
    ...vary,
  ];
}

export function formatVaryHeader(
  values:
    | readonly string[],
): string {
  return uniqueCaseInsensitive(
    values,
  ).join(", ");
}

/* -------------------------------------------------------------------------- */
/* Middleware Helpers                                                         */
/* -------------------------------------------------------------------------- */

export function shouldHandlePreflight(
  request:
    | CorsRequest,
): boolean {
  return isPreflightRequest(
    request,
  );
}

export function getPreflightStatus(
  options:
    | CorsOptions
    | undefined = {},
): number {
  const status =
    options.optionsSuccessStatus ??
    DEFAULT_OPTIONS_SUCCESS_STATUS;

  if (
    !Number.isInteger(
      status,
    ) ||
    status < 200 ||
    status > 299
  ) {
    throw new RangeError(
      "optionsSuccessStatus must be a valid 2xx HTTP status.",
    );
  }

  return status;
}

/* -------------------------------------------------------------------------- */
/* Serialization                                                              */
/* -------------------------------------------------------------------------- */

export function serializeCorsHeaders(
  headers:
    | Readonly<
        Record<string, string>
      >,
  vary:
    | readonly string[]
    | undefined,
): Readonly<
  Record<string, string>
> {
  const result = {
    ...headers,
  };

  if (
    vary &&
    vary.length > 0
  ) {
    result[
      CORS_VARY_HEADER
    ] = formatVaryHeader(
      vary,
    );
  }

  return result;
}

/* -------------------------------------------------------------------------- */
/* Internal Helpers                                                           */
/* -------------------------------------------------------------------------- */

function splitHeaderList(
  value: string,
): string[] {
  return value
    .split(",")
    .map(
      (item) =>
        item.trim(),
    )
    .filter(Boolean);
}

function uniqueCaseInsensitive(
  values:
    | readonly string[],
): string[] {
  const result: string[] =
    [];

  const seen =
    new Set<string>();

  for (
    const value of values
  ) {
    const normalized =
      value.trim();

    if (
      normalized.length ===
        0
    ) {
      continue;
    }

    const key =
      normalized.toLowerCase();

    if (
      seen.has(key)
    ) {
      continue;
    }

    seen.add(
      key,
    );

    result.push(
      normalized,
    );
  }

  return result;
}

function validateMaxAge(
  value: number,
): void {
  if (
    !Number.isSafeInteger(
      value,
    ) ||
    value < 0
  ) {
    throw new RangeError(
      "CORS maxAge must be a non-negative safe integer.",
    );
  }
}

function isCorsPolicy(
  value:
    | CorsOptions
    | CorsPolicy,
): value is CorsPolicy {
  return (
    "methods" in
      value &&
    Array.isArray(
      value.methods,
    ) &&
    "allowedHeaders" in
      value &&
    "exposedHeaders" in
      value &&
    "credentials" in
      value
  );
}