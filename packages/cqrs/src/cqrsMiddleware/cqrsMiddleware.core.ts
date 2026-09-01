import {
  BaseError,
  ErrorCategory,
  ErrorCode,
  ErrorSeverity,
} from "@oyinlola141/lattice-errors";

import type {
  Command,
  Query,
  CqrsContext,
  CqrsMiddleware,
  CommandMiddleware,
  QueryMiddleware,
} from "../cqrsTypes/cqrsTypes.type.js";

/**
 * Next function used by middleware.
 */
export type CqrsNext = <
  TRequest extends Command | Query,
>(
  request: TRequest,
  context?: CqrsContext,
) => Promise<unknown>;

/**
 * Configuration for middleware execution.
 */
export interface MiddlewareOptions {
  readonly name?: string;
  readonly enabled?: boolean;
}

/**
 * Middleware that measures command or query execution time.
 */
export function timingMiddleware(
  options: MiddlewareOptions = {},
): CqrsMiddleware {
  const name =
    options.name ??
    "timing";

  return async (
    request,
    context,
    next,
  ) => {
    if (
      options.enabled === false
    ) {
      return next(
        request,
        context,
      );
    }

    const startedAt =
      Date.now();

    try {
      return await next(
        request,
        context,
      );
    } finally {
      const duration =
        Date.now() -
        startedAt;

      void name;
      void duration;
    }
  };
}

/**
 * Middleware that catches unknown exceptions and normalizes them
 * into BaseError instances.
 */
export function errorMiddleware(
  options: MiddlewareOptions = {},
): CqrsMiddleware {
  return async (
    request,
    context,
    next,
  ) => {
    if (
      options.enabled === false
    ) {
      return next(
        request,
        context,
      );
    }

    try {
      return await next(
        request,
        context,
      );
    } catch (error) {
      if (
        error instanceof
        BaseError
      ) {
        throw error;
      }

      throw new BaseError(
        error instanceof Error
          ? error.message
          : "CQRS execution failed.",
        {
          code:
            ErrorCode.INTERNAL_ERROR,
          category:
            ErrorCategory.SYSTEM,
          severity:
            ErrorSeverity.ERROR,
          statusCode:
            500,
          expose:
            false,
          isOperational:
            false,
          cause:
            error,
          metadata: {
            requestType:
              request.type,
          },
        },
      );
    }
  };
}

/**
 * Middleware that validates the basic CQRS request structure.
 */
export function validationMiddleware(
  options: MiddlewareOptions = {},
): CqrsMiddleware {
  return async (
    request,
    context,
    next,
  ) => {
    if (
      options.enabled === false
    ) {
      return next(
        request,
        context,
      );
    }

    if (
      !request ||
      typeof request !==
        "object" ||
      typeof request.type !==
        "string" ||
      request.type.trim()
        .length === 0
    ) {
      throw new BaseError(
        "A valid CQRS request with a type is required.",
        {
          code:
            ErrorCode.INVALID_INPUT,
          category:
            ErrorCategory.VALIDATION,
          severity:
            ErrorSeverity.WARNING,
          statusCode:
            400,
          expose:
            true,
          isOperational:
            true,
        },
      );
    }

    return next(
      request,
      context,
    );
  };
}

/**
 * Middleware that adds execution metadata to the CQRS context.
 */
export function contextMiddleware(
  options: MiddlewareOptions = {},
): CqrsMiddleware {
  return async (
    request,
    context,
    next,
  ) => {
    if (
      options.enabled === false
    ) {
      return next(
        request,
        context,
      );
    }

    const enrichedContext:
      CqrsContext = {
      ...(context ?? {}),
      metadata: {
        ...(context?.metadata ??
          {}),
        cqrsRequestType:
          request.type,
      },
    };

    return next(
      request,
      enrichedContext,
    );
  };
}

/**
 * Middleware that prevents concurrent execution of the same request type
 * when used with a shared lock implementation.
 */
