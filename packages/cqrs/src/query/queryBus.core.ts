import {
  BaseError,
  ErrorCategory,
  ErrorCode,
  ErrorSeverity,
} from "@lattice/errors";

import type {
  Query,
  QueryBus as QueryBusContract,
  QueryHandlerLike,
  CqrsContext,
  CqrsMiddleware,
} from "../cqrsTypes/cqrsTypes.type.js";

import {
  QueryHandler,
  executeQueryHandler,
} from "../query/queryHandler.core.js";

/**
 * Options for constructing a query bus.
 */
export interface QueryBusOptions {
  readonly middleware?: readonly CqrsMiddleware[];

  /**
   * Creates a default execution context when one is not supplied.
   */
  readonly contextFactory?: () =>
    | CqrsContext
    | Promise<CqrsContext>;
}

/**
 * Registered query handler.
 */
export interface QueryRegistration<
  TQuery extends Query = Query,
  TResult = unknown,
> {
  readonly queryType: TQuery["type"];

  readonly handler: QueryHandlerLike<
    TQuery,
    TResult
  >;
}

/**
 * Query bus implementation.
 *
 * The query bus resolves a handler by query type and executes it
 * through the registered middleware pipeline.
 */
export class QueryBus
  implements QueryBusContract {
  private readonly handlers =
    new Map<
      string,
      QueryHandlerLike
    >();

  private readonly middleware: CqrsMiddleware[];

  private readonly contextFactory?: () =>
    | CqrsContext
    | Promise<CqrsContext>;

  constructor(
    options: QueryBusOptions = {},
  ) {
    this.middleware = [
      ...(options.middleware ??
        []),
    ];

    this.contextFactory =
      options.contextFactory;
  }

  /**
   * Registers a query handler.
   */
  public register<
    TQuery extends Query,
    TResult = unknown,
  >(
    queryType: TQuery["type"],
    handler: QueryHandlerLike<
      TQuery,
      TResult
    >,
  ): this {
    if (
      !queryType.trim()
    ) {
      throw new TypeError(
        "Query type cannot be empty.",
      );
    }

    if (
      !handler
    ) {
      throw new TypeError(
        `A handler is required for query "${queryType}".`,
      );
    }

    if (
      this.handlers.has(
        queryType,
      )
    ) {
      throw new Error(
        `A handler is already registered for query "${queryType}".`,
      );
    }

    this.handlers.set(
      queryType,
      handler as QueryHandlerLike,
    );

    return this;
  }

  /**
   * Registers multiple query handlers.
   */
  public registerMany(
    registrations: readonly QueryRegistration[],
  ): this {
    for (
      const registration of registrations
    ) {
      this.register(
        registration.queryType,
        registration.handler,
      );
    }

    return this;
  }

  /**
   * Replaces an existing query handler.
   */
  public replace<
    TQuery extends Query,
    TResult = unknown,
  >(
    queryType: TQuery["type"],
    handler: QueryHandlerLike<
      TQuery,
      TResult
    >,
  ): this {
    if (
      !queryType.trim()
    ) {
      throw new TypeError(
        "Query type cannot be empty.",
      );
    }

    this.handlers.set(
      queryType,
      handler as QueryHandlerLike,
    );

    return this;
  }

  /**
   * Removes a query handler.
   */
  public unregister(
    queryType: string,
  ): boolean {
    return this.handlers.delete(
      queryType,
    );
  }

  /**
   * Determines whether a query handler is registered.
   */
  public has(
    queryType: string,
  ): boolean {
    return this.handlers.has(
      queryType,
    );
  }

  /**
   * Returns the registered handler for a query type.
   */
  public getHandler<
    TQuery extends Query,
    TResult = unknown,
  >(
    queryType: TQuery["type"],
  ):
    | QueryHandlerLike<
        TQuery,
        TResult
      >
    | undefined {
    return this.handlers.get(
      queryType,
    ) as
      | QueryHandlerLike<
          TQuery,
          TResult
        >
      | undefined;
  }

  /**
   * Executes a query.
   */
  public async execute<
    TQuery extends Query,
    TResult = unknown,
  >(
    query: TQuery,
    context?: CqrsContext,
  ): Promise<TResult> {
    this.validateQuery(
      query,
    );

    const handler =
      this.getHandler<
        TQuery,
        TResult
      >(
        query.type,
      );

    if (!handler) {
      throw new BaseError(
        `No handler is registered for query "${query.type}".`,
        {
          code:
            ErrorCode.QUERY_HANDLER_NOT_FOUND,
          category:
            ErrorCategory.SYSTEM,
          severity:
            ErrorSeverity.ERROR,
          statusCode:
            500,
          expose:
            false,
          isOperational:
            true,
          metadata: {
            queryType:
              query.type,
          },
        },
      );
    }

    const executionContext =
      await this.resolveContext(
        context,
      );

    const pipeline =
      this.buildPipeline<
        TQuery,
        TResult
      >(
        handler,
      );

    return pipeline(
      query,
      executionContext,
    );
  }

  /**
   * Adds middleware to the end of the pipeline.
   */
  public use(
    middleware: CqrsMiddleware,
  ): this {
    if (
      typeof middleware !==
      "function"
    ) {
      throw new TypeError(
        "Query middleware must be a function.",
      );
    }

    this.middleware.push(
      middleware,
    );

    return this;
  }

  /**
   * Returns the number of registered handlers.
   */
  public size(): number {
    return this.handlers.size;
  }

  /**
   * Removes all registered handlers.
   */
  public clear(): void {
    this.handlers.clear();
  }

  /**
   * Returns all registered query types.
   */
  public getQueryTypes(): readonly string[] {
    return [
      ...this.handlers.keys(),
    ];
  }

  /**
   * Builds the query execution pipeline.
   */
  private buildPipeline<
    TQuery extends Query,
    TResult,
  >(
    handler: QueryHandlerLike<
      TQuery,
      TResult
    >,
  ): (
    query: TQuery,
    context?: CqrsContext,
  ) => Promise<TResult> {
    let next = async (
      query: TQuery,
      context?: CqrsContext,
    ): Promise<TResult> =>
      executeQueryHandler(
        handler as QueryHandler<TQuery, TResult> | ((
          query: TQuery,
          context?: CqrsContext,
        ) => TResult | Promise<TResult>),
        query,
        context,
      );

    for (
      let index =
        this.middleware.length -
        1;
      index >= 0;
      index--
    ) {
      const middleware =
        this.middleware[index]!;

      const current =
        next;

      next = async (
        query,
        context,
      ) =>
        middleware(
          query,
          context,
          current as (
            request:
              | import("../cqrsTypes/cqrsTypes.type.js").Command
              | Query,
            context?: CqrsContext,
          ) => Promise<unknown>,
        ) as Promise<TResult>;
    }

    return next;
  }

  /**
   * Resolves the execution context.
   */
  private async resolveContext(
    context?: CqrsContext,
  ): Promise<CqrsContext> {
    if (
      context
    ) {
      return context;
    }

    if (
      this.contextFactory
    ) {
      return await this.contextFactory();
    }

    return {};
  }

  /**
   * Validates a query before execution.
   */
  private validateQuery(
    query: Query,
  ): void {
    if (
      !query ||
      typeof query !==
        "object"
    ) {
      throw new BaseError(
        "A valid query is required.",
        {
          code:
            ErrorCode.INVALID_QUERY,
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

    if (
      typeof query.type !==
        "string" ||
      query.type.trim()
        .length === 0
    ) {
      throw new BaseError(
        "Query type is required.",
        {
          code:
            ErrorCode.INVALID_QUERY,
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
  }
}

/**
 * Creates a query bus.
 */
export function createQueryBus(
  options: QueryBusOptions = {},
): QueryBus {
  return new QueryBus(
    options,
  );
}