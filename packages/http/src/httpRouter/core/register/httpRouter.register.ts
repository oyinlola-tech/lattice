export class HttpRouter {
  private readonly routes:
    | CompiledRoute[] =
    [];

  private readonly options:
    | Required<
        Pick<
          RouterOptions,
          | "caseSensitive"
          | "strictTrailingSlash"
          | "automaticHead"
          | "automaticOptions"
        >
      >;

  private readonly notFoundHandler:
    | RouterNotFoundHandler;

  private readonly methodNotAllowedHandler:
    | RouterMethodNotAllowedHandler;

  private sequence =
    0;

  constructor(
    options:
      | RouterOptions = {},
  ) {
    this.options = {
      caseSensitive:
        options.caseSensitive ??
        false,

      strictTrailingSlash:
        options.strictTrailingSlash ??
        false,

      automaticHead:
        options.automaticHead ??
        true,

      automaticOptions:
        options.automaticOptions ??
        true,
    };

    this.notFoundHandler =
      options.notFoundHandler ??
      defaultNotFoundHandler;

    this.methodNotAllowedHandler =
      options.methodNotAllowedHandler ??
      defaultMethodNotAllowedHandler;
  }

  /* ------------------------------------------------------------------------ */
  /* Route Registration                                                       */
  /* ------------------------------------------------------------------------ */

  add(
    definition:
      | RouteDefinition,
  ):
    () => void {
    const methods =
      normalizeMethods(
        definition.method,
      );

    for (
      const method of
      methods
    ) {
      this.register(
        method,
        definition.path,
        definition.handler,
        {
          name:
            definition.name,
          middleware:
            definition.middleware,
          metadata:
            definition.metadata,
          strictTrailingSlash:
            definition.strictTrailingSlash,
        },
      );
    }

    return () => {
      for (
        const method of
        methods
      ) {
        this.remove(
          method,
          definition.path,
        );
      }
    };
  }

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
    return this.register(
      method,
      path,
      handler,
      options,
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
