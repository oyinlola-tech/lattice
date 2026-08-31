    options:
      | RouteOptions = {},
  ):
    () => void {
    return this.on(
      "PUT",
      path,
      handler,
      options,
    );
  }

  patch(
    path:
      | string,
    handler:
      | RouterHandler,
    options:
      | RouteOptions = {},
  ):
    () => void {
    return this.on(
      "PATCH",
      path,
      handler,
      options,
    );
  }

  delete(
    path:
      | string,
    handler:
      | RouterHandler,
    options:
      | RouteOptions = {},
  ):
    () => void {
    return this.on(
      "DELETE",
      path,
      handler,
      options,
    );
  }

  options(
    path:
      | string,
    handler:
      | RouterHandler,
    options:
      | RouteOptions = {},
  ):
    () => void {
    return this.on(
      "OPTIONS",
      path,
      handler,
      options,
    );
  }

  connect(
    path:
      | string,
    handler:
      | RouterHandler,
    options:
      | RouteOptions = {},
  ):
    () => void {
    return this.on(
      "CONNECT",
      path,
      handler,
      options,
    );
  }

  trace(
    path:
      | string,
    handler:
      | RouterHandler,
    options:
      | RouteOptions = {},
  ):
    () => void {
    return this.on(
      "TRACE",
      path,
      handler,
      options,
    );
  }

  all(
    path:
      | string,
    handler:
      | RouterHandler,
    options:
      | RouteOptions = {},
  ):
    () => void {
    return this.on(
      "*",
      path,
      handler,
      options,
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Route Groups                                                             */
  /* ------------------------------------------------------------------------ */

  group(
    prefix:
      | string,
    configure:
       (group:
          | HttpRouterGroup) => void,
    options:
      | RouteOptions = {},
  ):
    | void {
    const group =
      new HttpRouterGroup(
        this,
        prefix,
        options,
      );

    configure(
      group,
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Route Management                                                         */
  /* ------------------------------------------------------------------------ */

  remove(
    method:
      | HttpMethod
      | "*",
    path:
      | string,
