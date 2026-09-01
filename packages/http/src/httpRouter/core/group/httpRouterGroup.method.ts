/**
 * HTTP router group — additional methods and private helpers.
 *
 * Continuation of the HttpRouterGroup class defined in
 * httpRouterGroup.core.ts. Contains the all(), group(),
 * resolve(), and mergeOptions() methods.
 */

import type {
  HttpMethod,
  RouterHandler,
  RouteOptions,
} from "../types/httpRouter.type.js";

import type {
  HttpRouter,
} from "../manage/httpRouter.manage.js";

import type {
  HttpRouterGroup,
} from "./httpRouterGroup.core.js";

/* -------------------------------------------------------------------------- */
/* Method Continuation                                                        */
/* -------------------------------------------------------------------------- */

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
    this.router.group(
      this.resolve(
        prefix,
      ),
      (
        group,
      ) => {
        configure(
          group,
        );
      },
      this.mergeOptions(
        options,
      ),
    );
  }

  private resolve(
    path:
      | string,
  ):
    | string {
    const left =
      this.prefix ===
        "/"
        ? ""
        : this.prefix.replace(
            /\/+$/,
            "",
          );

    const right =
      path ===
        "/"
        ? ""
        : path.replace(
            /^\/+/,
            "",
          );

    return (
      `${left}/${right}` ||
      "/"
    );
  }

  private mergeOptions(
    options:
      | RouteOptions,
  ):
    | RouteOptions {
    return {
      name:
        options.name ??
        this.defaults.name,

      middleware:
        [
          ...(this.defaults.middleware ??
            []),
          ...(options.middleware ??
            []),
        ],

      metadata:
        {
          ...(this.defaults.metadata ??
            {}),
          ...(options.metadata ??
            {}),
        },

      strictTrailingSlash:
        options.strictTrailingSlash ??
        this.defaults.strictTrailingSlash,
    };
  }
}
