/**
 * Security middleware factory.
 *
 * @module httpMiddleware/builtin/security
 */

import type {
  HttpMiddleware,
} from "../../httpMiddleware.type.js";

import type {
  HttpResponseContext as ResponseContext,
} from "../../../httpResponse/httpResponse.context.js";

export interface SecurityMiddlewareOptions {
  readonly strictTransportSecurity?:
    | string;

  readonly xContentTypeOptions?:
    | string;

  readonly xFrameOptions?:
    | string;

  readonly xXssProtection?:
    | string;

  readonly contentSecurityPolicy?:
    | string;

  readonly referrerPolicy?:
    | string;
}

export function createSecurityMiddleware(
  options:
    | SecurityMiddlewareOptions = {},
):
  | HttpMiddleware {
  return async (
    _context,
    next,
  ) => {
    const response =
      await next();

    const headers =
      new Headers(
        response.headers as Record<string, string>,
      );

    if (
      options.strictTransportSecurity
    ) {
      headers.set(
        "strict-transport-security",
        options.strictTransportSecurity,
      );
    }

    if (
      options.xContentTypeOptions
    ) {
      headers.set(
        "x-content-type-options",
        options.xContentTypeOptions,
      );
    }

    if (
      options.xFrameOptions
    ) {
      headers.set(
        "x-frame-options",
        options.xFrameOptions,
      );
    }

    if (
      options.xXssProtection
    ) {
      headers.set(
        "x-xss-protection",
        options.xXssProtection,
      );
    }

    if (
      options.contentSecurityPolicy
    ) {
      headers.set(
        "content-security-policy",
        options.contentSecurityPolicy,
      );
    }

    if (
      options.referrerPolicy
    ) {
      headers.set(
        "referrer-policy",
        options.referrerPolicy,
      );
    }

    return {
      ...response,
      headers,
    } as unknown as ResponseContext;
  };
}
