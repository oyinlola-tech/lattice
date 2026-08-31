      (
        route,
      ) =>
        route.definition.id ===
        id,
    )?.definition;
  }

  /* ------------------------------------------------------------------------ */
  /* Matching                                                                 */
  /* ------------------------------------------------------------------------ */

  match(
    method:
      | string,
    path:
      | string,
  ):
    | RouterMatch {
    const normalizedMethod =
      method.toUpperCase();

    const normalizedPath =
      normalizePath(
        path,
      );

    const candidates =
      this.sortedRoutes();

    const allowed =
      new Set<HttpMethod>();

    let pathMatched =
      false;

    for (
      const route of
      candidates
    ) {
      const params =
        matchCompiledRoute(
          route,
          normalizedPath,
          this.options.caseSensitive,
        );

      if (
        !params
      ) {
        continue;
      }

      pathMatched =
        true;

      const routeMethod =
        route.definition.method;

      if (
        routeMethod ===
          normalizedMethod ||
        routeMethod ===
          "*"
      ) {
        return {
          matched:
            true,
          route:
            route.definition,
          params,
          allowedMethods:
            Object.freeze(
              [
                ...collectAllowedMethods(
                  candidates,
                  normalizedPath,
                ),
              ],
            ),
          path:
            normalizedPath,
          method:
            normalizedMethod,
        };
      }

      if (
        isHttpMethod(
          routeMethod,
        )
      ) {
        allowed.add(
          routeMethod,
        );
      }
    }

    if (
      normalizedMethod ===
        "HEAD" &&
      this.options.automaticHead
    ) {
      for (
        const route of
        candidates
      ) {
        if (
          route.definition.method !==
          "GET"
        ) {
          continue;
        }

        const params =
          matchCompiledRoute(
            route,
            normalizedPath,
            this.options.caseSensitive,
          );

        if (
          params
        ) {
          return {
            matched:
              true,
            route:
              route.definition,
            params,
            allowedMethods:
              Object.freeze(
                [
                  ...collectAllowedMethods(
                    candidates,
                    normalizedPath,
                  ),
                  "HEAD",
                ],
              ),
            path:
              normalizedPath,
            method:
              normalizedMethod,
          };
        }
      }
    }

    if (
