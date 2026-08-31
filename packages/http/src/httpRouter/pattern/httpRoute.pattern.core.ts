function compileRoute(
  path:
    | string,
  strictTrailingSlash:
    | boolean,
  caseSensitive:
    | boolean,
):
  | {
      readonly segments:
        | readonly CompiledSegment[];

      readonly score:
        | number;

      readonly strictTrailingSlash:
        | boolean;
    } {
  const normalized =
    normalizePath(
      path,
    );

  const rawSegments =
    splitPath(
      normalized,
    );

  const segments:
    | CompiledSegment[] =
    [];

  let score =
    0;

  for (
    const segment of
    rawSegments
  ) {
    if (
      segment ===
      "*"
    ) {
      segments.push({
        type:
          "wildcard",
        name:
          "wildcard",
      });

      score +=
        1;

      continue;
    }

    if (
      segment.startsWith(
        "*",
      )
    ) {
      const name =
        segment.slice(
          1,
        );

      validateParameterName(
        name,
        path,
      );

      segments.push({
        type:
          "wildcard",
        name,
      });

      score +=
        1;

      continue;
    }

    if (
      segment.startsWith(
        ":",
      )
    ) {
      const parsed =
        parseParameter(
          segment,
          path,
        );

      segments.push(
        parsed,
      );

      score +=
        parsed.optional
          ? 20
          : 30;

      continue;
    }

    if (
      segment.includes(
        "{",
      ) ||
      segment.includes(
        "}",
      )
    ) {
      const parsed =
        parseBraceParameter(
          segment,
          path,
        );

      segments.push(
        parsed,
      );

      score +=
        parsed.optional
          ? 20
          : 30;

      continue;
    }

    segments.push({
      type:
        "static",
      value:
        caseSensitive
          ? segment
          : segment.toLowerCase(),
    });

    score +=
      100 +
      segment.length;
  }

  if (
    normalized ===
    "/"
  ) {
