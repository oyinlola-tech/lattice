/**
 * HTTP URL utilities.
 *
 * Provides URL normalization, query parameter handling, path joining,
 * origin helpers, and safe URL manipulation for the HTTP package.
 */

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type URLInput =
  | string
  | URL;

export type QueryValue =
  | string
  | number
  | boolean
  | bigint
  | null
  | undefined;

export type QueryInput =
  | URLSearchParams
  | Record<
      string,
      QueryValue
      | readonly QueryValue[]
    >;

export interface ParsedURL {
  readonly url: URL;
  readonly protocol: string;
  readonly hostname: string;
  readonly port: string;
  readonly pathname: string;
  readonly search: string;
  readonly hash: string;
  readonly origin: string;
}

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

export const HTTP_PROTOCOL = "http:";

export const HTTPS_PROTOCOL = "https:";

export const DEFAULT_HTTP_PORT = 80;

export const DEFAULT_HTTPS_PORT = 443;

/* -------------------------------------------------------------------------- */
/* Parsing                                                                    */
/* -------------------------------------------------------------------------- */

export function parseURL(
  input: URLInput,
  base?: URLInput,
): URL {
  if (
    input instanceof URL
  ) {
    return new URL(
      input.href,
    );
  }

  if (
    base !== undefined
  ) {
    return new URL(
      input,
      toURL(
        base,
      ),
    );
  }

  return new URL(
    input,
  );
}

export function tryParseURL(
  input:
    | URLInput
    | undefined
    | null,
  base?: URLInput,
): URL | undefined {
  if (
    input ===
      undefined ||
    input ===
      null
  ) {
    return undefined;
  }

  try {
    return parseURL(
      input,
      base,
    );
  } catch {
    return undefined;
  }
}

export function toURL(
  input: URLInput,
  base?: URLInput,
): URL {
  return parseURL(
    input,
    base,
  );
}

/* -------------------------------------------------------------------------- */
/* Formatting                                                                 */
/* -------------------------------------------------------------------------- */

export function stringifyURL(
  input: URLInput,
): string {
  return toURL(
    input,
  ).href;
}

export function getOrigin(
  input: URLInput,
): string {
  return toURL(
    input,
  ).origin;
}

export function getProtocol(
  input: URLInput,
): string {
  return toURL(
    input,
  ).protocol;
}

export function getHostname(
  input: URLInput,
): string {
  return toURL(
    input,
  ).hostname;
}

export function getPort(
  input: URLInput,
): number | undefined {
  const url =
    toURL(
      input,
    );

  if (
    url.port
      .length > 0
  ) {
    return Number(
      url.port,
    );
  }

  if (
    url.protocol ===
    HTTP_PROTOCOL
  ) {
    return DEFAULT_HTTP_PORT;
  }

  if (
    url.protocol ===
    HTTPS_PROTOCOL
  ) {
    return DEFAULT_HTTPS_PORT;
  }

  return undefined;
}

export function getPathname(
  input: URLInput,
): string {
  return toURL(
    input,
  ).pathname;
}

export function getSearch(
  input: URLInput,
): string {
  return toURL(
    input,
  ).search;
}

export function getHash(
  input: URLInput,
): string {
  return toURL(
    input,
  ).hash;
}

/* -------------------------------------------------------------------------- */
/* Protocol Helpers                                                           */
/* -------------------------------------------------------------------------- */

export function isHTTPURL(
  input: URLInput,
): boolean {
  return (
    getProtocol(
      input,
    ) ===
    HTTP_PROTOCOL
  );
}

export function isHTTPSURL(
  input: URLInput,
): boolean {
  return (
    getProtocol(
      input,
    ) ===
    HTTPS_PROTOCOL
  );
}

export function isHTTPOrHTTPSURL(
  input: URLInput,
): boolean {
  const protocol =
    getProtocol(
      input,
    );

  return (
    protocol ===
      HTTP_PROTOCOL ||
    protocol ===
      HTTPS_PROTOCOL
  );
}

