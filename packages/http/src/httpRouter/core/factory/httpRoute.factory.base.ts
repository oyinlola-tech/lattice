/**
 * HTTP route factory base helpers.
 *
 * Internal normalization, validation, and response utilities for route
 * creation and management.
 */

import type {
  HttpMethod,
  MatchedRoute,
  CompiledRoute,
} from "../types/httpRouter.type.js";

import {
  HttpRouterError,
} from "../error/httpRouter.error.js";

import {
  matchCompiledRoute,
} from "../../matching/httpRoute.matcher.core.js";

import type {
  HttpResponseContext as ResponseContext,
} from "../../httpResponse/httpResponse.context.js";

import {
  isResponseContext,
} from "../../httpRouter.context.js";

/* -------------------------------------------------------------------------- */
/* Method Helpers                                                             */
/* -------------------------------------------------------------------------- */

function normalizeMethod(
  method:
    | string,
):
  | HttpMethod
  | "*" {
  const normalized =
    method.toUpperCase();

  if (
    normalized ===
    "*"
  ) {
    return "*";
  }

  if (
    !isHttpMethod(
      normalized,
    )
  ) {
    throw new HttpRouterError(
      `Unsupported HTTP method "${method}".`,
    );
  }

  return normalized;
}

function normalizeMethods(
  method:
    | HttpMethod
    | readonly HttpMethod[]
    | "*",
):
  | readonly (
      | HttpMethod
      | "*"
    )[] {
  if (
    Array.isArray(
      method,
    )
  ) {
    return method.map(
      normalizeMethod,
    );
  }

  return [
    normalizeMethod(
      method,
    ),
  ];
}

function isHttpMethod(
  value:
    | string,
):
  value is HttpMethod {
  return (
    value ===
      "GET" ||
    value ===
      "HEAD" ||
    value ===
      "POST" ||
    value ===
      "PUT" ||
    value ===
      "PATCH" ||
    value ===
      "DELETE" ||
    value ===
      "OPTIONS" ||
    value ===
      "CONNECT" ||
    value ===
      "TRACE"
  );
}

function collectAllowedMethods(
  routes:
    | readonly CompiledRoute[],
  path:
    | string,
):
  | HttpMethod[] {
  const methods =
    new Set<HttpMethod>();

  for (
    const route of
    routes
  ) {
    if (
      !matchCompiledRoute(
        route,
        path,
        false,
      )
    ) {
      continue;
    }

    if (
      isHttpMethod(
        route.definition.method,
      )
    ) {
      methods.add(
        route.definition.method,
      );
    }
  }

  if (
    methods.has(
      "GET",
    ) &&
    !methods.has(
      "HEAD",
    )
  ) {
    methods.add(
      "HEAD",
    );
  }

  return [
    ...methods,
  ];
}

/* -------------------------------------------------------------------------- */
/* Response Helpers                                                           */
/* -------------------------------------------------------------------------- */

function normalizeResponse(
  value:
    | ResponseContext
    | Response
    | void,
):
  | ResponseContext {
  if (
    isResponseContext(
      value,
    )
  ) {
    return value;
  }

  if (
    typeof Response !==
      "undefined" &&
    value instanceof
      Response
  ) {
    return {
      response:
        value,
      status:
        value.status,
      headers:
        Object.fromEntries(
          value.headers.entries(),
        ),
    } as ResponseContext;
  }

  return {
    response:
      new Response(
        null,
        {
          status:
            204,
        },
      ),
  } as ResponseContext;
}

export {
  normalizeMethod,
  normalizeMethods,
  isHttpMethod,
  collectAllowedMethods,
  normalizeResponse,
};