export interface CqrsLock {
  acquire(
    key: string,
  ):
    | (() => void)
    | Promise<() => void>;
}

/**
 * Creates locking middleware.
 */
export function lockMiddleware(
  lock: CqrsLock,
  options: MiddlewareOptions = {},
): CqrsMiddleware {
  if (
    !lock ||
    typeof lock.acquire !==
      "function"
  ) {
    throw new TypeError(
      "A valid CQRS lock implementation is required.",
    );
  }

  return async (
    request,
    context,
    next,
  ) => {
    if (
      options.enabled === false
    ) {
      return next(
        request,
        context,
      );
    }

    const release =
      await lock.acquire(
        request.type,
      );

    try {
      return await next(
        request,
        context,
      );
    } finally {
      release();
    }
  };
}

/**
 * Adapts command-specific middleware to generic CQRS middleware.
 */
export function commandMiddleware(
  middleware: CommandMiddleware,
): CqrsMiddleware {
  return async (
    request,
    context,
    next,
  ) => {
    return middleware(
      request as Command,
      context,
      async (
        command,
        nextContext,
      ) =>
        next(
          command,
          nextContext,
        ),
    );
  };
}

/**
 * Adapts query-specific middleware to generic CQRS middleware.
 */
export function queryMiddleware(
  middleware: QueryMiddleware,
): CqrsMiddleware {
  return async (
    request,
    context,
    next,
  ) => {
    return middleware(
      request as Query,
      context,
      async (
        query,
        nextContext,
      ) =>
        next(
          query,
          nextContext,
        ),
    );
  };
}

/**
 * Combines multiple middleware functions into a single middleware.
 */
export function composeMiddleware(
  middleware: readonly CqrsMiddleware[],
): CqrsMiddleware {
  const stack = [
    ...middleware,
  ];

  return async (
    request,
    context,
    terminal,
  ) => {
    let index = -1;

    const dispatch = async (
      currentIndex: number,
      currentRequest:
        | Command
        | Query,
      currentContext?:
        CqrsContext,
    ): Promise<unknown> => {
      if (
        currentIndex <= index
      ) {
        throw new Error(
          "CQRS middleware called next() more than once.",
        );
      }

      index =
        currentIndex;

      const current =
        stack[currentIndex];

      if (!current) {
        return terminal(
          currentRequest,
          currentContext,
        );
      }

      return current(
        currentRequest,
        currentContext,
        (
          nextRequest,
          nextContext,
        ) =>
          dispatch(
            currentIndex + 1,
            nextRequest,
            nextContext,
          ),
      );
    };

    return dispatch(
      0,
      request,
      context,
    );
  };
}

/**
 * Creates a middleware that runs a callback before execution.
 */
export function beforeMiddleware(
  callback: (
    request:
      | Command
      | Query,
    context?: CqrsContext,
  ) =>
    | void
    | Promise<void>,
): CqrsMiddleware {
  return async (
    request,
    context,
    next,
  ) => {
    await callback(
      request,
      context,
    );

    return next(
      request,
      context,
    );
  };
}

/**
 * Creates a middleware that runs a callback after successful execution.
 */
export function afterMiddleware(
  callback: (
    request:
      | Command
      | Query,
    result: unknown,
    context?: CqrsContext,
  ) =>
    | void
    | Promise<void>,
): CqrsMiddleware {
  return async (
    request,
    context,
    next,
  ) => {
    const result =
      await next(
        request,
        context,
      );

    await callback(
      request,
      result,
      context,
    );

    return result;
  };
}

/**
 * Creates a middleware that runs a callback when execution fails.
 */
export function onErrorMiddleware(
  callback: (
    request:
      | Command
      | Query,
    error: unknown,
    context?: CqrsContext,
  ) =>
    | void
    | Promise<void>,
): CqrsMiddleware {
  return async (
    request,
    context,
    next,
  ) => {
    try {
      return await next(
        request,
        context,
      );
    } catch (error) {
      await callback(
        request,
        error,
        context,
      );

      throw error;
    }
  };
}