export function isSecureURL(
  input: URLInput,
): boolean {
  return isHTTPSURL(
    input,
  );
}

/* -------------------------------------------------------------------------- */
/* Origin Helpers                                                             */
/* -------------------------------------------------------------------------- */

export function sameOrigin(
  left: URLInput,
  right: URLInput,
): boolean {
  return (
    getOrigin(
      left,
    ) ===
    getOrigin(
      right,
    )
  );
}

export function sameHost(
  left: URLInput,
  right: URLInput,
): boolean {
  const first =
    toURL(
      left,
    );

  const second =
    toURL(
      right,
    );

  return (
    first.hostname ===
      second.hostname &&
    first.port ===
      second.port &&
    first.protocol ===
      second.protocol
  );
}

export function sameSite(
  left: URLInput,
  right: URLInput,
): boolean {
  return (
    getHostname(
      left,
    ) ===
    getHostname(
      right,
    )
  );
}

/* -------------------------------------------------------------------------- */
/* Path Helpers                                                               */
/* -------------------------------------------------------------------------- */

export function joinURLPath(
  ...parts: string[]
): string {
  const filtered =
    parts.filter(
      (
        part,
      ) =>
        part !==
        "",
    );

  if (
    filtered.length ===
    0
  ) {
    return "/";
  }

  const joined =
    filtered.join(
      "/",
    );

  return normalizePath(
    joined,
  );
}

export function normalizePath(
  path: string,
): string {
  if (
    path.length ===
    0
  ) {
    return "/";
  }

  const hasLeadingSlash =
    path.startsWith(
      "/",
    );

  const hasTrailingSlash =
    path.length > 1 &&
    path.endsWith(
      "/",
    );

  const segments =
    path.split(
      "/",
    );

  const normalized:
    string[] =
    [];

  for (
    const segment of segments
  ) {
    if (
      segment ===
      "" ||
      segment ===
      "."
    ) {
      continue;
    }

    if (
      segment ===
      ".."
    ) {
      if (
        normalized.length >
        0
      ) {
        normalized.pop();
      }

      continue;
    }

    normalized.push(
      segment,
    );
  }

  let result =
    normalized.join(
      "/",
    );

  if (
    hasLeadingSlash
  ) {
    result =
      `/${result}`;
  }

  if (
    result.length ===
    0
  ) {
    result = "/";
  }

  if (
    hasTrailingSlash &&
    result !==
      "/"
  ) {
    result += "/";
  }

  return result;
}

export function ensureLeadingSlash(
  path: string,
): string {
  if (
    path.length ===
    0
  ) {
    return "/";
  }

  return path.startsWith(
    "/",
  )
    ? path
    : `/${path}`;
}

export function ensureTrailingSlash(
  path: string,
): string {
  if (
    path.length ===
    0
  ) {
    return "/";
  }

  return path.endsWith(
    "/",
  )
    ? path
    : `${path}/`;
}

export function removeTrailingSlash(
  path: string,
): string {
  if (
    path ===
    "/"
  ) {
    return path;
  }

  let end = path.length;
  while (end > 0 && path.charCodeAt(end - 1) === 47) {
    end--;
  }
  return path.slice(0, end);
}

export function removeLeadingSlash(
  path: string,
): string {
  let start = 0;
  while (start < path.length && path.charCodeAt(start) === 47) {
    start++;
  }
  return path.slice(start);
}

/* -------------------------------------------------------------------------- */
/* URL Joining                                                                */
/* -------------------------------------------------------------------------- */

export function resolveURL(
  base: URLInput,
  path: string,
): URL {
  return new URL(
    path,
    toURL(
      base,
    ),
  );
}

export function resolveURLString(
  base: URLInput,
  path: string,
): string {
  return resolveURL(
    base,
    path,
  ).href;
}

export function appendPath(
  base: URLInput,
  ...paths: string[]
): URL {
  const url =
    toURL(
      base,
    );

  const basePath =
    removeTrailingSlash(
      url.pathname,
    );

  const appended =
    paths
      .map(
        removeLeadingSlash,
      )
      .filter(
        Boolean,
      )
      .join(
        "/",
      );

  url.pathname =
    normalizePath(
      appended
        ? `${basePath}/${appended}`
        : basePath,
    );

  return url;
}

