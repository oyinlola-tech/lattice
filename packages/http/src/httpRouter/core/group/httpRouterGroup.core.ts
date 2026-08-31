export class HttpRouterGroup {
  constructor(
    private readonly router:
      | HttpRouter,
    private readonly prefix:
      | string,
    private readonly defaults:
      | RouteOptions = {},
  ) {}

  on(
    method:
      | HttpMethod
      | "*",
    path:
      | string,
    handler:
      | RouterHandler,
    options:
      | RouteOptions = {},
  ):
    () => void {
    return this.router.on(
      method,
      this.resolve(
        path,
      ),
      handler,
      this.mergeOptions(
        options,
      ),
    );
  }

  get(
    path:
      | string,
    handler:
      | RouterHandler,
    options:
      | RouteOptions = {},
  ):
    () => void {
    return this.on(
      "GET",
      path,
      handler,
      options,
    );
  }

  head(
    path:
      | string,
    handler:
      | RouterHandler,
    options:
      | RouteOptions = {},
  ):
    () => void {
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
