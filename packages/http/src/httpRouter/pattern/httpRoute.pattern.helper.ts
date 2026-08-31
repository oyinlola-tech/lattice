  let pattern:
    | RegExp
    | undefined;

  if (
    expression
  ) {
    try {
      pattern =
        new RegExp(
          `^(?:${expression})$`,
        );
    } catch (
      error
    ) {
      throw new InvalidRoutePatternError(
        path,
        `Invalid parameter expression: ${
          error instanceof Error
            ? error.message
            : String(
                error,
              )
        }`,
      );
    }
  }

  return {
    type:
      "parameter",
    name,
    optional,
    pattern,
  };
}

/* -------------------------------------------------------------------------- */
/* Matching Helpers                                                           */
/* -------------------------------------------------------------------------- */

