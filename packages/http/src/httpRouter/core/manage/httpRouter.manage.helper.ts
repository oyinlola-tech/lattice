  ):
    | boolean {
    const normalizedMethod =
      normalizeMethod(
        method,
      );

    const index =
      this.routes.findIndex(
        (
          route,
        ) =>
          route.definition.method ===
            normalizedMethod &&
          route.definition.path ===
            normalizePath(
              path,
            ),
      );

    if (
      index ===
      -1
    ) {
      return false;
    }

    this.routes.splice(
      index,
      1,
    );

    return true;
  }

  clear():
    | void {
    this.routes.length =
      0;
  }

  count():
    | number {
    return this.routes.length;
  }

  list():
    | readonly MatchedRoute[] {
    return Object.freeze(
      this.sortedRoutes().map(
        (
          route,
        ) =>
          route.definition,
      ),
    );
  }

  find(
    id:
      | string,
  ):
    | MatchedRoute
    | undefined {
    return this.routes.find(
