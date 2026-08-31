import type { HTTPRequest } from "../httpTypes/http.types.js";

/* -------------------------------------------------------------------------- */
/* Query Types                                                                */
/* -------------------------------------------------------------------------- */

export type QueryPrimitive =
  | string
  | number
  | boolean
  | null;

export type QueryValue =
  | QueryPrimitive
  | QueryPrimitive[]
  | QueryObject;

export interface QueryObject {
  readonly [key: string]: QueryValue;
}

export interface QueryParseOptions {
  readonly commaSeparated?: boolean;
  readonly plusAsSpace?: boolean;
  readonly decode?: boolean;
}

/* -------------------------------------------------------------------------- */
/* Query Parser                                                               */
/* -------------------------------------------------------------------------- */

export function parseQuery(
  query:
    | string
    | URLSearchParams
    | undefined,
  options:
    QueryParseOptions = {},
): QueryObject {
  if (
    query ===
    undefined
  ) {
    return {};
  }

  const params =
    query instanceof URLSearchParams
      ? query
      : createSearchParams(
          query,
          options,
        );

  const result:
    Record<string, QueryValue> = {};

  for (
    const [
      key,
      value,
    ] of params.entries()
  ) {
    appendQueryValue(
      result,
      parseQueryKey(key),
      value,
    );
  }

  return result;
}

/* -------------------------------------------------------------------------- */
/* Request Query Helpers                                                      */
/* -------------------------------------------------------------------------- */

export function getQuery(
  request: HTTPRequest,
  options:
    QueryParseOptions = {},
): QueryObject {
  const url =
    request.url;

  if (
    !url
  ) {
    return {};
  }

  const queryIndex =
    url.indexOf(
      "?",
    );

  if (
    queryIndex ===
    -1
  ) {
    return {};
  }

  const hashIndex =
    url.indexOf(
      "#",
      queryIndex + 1,
    );

  const query =
    url.slice(
      queryIndex + 1,
      hashIndex === -1
        ? undefined
        : hashIndex,
    );

  return parseQuery(
    query,
    options,
  );
}

export function getQueryValue(
  request: HTTPRequest,
  key: string,
): QueryValue | undefined {
  return getQuery(
    request,
  )[key];
}

export function getQueryString(
  request: HTTPRequest,
  key: string,
): string | undefined {
  const value =
    getQueryValue(
      request,
      key,
    );

  if (
    value ===
    undefined ||
    Array.isArray(
      value,
    )
  ) {
    return undefined;
  }

  if (
    value ===
    null
  ) {
    return null as unknown as string;
  }

  return String(
    value,
  );
}

export function getQueryStrings(
  request: HTTPRequest,
  key: string,
): string[] {
  const value =
    getQueryValue(
      request,
      key,
    );

  if (
    value ===
    undefined
  ) {
    return [];
  }

  if (
    Array.isArray(
      value,
    )
  ) {
    return value.map(
      String,
    );
  }

  return [
    String(value),
  ];
}

/* -------------------------------------------------------------------------- */
/* Search Params                                                               */
/* -------------------------------------------------------------------------- */

export function getSearchParams(
  request: HTTPRequest,
): URLSearchParams {
  const url =
    request.url ??
    "";

  const queryIndex =
    url.indexOf(
      "?",
    );

  if (
    queryIndex ===
    -1
  ) {
    return new URLSearchParams();
  }

  const hashIndex =
    url.indexOf(
      "#",
      queryIndex + 1,
    );

  const query =
    url.slice(
      queryIndex + 1,
      hashIndex === -1
        ? undefined
        : hashIndex,
    );

  return new URLSearchParams(
    query,
  );
}

/* -------------------------------------------------------------------------- */
/* Query String Serialization                                                 */
/* -------------------------------------------------------------------------- */

export function stringifyQuery(
  query:
    | QueryObject
    | Record<string, unknown>,
): string {
  const params =
    new URLSearchParams();

  appendObjectToSearchParams(
    params,
    query,
  );

  return params.toString();
}

export function buildQueryString(
  query:
    | QueryObject
    | Record<string, unknown>,
): string {
  const value =
    stringifyQuery(
      query,
    );

  return value
    ? `?${value}`
    : "";
}

/* -------------------------------------------------------------------------- */
/* Query Value Access                                                         */
/* -------------------------------------------------------------------------- */

export function hasQuery(
  request: HTTPRequest,
  key: string,
): boolean {
  return getSearchParams(
    request,
  ).has(
    key,
  );
}

export function querySize(
  request: HTTPRequest,
): number {
  let size =
    0;

  for (
    const _ of getSearchParams(
      request,
    )
  ) {
    size += 1;
  }

  return size;
}

/* -------------------------------------------------------------------------- */
/* Query Key Parsing                                                          */
/* -------------------------------------------------------------------------- */

export function parseQueryKey(
  key: string,
): string[] {
  if (
    !key
  ) {
    return [""];
  }

  const normalized =
    key.replace(
      /\]/g,
      "",
    );

  return normalized
    .split(
      /[.[\]]+/,
    )
    .filter(
      (
        part,
      ) =>
        part.length >
        0,
    );
}

/* -------------------------------------------------------------------------- */
/* Nested Query Values                                                        */
/* -------------------------------------------------------------------------- */

