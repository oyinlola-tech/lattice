
  normalized =
    normalized.replace(
      /\/{2,}/g,
      "/",
    );

  if (
    normalized.length >
      1 &&
    normalized.endsWith(
      "/",
    )
  ) {
    normalized =
      normalized.slice(
        0,
        -1,
      );
  }

  return normalized;
}

function splitPath(
  path:
    | string,
):
  | string[] {
  const normalized =
    normalizePath(
      path,
    );

  if (
    normalized ===
    "/"
  ) {
    return [];
  }

  return normalized
    .split(
      "/",
    )
    .filter(
      Boolean,
    );
}

function validateParameterName(
  name:
    | string,
  path:
    | string,
):
  | void {
  if (
    !/^[a-zA-Z_][a-zA-Z0-9_-]*$/.test(
      name,
    )
  ) {
    throw new InvalidRoutePatternError(
      path,
      `Invalid parameter name "${name}".`,
    );
  }
}

function decodeRouteValue(
  value:
    | string,
):
  | string {
  try {
    return decodeURIComponent(
      value,
    );
  } catch {
    return value;
  }
}

/* -------------------------------------------------------------------------- */
/* Method Helpers                                                             */
/* -------------------------------------------------------------------------- */

function normalizeMethod(
  method:
    | string,
):
  | HttpMethod
  | "*" {
  const normalized =
    method.toUpperCase();

  if (
    normalized ===
    "*"
  ) {
