function matchCompiledRoute(
  route:
    | CompiledRoute,
  path:
    | string,
  caseSensitive:
    | boolean,
):
  | Readonly<
      Record<string, string>
    >
  | undefined {
  const routePath =
    normalizePath(
      path,
    );

  const inputSegments =
    splitPath(
      routePath,
    );

  const output:
    | Record<string, string> =
    {};

  const routeSegments =
    route.segments;

  let inputIndex =
    0;

  for (
    let routeIndex =
      0;
    routeIndex <
    routeSegments.length;
    routeIndex +=
      1
  ) {
    const segment =
      routeSegments[
        routeIndex
      ];

    if (
      segment.type ===
      "wildcard"
    ) {
      const remaining =
        inputSegments
          .slice(
            inputIndex,
          )
          .join(
            "/",
          );

      output[
        segment.name
      ] =
        decodeRouteValue(
          remaining,
        );

      inputIndex =
        inputSegments.length;

      break;
    }

    const input =
      inputSegments[
        inputIndex
      ];

    if (
      input ===
        undefined &&
      segment.type ===
        "parameter" &&
      segment.optional
    ) {
      continue;
    }

    if (
      input ===
      undefined
    ) {
      return undefined;
    }

    if (
      segment.type ===
      "static"
    ) {
      const expected =
        caseSensitive
          ? segment.value
          : segment.value.toLowerCase();

      const actual =
        caseSensitive
          ? input
          : input.toLowerCase();

      if (
        expected !==
        actual
      ) {
        return undefined;
      }

      inputIndex +=
        1;

      continue;
    }

    if (
      segment.type ===
      "parameter"
    ) {
      const decoded =
        decodeRouteValue(
          input,
        );

      if (
        segment.pattern &&
        !segment.pattern.test(
          decoded,
        )
      ) {
        return undefined;
      }

      output[
        segment.name
      ] =
        decoded;

      inputIndex +=
        1;
    }
  }

  if (
    inputIndex !==