/* -------------------------------------------------------------------------- */
/* Query Parameters                                                           */
/* -------------------------------------------------------------------------- */

export function getQuery(
  input: URLInput,
): URLSearchParams {
  return new URLSearchParams(
    toURL(
      input,
    ).searchParams,
  );
}

export function getQueryParam(
  input: URLInput,
  name: string,
): string | null {
  return toURL(
    input,
  ).searchParams.get(
    name,
  );
}

export function getQueryParams(
  input: URLInput,
  name: string,
): string[] {
  return toURL(
    input,
  ).searchParams.getAll(
    name,
  );
}

export function hasQueryParam(
  input: URLInput,
  name: string,
): boolean {
  return toURL(
    input,
  ).searchParams.has(
    name,
  );
}

export function setQueryParam(
  input: URLInput,
  name: string,
  value: QueryValue,
): URL {
  const url =
    toURL(
      input,
    );

  if (
    value ===
      undefined ||
    value ===
      null
  ) {
    url.searchParams.delete(
      name,
    );

    return url;
  }

  url.searchParams.set(
    name,
    String(
      value,
    ),
  );

  return url;
}

export function appendQueryParam(
  input: URLInput,
  name: string,
  value: QueryValue,
): URL {
  const url =
    toURL(
      input,
    );

  if (
    value ===
      undefined ||
    value ===
      null
  ) {
    return url;
  }

  url.searchParams.append(
    name,
    String(
      value,
    ),
  );

  return url;
}

export function deleteQueryParam(
  input: URLInput,
  name: string,
): URL {
  const url =
    toURL(
      input,
    );

  url.searchParams.delete(
    name,
  );

  return url;
}

export function setQueryParams(
  input: URLInput,
  query: QueryInput,
): URL {
  const url =
    toURL(
      input,
    );

  applyQueryParams(
    url.searchParams,
    query,
  );

  return url;
}

export function appendQueryParams(
  input: URLInput,
  query: QueryInput,
): URL {
  const url =
    toURL(
      input,
    );

  appendQueryValues(
    url.searchParams,
    query,
  );

  return url;
}

export function clearQuery(
  input: URLInput,
): URL {
  const url =
    toURL(
      input,
    );

  url.search = "";

  return url;
}

export function queryToString(
  query: QueryInput,
): string {
  const params =
    new URLSearchParams();

  appendQueryValues(
    params,
    query,
  );

  return params.toString();
}

/* -------------------------------------------------------------------------- */
/* Query Object Conversion                                                    */
/* -------------------------------------------------------------------------- */

export function queryToObject(
  input:
    | URLInput
    | URLSearchParams,
): Record<string, string | string[]> {
  const params =
    input instanceof
    URLSearchParams
      ? input
      : getQuery(
          input,
        );

  const result:
    Record<
      string,
      string | string[]
    > = {};

  for (
    const [
      key,
      value,
    ] of params
  ) {
    const existing =
      result[key];

    if (
      existing ===
      undefined
    ) {
      result[key] =
        value;
    } else if (
      Array.isArray(
        existing,
      )
    ) {
      existing.push(
        value,
      );
    } else {
      result[key] =
        [
          existing,
          value,
        ];
    }
  }

  return result;
}

/* -------------------------------------------------------------------------- */
/* URL Construction                                                           */
/* -------------------------------------------------------------------------- */

export function createURL(
  base: URLInput,
  options: {
    readonly path?: string;
    readonly query?: QueryInput;
    readonly hash?: string;
  } = {},
): URL {
  let url =
    toURL(
      base,
    );

  if (
    options.path !==
      undefined
  ) {
    url =
      appendPath(
        url,
        options.path,
      );
  }

  if (
    options.query !==
      undefined
  ) {
    setQueryParams(
      url,
      options.query,
    );
  }

  if (
    options.hash !==
      undefined
  ) {
    url.hash =
      options.hash.startsWith(
        "#",
      )
        ? options.hash
        : `#${options.hash}`;
  }

  return url;
}

