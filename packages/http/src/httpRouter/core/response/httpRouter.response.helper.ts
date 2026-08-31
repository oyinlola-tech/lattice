    const existing =
      this.routes.find(
        (
          route,
        ) =>
          route.definition.method ===
            normalizedMethod &&
          route.definition.path ===
            normalizedPath,
      );

    if (
      existing
    ) {
      throw new RouteConflictError(
        normalizedPath,
        normalizedMethod,
      );
    }

    this.sequence +=
      1;

    const definition:
      | MatchedRoute = {
      id:
        `route:${this.sequence}`,

      method:
        normalizedMethod,

      path:
        normalizedPath,

      name:
        options.name,

      params:
        {},

      metadata:
        Object.freeze({
          ...(options.metadata ??
            {}),
        }),

      handler,

      middleware:
        Object.freeze([
          ...(options.middleware ??
            []),
        ]),
    };

    this.routes.push({
      definition,
      segments:
        compiled.segments,
      score:
        compiled.score,
      strictTrailingSlash:
        compiled.strictTrailingSlash,
    });

    return () => {
      this.remove(
        normalizedMethod,
        normalizedPath,
      );
    };
  }

  private sortedRoutes():
    | CompiledRoute[] {
    return [
      ...this.routes,
    ].sort(
      (
        left,
        right,
      ) => {
        const score =
          right.score -
          left.score;

        if (
          score !==
          0
        ) {
          return score;
        }

        return (
          extractRouteSequence(
            left.definition.id,
          ) -
          extractRouteSequence(
            right.definition.id,
          )
        );
      },
    );
  }
}

/* -------------------------------------------------------------------------- */
/* Router Group                                                               */
/* -------------------------------------------------------------------------- */

