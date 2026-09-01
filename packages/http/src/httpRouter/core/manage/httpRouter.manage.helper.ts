/**
 * HTTP router management — additional route management helpers.
 *
 * Continuation of the HttpRouter class from httpRouter.manage.ts.
 * Contains the remove(), clear(), count(), list(), and find() methods.
 */

import type {
  HttpMethod,
  MatchedRoute,
} from "../types/httpRouter.type.js";

import {
  normalizeMethod,
} from "../util/httpRoute.util.helper.js";

import {
  normalizePath,
} from "../util/httpRoute.util.js";

/* -------------------------------------------------------------------------- */
/* Method Continuation                                                        */
/* -------------------------------------------------------------------------- */

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
      (
        route,
      ) =>
        route.definition.id ===
        id,
    )?.definition;
  }
}