function appendQueryValue(
  target:
    Record<string, QueryValue>,
  path: readonly string[],
  value: string,
): void {
  if (
    path.length ===
    0
  ) {
    return;
  }

  const root =
    path[0];

  if (
    path.length ===
    1
  ) {
    const existing =
      target[root];

    if (
      existing ===
      undefined
    ) {
      target[root] =
        normalizeQueryValue(
          value,
        );

      return;
    }

    if (
      Array.isArray(
        existing,
      )
    ) {
      existing.push(
        normalizeQueryValue(
          value,
        ),
      );

      return;
    }

    target[root] = [
      existing as QueryPrimitive,
      normalizeQueryValue(
        value,
      ),
    ];

    return;
  }

  const existing =
    target[root];

  let object:
    Record<
      string,
      QueryValue
    >;

  if (
    isQueryObject(
      existing,
    )
  ) {
    object =
      existing as Record<
        string,
        QueryValue
      >;
  } else {
    object = {};
    target[root] =
      object;
  }

  appendQueryValue(
    object,
    path.slice(1),
    value,
  );
}

/* -------------------------------------------------------------------------- */
/* Query Value Normalization                                                  */
/* -------------------------------------------------------------------------- */

export function normalizeQueryValue(
  value: string,
): QueryPrimitive {
  if (
    value ===
    "null"
  ) {
    return null;
  }

  if (
    value ===
    "true"
  ) {
    return true;
  }

  if (
    value ===
    "false"
  ) {
    return false;
  }

  if (
    /^-?(?:0|[1-9]\d*)(?:\.\d+)?$/.test(
      value,
    )
  ) {
    const number =
      Number(
        value,
      );

    if (
      Number.isSafeInteger(
        number,
      ) ||
      Number.isFinite(
        number,
      )
    ) {
      return number;
    }
  }

  return value;
}

function isQueryObject(
  value:
    | QueryValue
    | undefined,
): value is QueryObject {
  return (
    value !==
      null &&
    typeof value ===
      "object" &&
    !Array.isArray(
      value,
    )
  );
}

/* -------------------------------------------------------------------------- */
/* Search Params Factory                                                      */
/* -------------------------------------------------------------------------- */

function createSearchParams(
  query: string,
  options:
    QueryParseOptions,
): URLSearchParams {
  let value =
    query;

  if (
    options.plusAsSpace !==
    false
  ) {
    value =
      value.replace(
        /\+/g,
        " ",
      );
  }

  if (
    options.decode ===
    false
  ) {
    return new URLSearchParams(
      value,
    );
  }

  return new URLSearchParams(
    value,
  );
}

/* -------------------------------------------------------------------------- */
/* Serialization                                                              */
/* -------------------------------------------------------------------------- */

function appendObjectToSearchParams(
  params: URLSearchParams,
  object:
    | Record<string, unknown>,
  prefix?: string,
): void {
  for (
    const [
      key,
      value,
    ] of Object.entries(
      object,
    )
  ) {
    const path =
      prefix
        ? `${prefix}[${key}]`
        : key;

    if (
      value ===
      undefined
    ) {
      continue;
    }

    if (
      value ===
      null
    ) {
      params.append(
        path,
        "null",
      );

      continue;
    }

    if (
      Array.isArray(
        value,
      )
    ) {
      for (
        const item of value
      ) {
        if (
          item ===
          undefined
        ) {
          continue;
        }

        if (
          isPlainObject(
            item,
          )
        ) {
          appendObjectToSearchParams(
            params,
            item as Record<
              string,
              unknown
            >,
            path,
          );
        } else {
          params.append(
            path,
            serializeQueryPrimitive(
              item,
            ),
          );
        }
      }

      continue;
    }

    if (
      isPlainObject(
        value,
      )
    ) {
      appendObjectToSearchParams(
        params,
        value as Record<
          string,
          unknown
        >,
        path,
      );

      continue;
    }

    params.append(
      path,
      serializeQueryPrimitive(
        value,
      ),
    );
  }
}

/* -------------------------------------------------------------------------- */
/* Primitive Serialization                                                    */
/* -------------------------------------------------------------------------- */

function serializeQueryPrimitive(
  value: unknown,
): string {
  if (
    value ===
    null
  ) {
    return "null";
  }

  if (
    value ===
    undefined
  ) {
    return "";
  }

  if (
    typeof value ===
    "boolean"
  ) {
    return value
      ? "true"
      : "false";
  }

  if (
    typeof value ===
    "string"
  ) {
    return value;
  }

  if (
    typeof value ===
      "number" ||
    typeof value ===
      "bigint"
  ) {
    return String(
      value,
    );
  }

  if (
    value instanceof Date
  ) {
    return value.toISOString();
  }

  return String(
    value,
  );
}

function isPlainObject(
  value: unknown,
): boolean {
  if (
    value ===
      null ||
    typeof value !==
      "object"
  ) {
    return false;
  }

  const prototype =
    Object.getPrototypeOf(
      value,
    );

  return (
    prototype ===
      Object.prototype ||
    prototype ===
      null
  );
}

/* -------------------------------------------------------------------------- */
/* Query Utilities                                                            */
/* -------------------------------------------------------------------------- */

export function cloneQuery(
  query: QueryObject,
): QueryObject {
  return JSON.parse(
    JSON.stringify(
      query,
    ),
  ) as QueryObject;
}

export function mergeQuery(
  ...queries: QueryObject[]
): QueryObject {
  const result:
    Record<string, QueryValue> =
    {};

  for (
    const query of queries
  ) {
    mergeQueryObject(
      result,
      query,
    );
  }

  return result;
}

function mergeQueryObject(
  target:
    Record<string, QueryValue>,
  source:
    QueryObject,
): void {
  for (
    const [
      key,
      value,
    ] of Object.entries(
      source,
    )
  ) {
    if (key === "__proto__" || key === "constructor") {
      continue;
    }
    const existing =
      target[key];

    if (
      isQueryObject(
        existing,
      ) &&
      isQueryObject(
        value,
      )
    ) {
      mergeQueryObject(
        existing as Record<
          string,
          QueryValue
        >,
        value as QueryObject,
      );

      continue;
    }

    target[key] =
      value;
  }
}