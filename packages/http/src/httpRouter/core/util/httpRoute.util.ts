function getRequestMethod(request: RequestContext): string {
  const value = (
    request as unknown as {
      method?: string;
    }
  ).method;

  return (value ?? "GET").toUpperCase();
}

function getRequestUrl(request: RequestContext): string {
  const value = (
    request as unknown as {
      url?: string | URL;
    }
  ).url;

  if (value instanceof URL) {
    return value.toString();
  }

  return value ?? "/";
}

function getRequestSignal(request: RequestContext): AbortSignal | undefined {
  return (
    request as unknown as {
      signal?: AbortSignal;
    }
  ).signal;
}

function parseUrl(value: string): URL {
  try {
    return new URL(value, "http://zudojs.local");
  } catch {
    return new URL("/", "http://zudojs.local");
  }
}

function parseQuery(
  params: URLSearchParams,
): Readonly<Record<string, string | string[]>> {
  const result: Record<string, string | string[]> = {};

  for (const key of new Set(Array.from(params.keys()))) {
    const values = params.getAll(key);

    result[key] = values.length > 1 ? values : (values[0] ?? "");
  }

  return Object.freeze({
    ...result,
  });
}

/* -------------------------------------------------------------------------- */
/* Path Helpers                                                               */
/* -------------------------------------------------------------------------- */

function normalizePath(path: string): string {
  if (!path || path === "") {
    return "/";
  }

  const withoutQuery = path.split("?", 1)[0] ?? path;

  let normalized = withoutQuery.startsWith("/")
    ? withoutQuery
    : `/${withoutQuery}`;

  normalized = normalized.replace(/\/{2,}/g, "/");

  if (normalized.length > 1 && normalized.endsWith("/")) {
    normalized = normalized.slice(0, -1);
  }

  return normalized;
}

function splitPath(path: string): string[] {
  const normalized = normalizePath(path);

  if (normalized === "/") {
    return [];
  }

  return normalized.split("/").filter(Boolean);
}

function validateParameterName(name: string, path: string): void {
  if (!/^[a-zA-Z_][a-zA-Z0-9_-]*$/.test(name)) {
    throw new InvalidRoutePatternError(
      path,
      `Invalid parameter name "${name}".`,
    );
  }
}

function decodeRouteValue(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/* -------------------------------------------------------------------------- */
/* Method Helpers                                                             */
/* -------------------------------------------------------------------------- */

function normalizeMethod(method: string): HttpMethod | "*" {
  const normalized = method.toUpperCase();

  if (normalized === "*") {
    return "*";
  }

  if (isHttpMethod(normalized)) {
    return normalized;
  }

  throw new InvalidRoutePatternError(
    method,
    `Invalid HTTP method "${method}".`,
  );
}
