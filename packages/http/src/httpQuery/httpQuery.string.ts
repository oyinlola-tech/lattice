/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type QueryStringPrimitive =
  | string
  | number
  | boolean
  | null
  | undefined;

export type QueryStringValue =
  | QueryStringPrimitive
  | readonly QueryStringPrimitive[];

export type QueryStringRecord =
  Record<
    string,
    QueryStringValue
  >;

export interface QueryStringParseOptions {
  readonly decodePlusAsSpace?:
    | boolean;

  readonly maxKeys?:
    | number;

  readonly maxKeyLength?:
    | number;

  readonly maxValueLength?:
    | number;

  readonly maxTotalLength?:
    | number;

  readonly allowEmptyKeys?:
    | boolean;
}

export interface QueryStringStringifyOptions {
  readonly encodeSpaceAsPlus?:
    | boolean;

  readonly sortKeys?:
    | boolean;

  readonly skipNull?:
    | boolean;

  readonly skipUndefined?:
    | boolean;

  readonly skipEmptyString?:
    | boolean;
}

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const DEFAULT_MAX_KEYS =
  1000;

const DEFAULT_MAX_KEY_LENGTH =
  4096;

const DEFAULT_MAX_VALUE_LENGTH =
  16384;

const DEFAULT_MAX_TOTAL_LENGTH =
  1024 * 1024;

/* -------------------------------------------------------------------------- */
/* Parsing                                                                    */
/* -------------------------------------------------------------------------- */

export function parseQueryString(
  input:
    | string
    | undefined
    | null,
  options:
    | QueryStringParseOptions = {},
): Record<
  string,
  string | string[]
> {
  if (
    input ===
      undefined ||
    input ===
      null ||
    input ===
      ""
  ) {
    return {};
  }

  const value =
    stripQueryPrefix(
      input,
    );

  if (
    value.length ===
      0
  ) {
    return {};
  }

  const maxTotalLength =
    options.maxTotalLength ??
    DEFAULT_MAX_TOTAL_LENGTH;

  if (
    value.length >
    maxTotalLength
  ) {
    throw new RangeError(
      "Query string exceeds the maximum allowed length.",
    );
  }

  const result:
    Record<
      string,
      string | string[]
    > =
    {};

  const maxKeys =
    options.maxKeys ??
    DEFAULT_MAX_KEYS;

  const maxKeyLength =
    options.maxKeyLength ??
    DEFAULT_MAX_KEY_LENGTH;

  const maxValueLength =
    options.maxValueLength ??
    DEFAULT_MAX_VALUE_LENGTH;

  const allowEmptyKeys =
    options.allowEmptyKeys ??
    true;

  const parts =
    value.split(
      "&",
    );

  let keyCount =
    0;

  for (
    const part of parts
  ) {
    if (
      part ===
        ""
    ) {
      continue;
    }

    keyCount +=
      1;

    if (
      keyCount >
      maxKeys
    ) {
      throw new RangeError(
        "Query string contains too many parameters.",
      );
    }

    const separator =
      part.indexOf(
        "=",
      );

    const rawKey =
      separator ===
        -1
        ? part
        : part.slice(
            0,
            separator,
          );

    const rawValue =
      separator ===
        -1
        ? ""
        : part.slice(
            separator + 1,
          );

    const key =
      decodeQueryComponent(
        rawKey,
        options,
      );

    const parsedValue =
      decodeQueryComponent(
        rawValue,
        options,
      );

    if (
      !allowEmptyKeys &&
      key.length ===
        0
    ) {
      continue;
    }

    if (
      key.length >
      maxKeyLength
    ) {
      throw new RangeError(
        "Query parameter name exceeds the maximum allowed length.",
      );
    }

    if (
      parsedValue.length >
      maxValueLength
    ) {
      throw new RangeError(
        "Query parameter value exceeds the maximum allowed length.",
      );
    }

    appendQueryValue(
      result,
      key,
      parsedValue,
    );
  }

  return result;
}

