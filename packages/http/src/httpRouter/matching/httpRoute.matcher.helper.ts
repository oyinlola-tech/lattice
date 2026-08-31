    inputSegments.length
  ) {
    return undefined;
  }

  return Object.freeze({
    ...output,
  });
}

/* -------------------------------------------------------------------------- */
/* Route Execution                                                            */
/* -------------------------------------------------------------------------- */

async function executeRoute(
  route:
    | MatchedRoute,
  context:
    | HttpRouterContext,
):
  Promise<
    ResponseContext
    | Response
    | void
  > {
  let current:
    | ResponseContext
    | Response
    | void;

  if (
    route.middleware.length >
    0
  ) {
    current =
      await executeMiddlewareChain(
        route.middleware,
        context,
        async () =>
          route.handler(
            context,
          ),
      );
  } else {
    current =
      await route.handler(
        context,
      );
  }

  return current;
}

async function executeMiddlewareChain(
  middlewares:
    | readonly HttpMiddleware[],
  context:
    | HttpRouterContext,
  terminal:
    () =>
        Promise<
          ResponseContext
          | Response
          | void
        >,
):
  Promise<
    ResponseContext
    | Response
    | void
  > {
  const dispatch =
    async (
      index:
        | number,
    ):
      Promise<
        ResponseContext
        | Response
        | void
      > => {
      if (
        index >=
        middlewares.length
      ) {
        return terminal();
      }

      const middleware =
        middlewares[
          index
        ];

      let called =
        false;

      const next =
        async () => {
          if (
            called
          ) {
            throw new HttpRouterError(
              "Route middleware called next() more than once.",
            );
          }

          called =
            true;

          return dispatch(
            index + 1,
          ) as Promise<ResponseContext>;
        };

      const middlewareContext =
        context.middleware;

      const result =
        await middleware(
          middlewareContext,
          next,
        );

      return result;
    };

  return dispatch(
    0,
  );
}

/* -------------------------------------------------------------------------- */
/* Request Helpers                                                            */
/* -------------------------------------------------------------------------- */

