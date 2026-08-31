      this.options.automaticOptions &&
      normalizedMethod ===
        "OPTIONS" &&
      pathMatched
    ) {
      return {
        matched:
          true,
        route:
          undefined,
        params:
          {},
        allowedMethods:
          Object.freeze(
            [
              ...collectAllowedMethods(
                candidates,
                normalizedPath,
              ),
              "OPTIONS",
            ],
          ),
        path:
          normalizedPath,
        method:
          normalizedMethod,
      };
    }

    return {
      matched:
        false,
      route:
        undefined,
      params:
        {},
      allowedMethods:
        Object.freeze(
          [
            ...allowed,
          ],
        ),
      path:
        normalizedPath,
      method:
        normalizedMethod,
    };
  }

  /* ------------------------------------------------------------------------ */
  /* Dispatch                                                                 */
  /* ------------------------------------------------------------------------ */

  async dispatch(
    request:
      | RequestContext,
    options:
      | {
          readonly signal?:
            | AbortSignal;

          readonly state?:
            | Map<string, unknown>;
        } = {},
  ):
    Promise<
      RouterResult
    > {
    const method =
      getRequestMethod(
        request,
      );

    const url =
      getRequestUrl(
        request,
      );

    const parsed =
      parseUrl(
        url,
      );

    const path =
      parsed.pathname;

    const match =
      this.match(
        method,
        path,
      );

    const signal =
      options.signal ??
      getRequestSignal(
        request,
      ) ??
      new AbortController()
        .signal;

    const state =
      options.state ??
      new Map<
        string,
        unknown
      >();

    const routerContext =
      {
        request,