/* -------------------------------------------------------------------------- */
/* Parsing Helpers                                                            */
/* -------------------------------------------------------------------------- */

export function parseQueryValue(
  input:
    | string
    | undefined
    | null,
  key:
    | string,
  options:
    | QueryStringParseOptions = {},
): string[] {
  const parsed =
    parseQueryString(
      input,
      options,
    );

  const value =
    parsed[key];

  if (
    value ===
      undefined
  ) {
    return [];
  }

  return Array.isArray(
    value,
  )
    ? value
    : [value];
}

export function getQueryValue(
  input:
    | string
    | undefined
    | null,
  key:
    | string,
  options:
    | QueryStringParseOptions = {},
):
  | string
  | undefined {
  const values =
    parseQueryValue(
      input,
      key,
      options,
    );

  return values[0];
}

export function hasQueryParameter(
  input:
    | string
    | undefined
    | null,
  key:
    | string,
  options:
    | QueryStringParseOptions = {},
): boolean {
  const parsed =
    parseQueryString(
      input,
      options,
    );

  return Object.prototype.hasOwnProperty.call(
    parsed,
    key,
  );
}

/* -------------------------------------------------------------------------- */
/* Stringifying                                                               */
/* -------------------------------------------------------------------------- */

export function stringifyQueryString(
  input:
    | QueryStringRecord
    | URLSearchParams
    | undefined
    | null,
  options:
    | QueryStringStringifyOptions = {},
): string {
  if (
    input ===
      undefined ||
    input ===
      null
  ) {
    return "";
  }

  if (
    input instanceof
    URLSearchParams
  ) {
    return stringifySearchParams(
      input,
      options,
    );
  }

  const entries =
    Object.entries(
      input,
    );

  if (
    options.sortKeys
  ) {
    entries.sort(
      (
        left,
        right,
      ) =>
        left[0].localeCompare(
          right[0],
        ),
    );
  }

  const parts:
    | string[] =
    [];

  for (
    const [
      key,
      value,
    ] of entries
  ) {
    if (
      Array.isArray(
        value,
      )
    ) {
      for (
        const item of value
      ) {
        appendStringifiedValue(
          parts,
          key,
          item,
          options,
        );
      }

      continue;
    }

    appendStringifiedValue(
      parts,
      key,
      value as QueryStringPrimitive,
      options,
    );
  }

  return parts.join(
    "&",
  );
}

export function stringifySearchParams(
  params:
    | URLSearchParams,
  options:
    | QueryStringStringifyOptions = {},
): string {
  const entries =
    Array.from(
      params.entries(),
    );

  if (
    options.sortKeys
  ) {
    entries.sort(
      (
        left,
        right,
      ) =>
        left[0].localeCompare(
          right[0],
        ),
    );
  }

  const parts:
    | string[] =
    [];

  for (
    const [
      key,
      value,
    ] of entries
  ) {
    appendStringifiedValue(
      parts,
      key,
      value,
      options,
    );
  }

  return parts.join(
    "&",
  );
}

/* -------------------------------------------------------------------------- */
/* URLSearchParams Conversion                                                  */
/* -------------------------------------------------------------------------- */

export function toURLSearchParams(
  input:
    | QueryStringRecord
    | URLSearchParams
    | string
    | undefined
    | null,
): URLSearchParams {
  if (
    input instanceof
    URLSearchParams
  ) {
    return new URLSearchParams(
      input,
    );
  }

  if (
    typeof input ===
    "string"
  ) {
    return new URLSearchParams(
      stripQueryPrefix(
        input,
      ),
    );
  }

  const result =
    new URLSearchParams();

  if (
    input ===
      undefined ||
    input ===
      null
  ) {
    return result;
  }

  for (
    const [
      key,
      value,
    ] of Object.entries(
      input,
    )
  ) {
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
            null ||
          item ===
            undefined
        ) {
          continue;
        }

        result.append(
          key,
          String(
            item,
          ),
        );
      }

      continue;
    }

    if (
      value ===
        null ||
      value ===
        undefined
    ) {
      continue;
    }

    result.append(
      key,
      String(
        value,
      ),
    );
  }

  return result;
}

