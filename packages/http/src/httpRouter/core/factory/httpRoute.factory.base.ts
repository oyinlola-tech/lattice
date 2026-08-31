    return "*";
  }

  if (
    !isHttpMethod(
      normalized,
    )
  ) {
    throw new HttpRouterError(
      `Unsupported HTTP method "${method}".`,
    );
  }

  return normalized;
}

function normalizeMethods(
  method:
    | HttpMethod
    | readonly HttpMethod[]
    | "*",
):
  | readonly (
      | HttpMethod
      | "*"
    )[] {
  if (
    Array.isArray(
      method,
    )
  ) {
    return method.map(
      normalizeMethod,
    );
  }

  return [
    normalizeMethod(
      method,
    ),
  ];
}

function isHttpMethod(
  value:
    | string,
):
  value is HttpMethod {
  return (
    value ===
      "GET" ||
    value ===
      "HEAD" ||
    value ===
      "POST" ||
    value ===
      "PUT" ||
    value ===
      "PATCH" ||
    value ===
      "DELETE" ||
    value ===
      "OPTIONS" ||
    value ===
      "CONNECT" ||
    value ===
      "TRACE"
  );
}

function collectAllowedMethods(
  routes:
    | readonly CompiledRoute[],
  path:
    | string,
):
  | HttpMethod[] {
  const methods =
    new Set<HttpMethod>();

  for (
    const route of
    routes
  ) {
    if (
      !matchCompiledRoute(
        route,
        path,
        false,
      )
    ) {
      continue;
    }

    if (
      isHttpMethod(
        route.definition.method,
      )
    ) {
      methods.add(
        route.definition.method,
      );
    }
  }

  if (
    methods.has(
      "GET",
    ) &&
    !methods.has(
      "HEAD",
    )
  ) {
    methods.add(
      "HEAD",
    );
  }

  return [
    ...methods,
  ];
}

/* -------------------------------------------------------------------------- */
/* Response Helpers                                                           */
/* -------------------------------------------------------------------------- */

function normalizeResponse(
  value:
    | ResponseContext
    | Response
    | void,
):
  | ResponseContext {
  if (
    isResponseContext(
      value,
    )
  ) {
    return value;
  }

  if (
    typeof Response !==
      "undefined" &&
    value instanceof
      Response
  ) {
    return {
      response:
