function compileRoutePattern(path: string): CompiledSegment[] {
  const segments: CompiledSegment[] = [];

  const parts = splitPath(path);

  for (const part of parts) {
    if (part.startsWith(":")) {
      segments.push(parseParameter(part, path));
    } else if (part.startsWith("*")) {
      segments.push({
        type: "wildcard",
        name: part.slice(1) || "*",
      });
    } else {
      segments.push({
        type: "literal",
        value: part,
      });
    }
  }

  return Object.freeze(segments);
}

function parseParameter(
  segment: string,
  path: string,
): CompiledSegmentParameter {
  let value = segment.slice(1);

  let optional = false;

  if (value.endsWith("?")) {
    optional = true;

    value = value.slice(0, -1);
  }

  let pattern: RegExp | undefined;

  const patternStart = value.indexOf("(");

  if (patternStart >= 0 && value.endsWith(")")) {
    const name = value.slice(0, patternStart);

    const expression = value.slice(patternStart + 1, -1);

    validateParameterName(name, path);

    try {
      pattern = new RegExp(`^(?:${expression})$`);
    } catch (error) {
      throw new InvalidRoutePatternError(
        path,
        `Invalid parameter expression: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }

    return {
      type: "parameter",
      name,
      optional,
      pattern,
    };
  }

  validateParameterName(value, path);

  return {
    type: "parameter",
    name: value,
    optional,
    pattern,
  };
}

function parseBraceParameter(
  segment: string,
  path: string,
): CompiledSegmentParameter {
  const match = segment.match(/^\{([a-zA-Z0-9_-]+)(\?)?(?::(.+))?\}$/);

  if (!match) {
    throw new InvalidRoutePatternError(
      path,
      `Invalid parameter segment "${segment}".`,
    );
  }

  const name = match[1];

  const optional = Boolean(match[2]);

  const expression = match[3];

  let pattern: RegExp | undefined;

  if (expression) {
    try {
      pattern = new RegExp(`^(?:${expression})$`);
    } catch (error) {
      throw new InvalidRoutePatternError(
        path,
        `Invalid parameter expression: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  return {
    type: "parameter",
    name,
    optional,
    pattern,
  };
}