/* -------------------------------------------------------------------------- */
/* Query Parameter Mutation                                                   */
/* -------------------------------------------------------------------------- */

export function setQueryParameter(
  input:
    | string
    | undefined
    | null,
  key:
    | string,
  value:
    | QueryStringPrimitive,
): string {
  const params =
    new URLSearchParams(
      stripQueryPrefix(
        input ??
          "",
      ),
    );

  params.set(
    key,
    String(
      value ??
        "",
    ),
  );

  return params.toString();
}

export function appendQueryParameter(
  input:
    | string
    | undefined
    | null,
  key:
    | string,
  value:
    | QueryStringPrimitive,
): string {
  const params =
    new URLSearchParams(
      stripQueryPrefix(
        input ??
          "",
      ),
    );

  params.append(
    key,
    String(
      value ??
        "",
    ),
  );

  return params.toString();
}

export function deleteQueryParameter(
  input:
    | string
    | undefined
    | null,
  key:
    | string,
): string {
  const params =
    new URLSearchParams(
      stripQueryPrefix(
        input ??
          "",
      ),
    );

  params.delete(
    key,
  );

  return params.toString();
}

export function deleteQueryParameters(
  input:
    | string
    | undefined
    | null,
  keys:
    | readonly string[],
): string {
  const params =
    new URLSearchParams(
      stripQueryPrefix(
        input ??
          "",
      ),
    );

  for (
    const key of keys
  ) {
    params.delete(
      key,
    );
  }

  return params.toString();
}

/* -------------------------------------------------------------------------- */
/* URL Utilities                                                              */
/* -------------------------------------------------------------------------- */

export function getURLQueryString(
  url:
    | string,
): string {
  const questionMark =
    url.indexOf(
      "?",
    );

  if (
    questionMark ===
      -1
  ) {
    return "";
  }

  const hash =
    url.indexOf(
      "#",
      questionMark,
    );

  if (
    hash ===
      -1
  ) {
    return url.slice(
      questionMark + 1,
    );
  }

  return url.slice(
    questionMark + 1,
    hash,
  );
}

export function getURLPath(
  url:
    | string,
): string {
  const query =
    url.search
      ? url.search
      : "?";

  const queryIndex =
    url.indexOf(
      "?",
    );

  const hashIndex =
    url.indexOf(
      "#",
    );

  let end =
    url.length;

  if (
    queryIndex !==
      -1
  ) {
    end =
      Math.min(
        end,
        queryIndex,
      );
  }

  if (
    hashIndex !==
      -1
  ) {
    end =
      Math.min(
        end,
        hashIndex,
      );
  }

  void query;

  return url.slice(
    0,
    end,
  );
}

export function getURLHash(
  url:
    | string,
): string {
  const hashIndex =
    url.indexOf(
      "#",
    );

  if (
    hashIndex ===
      -1
  ) {
    return "";
  }

  return url.slice(
    hashIndex + 1,
  );
}

export function removeURLQuery(
  url:
    | string,
): string {
  const queryIndex =
    url.indexOf(
      "?",
    );

  if (
    queryIndex ===
      -1
  ) {
    return url;
  }

  const hashIndex =
    url.indexOf(
      "#",
      queryIndex,
    );

  if (
    hashIndex ===
      -1
  ) {
    return url.slice(
      0,
      queryIndex,
    );
  }

  return (
    url.slice(
      0,
      queryIndex,
    ) +
    url.slice(
      hashIndex,
    )
  );
}

/* -------------------------------------------------------------------------- */
/* Query String Validation                                                    */
/* -------------------------------------------------------------------------- */

