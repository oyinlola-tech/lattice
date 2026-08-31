/**
 * Compose, combine, and with middleware factories.
 *
 * @module httpMiddleware/builtin/compose
 */

import type {
  HttpMiddleware,
  HttpMiddlewareContext,
} from "../../httpMiddleware.type.js";

import type {
  HttpResponseContext as ResponseContext,
} from "../../../httpResponse/httpResponse.context.js";

export function composeMiddleware(
  ...middlewares:
    | readonly HttpMiddleware[]
):
  | HttpMiddleware {
  return async (
    context,
    next,
  ) => {
    let index =
      -1;

    const dispatch =
      async (
        i:
          | number,
      ): Promise<ResponseContext> => {
        if (
          i <=
          index
        ) {
          throw new Error(
            "composeMiddleware() called multiple times.",
          );
        }

        index =
          i;

        const middleware =
          middlewares[i];

        if (
          !middleware
        ) {
          return next();
        }

        return middleware(
          context,
          () =>
            dispatch(
              i +
                1,
            ),
        ) as Promise<ResponseContext>;
      };

    return dispatch(
      0,
    );
  };
}

export function combineMiddleware(
  ...middlewares:
    | readonly HttpMiddleware[]
):
  | HttpMiddleware {
  return composeMiddleware(
    ...middlewares,
  );
}

export function withMiddleware(
  handler:
    | ((
        context:
          | HttpMiddlewareContext,
      ) =>
        | void
        | Promise<void>),
  ...middlewares:
    | readonly HttpMiddleware[]
):
  | HttpMiddleware {
  const composed =
    composeMiddleware(
      ...middlewares,
    );

  return async (
    context,
    next,
  ) => {
    const result =
      await composed(
        context,
        next,
      );

    await handler(
      context,
    );

    return result;
  };
}
