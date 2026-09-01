function matchCompiledRoute(
  route: CompiledRoute,
  path: string,
  caseSensitive: boolean,
): Record<string, string> {
  const segments = route.segments;

  const pathParts = splitPath(path);

  const params: Record<string, string> = {};

  let pathIndex = 0;

  for (const segment of segments) {
    if (pathIndex >= pathParts.length) {
      if (segment.type === "parameter" && segment.optional) {
        continue;
      }

      return null;
    }

    const part = pathParts[pathIndex];

    switch (segment.type) {
      case "literal":
        if (
          caseSensitive
            ? part === segment.value
            : part.toLowerCase() === segment.value.toLowerCase()
        ) {
          pathIndex += 1;
        } else {
          return null;
        }
        break;

      case "parameter":
        params[segment.name] = decodeRouteValue(part);

        pathIndex += 1;
        break;

      case "wildcard":
        params[segment.name] = decodeRouteValue(
          pathParts.slice(pathIndex).join("/"),
        );

        pathIndex = pathParts.length;
        break;

      default:
        return null;
    }
  }

  if (pathIndex < pathParts.length) {
    return null;
  }

  return Object.freeze(params);
}

function collectAllowedMethods(
  routes: CompiledRoute[],
  path: string,
): HttpMethod[] {
  const methods = new Set<HttpMethod>();

  for (const route of routes) {
    const params = matchCompiledRoute(route, path, true);

    if (params) {
      if (route.definition.method !== "*") {
        methods.add(route.definition.method);
      }
    }
  }

  return Object.freeze([...methods]);
}