export function isValidQueryString(
  input:
    | string
    | undefined
    | null,
  options:
    | QueryStringParseOptions = {},
): boolean {
  try {
    parseQueryString(
      input,
      options,
    );

    return true;
  } catch {
    return false;
  }
}

export function isValidQueryParameterName(
  name:
    | string,
): boolean {
  return (
    typeof name ===
      "string" &&
    name.length >
      0 &&
    !/[\x00-\x1f\x7f]/.test(
      name,
    )
  );
}

/* -------------------------------------------------------------------------- */
/* Encoding                                                                   */
/* -------------------------------------------------------------------------- */

export function encodeQueryComponent(
  value:
    | string,
  encodeSpaceAsPlus:
    | boolean = false,
): string {
  const encoded =
    encodeURIComponent(
      value,
    );

  if (
    encodeSpaceAsPlus
  ) {
    return encoded.replace(
      /%20/g,
      "+",
    );
  }

  return encoded;
}

export function decodeQueryComponent(
  value:
    | string,
  options:
    | QueryStringParseOptions = {},
): string {
  let input =
    value;

  if (
    options.decodePlusAsSpace !==
      false
  ) {
    input =
      input.replace(
        /\+/g,
        " ",
      );
  }

  try {
    return decodeURIComponent(
      input,
    );
  } catch {
    throw new TypeError(
      `Invalid percent-encoded query component: ${value}`,
    );
  }
}

/* -------------------------------------------------------------------------- */
/* Normalization                                                              */
/* -------------------------------------------------------------------------- */

export function normalizeQueryString(
  input:
    | string
    | undefined
    | null,
): string {
  const params =
    new URLSearchParams(
      stripQueryPrefix(
        input ??
          "",
      ),
    );

  params.sort();

  return params.toString();
}

export function sortQueryString(
  input:
    | string
    | undefined
    | null,
): string {
  return normalizeQueryString(
    input,
  );
}

/* -------------------------------------------------------------------------- */
/* Internal Helpers                                                           */
/* -------------------------------------------------------------------------- */

function stripQueryPrefix(
  input:
    | string,
): string {
  let value =
    input;

  if (
    value.startsWith(
      "?",
    )
  ) {
    value =
      value.slice(
        1,
      );
  }

  const hashIndex =
    value.indexOf(
      "#",
    );

  if (
    hashIndex !==
      -1
  ) {
    value =
      value.slice(
        0,
        hashIndex,
      );
  }

  return value;
}

function appendQueryValue(
  target:
    | Record<
        string,
        string | string[]
      >,
  key:
    | string,
  value:
    | string,
): void {
  const existing =
    target[key];

  if (
    existing ===
      undefined
  ) {
    target[key] =
      value;

    return;
  }

  if (
    Array.isArray(
      existing,
    )
  ) {
    existing.push(
      value,
    );

    return;
  }

  target[key] = [
    existing,
    value,
  ];
}

function appendStringifiedValue(
  parts:
    | string[],
  key:
    | string,
  value:
    | QueryStringPrimitive,
  options:
    | QueryStringStringifyOptions,
): void {
  if (
    value ===
      undefined &&
    options.skipUndefined !==
      false
  ) {
    return;
  }

  if (
    value ===
      null &&
    options.skipNull !==
      false
  ) {
    return;
  }

  if (
    value ===
      "" &&
    options.skipEmptyString
  ) {
    return;
  }

  const normalizedValue =
    value ===
      null ||
    value ===
      undefined
      ? ""
      : String(
          value,
        );

  const encodedKey =
    encodeQueryComponent(
      key,
      options.encodeSpaceAsPlus ??
        false,
    );

  const encodedValue =
    encodeQueryComponent(
      normalizedValue,
      options.encodeSpaceAsPlus ??
        false,
    );

  parts.push(
    `${encodedKey}=${encodedValue}`,
  );
}
