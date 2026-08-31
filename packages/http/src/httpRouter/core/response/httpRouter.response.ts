        params:
          match.params,
        query:
          parseQuery(
            parsed.searchParams,
          ),
        route:
          match.route ??
          createFallbackRoute(
            path,
            method,
          ),
        state,
        middleware:
          createMiddlewareContext(
            request,
            signal,
          ),
        signal,
      } as HttpRouterContext;

    if (
      match.matched &&
      match.route
    ) {
      const response =
        await executeRoute(
          match.route,
          routerContext,
        );

      return {
        response:
          normalizeResponse(
            response,
          ),
        route:
          match.route,
      };
    }

    if (
      method.toUpperCase() ===
        "OPTIONS" &&
      match.allowedMethods.length >
        0 &&
      this.options.automaticOptions
    ) {
      return {
        response:
          createOptionsResponse(
            match.allowedMethods,
          ),
        route:
          undefined,
      };
    }

    if (
      match.allowedMethods.length >
      0
    ) {
      const response =
        await this.methodNotAllowedHandler(
          {
            request,
            path,
            method,
            signal,
            state,
          },
          match.allowedMethods,
        );

      return {
        response:
          normalizeResponse(
            response,
          ),
        route:
          undefined,
      };
    }

    const response =
      await this.notFoundHandler(
        {
          request,
          path,
          method,
          signal,
          state,
        },
      );

    return {
      response:
        normalizeResponse(
          response,
        ),
      route:
        undefined,
    };
  }

  /* ------------------------------------------------------------------------ */
  /* Internals                                                                */
  /* ------------------------------------------------------------------------ */

  private register(
    method:
      | HttpMethod
      | "*",
    path:
      | string,
    handler:
      | RouterHandler,
    options:
      | RouteOptions,
  ):
    () => void {
    const normalizedMethod =
      normalizeMethod(
        method,
      );

    const normalizedPath =
      normalizePath(
        path,
      );

    if (
      typeof handler !==
      "function"
    ) {
      throw new HttpRouterError(
        "Route handler must be a function.",
      );
    }

    const compiled =
      compileRoute(
        normalizedPath,
        this.options
          .strictTrailingSlash ||
          options.strictTrailingSlash ===
            true,
        this.options.caseSensitive,
      );

