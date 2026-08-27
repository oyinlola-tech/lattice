import type {
  QueryHandler as QueryHandlerContract,
  Query,
  CqrsContext,
} from "../cqrsTypes/cqrsTypes.type.js";

/**
 * Abstract base class for query handlers.
 *
 * A query handler contains the application logic required to execute
 * one specific query.
 */
export abstract class QueryHandler<
  TQuery extends Query = Query,
  TResult = unknown,
> implements QueryHandlerContract<
  TQuery,
  TResult
> {
  /**
   * Query type handled by this handler.
   */
  public abstract readonly queryType: TQuery["type"];

  /**
   * Executes the query.
   */
  public abstract execute(
    query: TQuery,
    context?: CqrsContext,
  ): Promise<TResult> | TResult;
}

/**
 * Function-based query handler implementation.
 */
export class FunctionQueryHandler<
  TQuery extends Query = Query,
  TResult = unknown,
> extends QueryHandler<
  TQuery,
  TResult
> {
  public readonly queryType: TQuery["type"];

  private readonly handler: (
    query: TQuery,
    context?: CqrsContext,
  ) =>
    | TResult
    | Promise<TResult>;

  constructor(
    queryType: TQuery["type"],
    handler: (
      query: TQuery,
      context?: CqrsContext,
    ) =>
      | TResult
      | Promise<TResult>,
  ) {
    super();

    if (
      typeof handler !==
      "function"
    ) {
      throw new TypeError(
        "Query handler must be a function.",
      );
    }

    this.queryType =
      queryType;

    this.handler =
      handler;
  }

  public execute(
    query: TQuery,
    context?: CqrsContext,
  ):
    | TResult
    | Promise<TResult> {
    return this.handler(
      query,
      context,
    );
  }
}

/**
 * Creates a function-based query handler.
 */
export function createQueryHandler<
  TQuery extends Query,
  TResult = unknown,
>(
  queryType: TQuery["type"],
  handler: (
    query: TQuery,
    context?: CqrsContext,
  ) =>
    | TResult
    | Promise<TResult>,
): FunctionQueryHandler<
  TQuery,
  TResult
> {
  return new FunctionQueryHandler(
    queryType,
    handler,
  );
}

/**
 * Determines whether a value is a query handler instance.
 */
export function isQueryHandler(
  value: unknown,
): value is QueryHandler {
  return (
    value instanceof
    QueryHandler
  );
}

/**
 * Determines whether a value can be used as a query handler.
 */
export function isQueryHandlerLike(
  value: unknown,
): value is QueryHandler | ((
  query: Query,
  context?: CqrsContext,
) => unknown) {
  return (
    value instanceof
      QueryHandler ||
    typeof value ===
      "function"
  );
}

/**
 * Executes either an object-based or function-based query handler.
 */
export async function executeQueryHandler<
  TQuery extends Query,
  TResult = unknown,
>(
  handler:
    | QueryHandler<TQuery, TResult>
    | ((
        query: TQuery,
        context?: CqrsContext,
      ) =>
        | TResult
        | Promise<TResult>),
  query: TQuery,
  context?: CqrsContext,
): Promise<TResult> {
  if (
    handler instanceof
    QueryHandler
  ) {
    return await handler.execute(
      query,
      context,
    );
  }

  if (
    typeof handler ===
    "function"
  ) {
    return await handler(
      query,
      context,
    );
  }

  throw new TypeError(
    `Invalid query handler for "${query.type}".`,
  );
}