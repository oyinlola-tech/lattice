    return this.on(
      "HEAD",
      path,
      handler,
      options,
    );
  }

  post(
    path:
      | string,
    handler:
      | RouterHandler,
    options:
      | RouteOptions = {},
  ):
    () => void {
    return this.on(
      "POST",
      path,
      handler,
      options,
    );
  }

  put(
    path:
      | string,
    handler:
      | RouterHandler,