/* -------------------------------------------------------------------------- */
/* URL Sanitization                                                           */
/* -------------------------------------------------------------------------- */

export function stripHash(
  input: URLInput,
): URL {
  const url =
    toURL(
      input,
    );

  url.hash = "";

  return url;
}

export function stripQuery(
  input: URLInput,
): URL {
  const url =
    toURL(
      input,
    );

  url.search = "";

  return url;
}

export function stripCredentials(
  input: URLInput,
): URL {
  const url =
    toURL(
      input,
    );

  url.username = "";
  url.password = "";

  return url;
}

export function stripQueryAndHash(
  input: URLInput,
): URL {
  const url =
    toURL(
      input,
    );

  url.search = "";
  url.hash = "";

  return url;
}

/* -------------------------------------------------------------------------- */
/* Credentials                                                                */
/* -------------------------------------------------------------------------- */

export function getURLUsername(
  input: URLInput,
): string {
  return toURL(
    input,
  ).username;
}

export function getURLPassword(
  input: URLInput,
): string {
  return toURL(
    input,
  ).password;
}

export function hasURLCredentials(
  input: URLInput,
): boolean {
  const url =
    toURL(
      input,
    );

  return (
    url.username.length >
      0 ||
    url.password.length >
      0
  );
}

/* -------------------------------------------------------------------------- */
/* Network Helpers                                                            */
/* -------------------------------------------------------------------------- */

export function isLocalhost(
  input: URLInput,
): boolean {
  const hostname =
    getHostname(
      input,
    ).toLowerCase();

  return (
    hostname ===
      "localhost" ||
    hostname ===
      "127.0.0.1" ||
    hostname ===
      "::1" ||
    hostname ===
      "[::1]"
  );
}

export function isIPLiteral(
  input: URLInput,
): boolean {
  const hostname =
    getHostname(
      input,
    );

  return (
    hostname.includes(
      ":",
    ) ||
    /^\d{1,3}(?:\.\d{1,3}){3}$/.test(
      hostname,
    )
  );
}

/* -------------------------------------------------------------------------- */
/* URL Comparison                                                             */
/* -------------------------------------------------------------------------- */

export function urlsEqual(
  left: URLInput,
  right: URLInput,
): boolean {
  return (
    toURL(
      left,
    ).href ===
    toURL(
      right,
    ).href
  );
}

export function urlsEquivalent(
  left: URLInput,
  right: URLInput,
): boolean {
  const first =
    toURL(
      left,
    );

  const second =
    toURL(
      right,
    );

  first.hash = "";
  second.hash = "";

  return (
    first.href ===
    second.href
  );
}

/* -------------------------------------------------------------------------- */
/* Internal Query Helpers                                                     */
/* -------------------------------------------------------------------------- */

function applyQueryParams(
  target: URLSearchParams,
  query: QueryInput,
): void {
  target.forEach(
    (
      _value,
      key,
    ) => {
      target.delete(
        key,
      );
    },
  );

  appendQueryValues(
    target,
    query,
  );
}

function appendQueryValues(
  target: URLSearchParams,
  query: QueryInput,
): void {
  if (
    query instanceof
    URLSearchParams
  ) {
    for (
      const [
        key,
        value,
      ] of query
    ) {
      target.append(
        key,
        value,
      );
    }

    return;
  }

  for (
    const [
      key,
      rawValue,
    ] of Object.entries(
      query,
    )
  ) {
    if (
      Array.isArray(
        rawValue,
      )
    ) {
      for (
        const value of rawValue
      ) {
        if (
          value ===
            undefined ||
          value ===
            null
        ) {
          continue;
        }

        target.append(
          key,
          String(
            value,
          ),
        );
      }

      continue;
    }

    if (
      rawValue ===
        undefined ||
      rawValue ===
        null
    ) {
      continue;
    }

    target.append(
      key,
      String(
        rawValue,
      ),
    );
  }
}