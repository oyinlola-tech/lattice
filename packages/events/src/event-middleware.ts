/**
 * Event middleware for Lattice.
 *
 * Middleware wraps event publication and can be used for:
 * logging, tracing, authorization, validation, metrics,
 * transactions, retries, and other cross-cutting concerns.
 *
 * Middleware does not own event registration or handler
 * execution. It composes around the EventBus publication flow.
 */

import type {
  Event,
} from "./event.js";

import type {
  EventHandlerContext,
} from "./event-handler.js";

import {
  EventMiddlewareError,
  toEventError,
} from "./event-error.js";

/**
 * Context supplied to middleware.
 */
export interface EventMiddlewareContext<
  TEvent extends Event = Event,
> {
  /**
   * Event being published.
   */
  readonly event:
    TEvent;

  /**
   * Handler context associated with publication.
   */
  readonly handlerContext?:
    EventHandlerContext<TEvent>;

  /**
   * Abort signal.
   */
  readonly signal:
    AbortSignal;

  /**
   * Metadata associated with publication.
   */
  readonly metadata:
    Readonly<
      Record<string, unknown>
    >;

  /**
   * Unique middleware execution identifier.
   */
  readonly executionId:
    string;

  /**
   * Start timestamp.
   */
  readonly startedAt:
    Date;

  /**
   * Arbitrary middleware state.
   *
   * Middleware can use this for passing data to downstream
   * middleware without mutating the event itself.
   */
  readonly state:
    Map<string, unknown>;
}

/**
 * Next middleware function.
 */
export type EventMiddlewareNext<
  TResult = unknown,
> = () =>
  Promise<TResult>;

/**
 * Event middleware function.
 */
export type EventMiddleware<
  TEvent extends Event = Event,
  TResult = unknown,
> = (
  context:
    EventMiddlewareContext<TEvent>,
  next:
    EventMiddlewareNext<TResult>,
) =>
  Promise<TResult>;

/**
 * Middleware object contract.
 */
export interface EventMiddlewareObject<
  TEvent extends Event = Event,
  TResult = unknown,
> {
  readonly handle:
    EventMiddleware<
      TEvent,
      TResult
    >;
}

/**
 * Supported middleware representation.
 */
export type EventMiddlewareLike<
  TEvent extends Event = Event,
  TResult = unknown,
> =
  | EventMiddleware<
      TEvent,
      TResult
    >
  | EventMiddlewareObject<
      TEvent,
      TResult
    >;

/**
 * Middleware registration options.
 */
export interface EventMiddlewareOptions {
  /**
   * Optional middleware identifier.
   */
  readonly id?:
    string;

  /**
   * Optional description.
   */
  readonly description?:
    string;

  /**
   * Execution priority.
   *
   * Higher values execute earlier.
   */
  readonly priority?:
    number;

  /**
   * Whether middleware is enabled.
   */
  readonly enabled?:
    boolean;
}

/**
 * Registered middleware.
 */
export interface RegisteredEventMiddleware<
  TEvent extends Event = Event,
  TResult = unknown,
> {
  readonly id:
    string;

  readonly description?:
    string;

  readonly priority:
    number;

  readonly enabled:
    boolean;

  readonly middleware:
    EventMiddlewareLike<
      TEvent,
      TResult
    >;
}

/**
 * Result of middleware execution.
 */
export interface EventMiddlewareExecution<
  TResult = unknown,
> {
  readonly middlewareId:
    string;

  readonly result:
    TResult;

  readonly duration:
    number;
}

/**
 * Middleware pipeline result.
 */
export interface EventMiddlewarePipelineResult<
  TResult = unknown,
> {
  readonly result:
    TResult;

  readonly executions:
    readonly EventMiddlewareExecution[];

  readonly duration:
    number;
}

/**
 * Middleware pipeline options.
 */
export interface EventMiddlewarePipelineOptions {
  /**
   * Abort signal.
   */
  readonly signal?:
    AbortSignal;

  /**
   * Metadata.
   */
  readonly metadata?:
    Readonly<
      Record<string, unknown>
    >;

  /**
   * Existing state map.
   */
  readonly state?:
    Map<string, unknown>;
}

/**
 * Generates a middleware identifier.
 */
export function createEventMiddlewareId():
  string {
  if (
    typeof crypto !==
      "undefined" &&
    typeof crypto.randomUUID ===
      "function"
  ) {
    return `middleware:${crypto.randomUUID()}`;
  }

  return `middleware:${Date.now().toString(36)}:${Math.random()
    .toString(36)
    .slice(2)}`;
}

/**
 * Determines whether a value is a function middleware.
 */
export function isFunctionEventMiddleware(
  value:
    unknown,
):
  value is EventMiddleware {
  return (
    typeof value ===
    "function"
  );
}

/**
 * Determines whether a value is an object middleware.
 */
export function isObjectEventMiddleware(
  value:
    unknown,
):
  value is EventMiddlewareObject {
  return (
    typeof value ===
      "object" &&
    value !== null &&
    typeof (
      value as {
        handle?:
          unknown;
      }
    ).handle ===
      "function"
  );
}

/**
 * Determines whether a value is a supported middleware.
 */
export function isEventMiddleware(
  value:
    unknown,
):
  value is EventMiddlewareLike {
  return (
    isFunctionEventMiddleware(
      value,
    ) ||
    isObjectEventMiddleware(
      value,
    )
  );
}

/**
 * Creates a registered middleware definition.
 */
export function createEventMiddleware<
  TEvent extends Event = Event,
  TResult = unknown,
>(
  middleware:
    EventMiddlewareLike<
      TEvent,
      TResult
    >,
  options:
    EventMiddlewareOptions = {},
):
  RegisteredEventMiddleware<
    TEvent,
    TResult
  > {
  if (
    !isEventMiddleware(
      middleware,
    )
  ) {
    throw new TypeError(
      "Invalid event middleware.",
    );
  }

  const priority =
    options.priority ??
    0;

  if (
    !Number.isFinite(
      priority,
    )
  ) {
    throw new RangeError(
      "Event middleware priority must be a finite number.",
    );
  }

  return Object.freeze({
    id:
      options.id ??
      createEventMiddlewareId(),

    description:
      options.description,

    priority,

    enabled:
      options.enabled ??
      true,

    middleware,
  });
}

/**
 * Executes a middleware implementation.
 */
export async function executeEventMiddleware<
  TEvent extends Event,
  TResult,
>(
  middleware:
    EventMiddlewareLike<
      TEvent,
      TResult
    >,
  context:
    EventMiddlewareContext<TEvent>,
  next:
    EventMiddlewareNext<TResult>,
):
  Promise<TResult> {
  if (
    isFunctionEventMiddleware(
      middleware,
    )
  ) {
    return (middleware as EventMiddleware<TEvent, TResult>)(
      context,
      next,
    );
  }

  return (middleware as EventMiddlewareObject<TEvent, TResult>).handle(
    context,
    next,
  );
}

/**
 * Sorts middleware by descending priority.
 */
export function sortEventMiddleware<
  TEvent extends Event,
  TResult,
>(
  middleware:
    readonly RegisteredEventMiddleware<
      TEvent,
      TResult
    >[],
):
  RegisteredEventMiddleware<
    TEvent,
    TResult
  >[] {
  return [
    ...middleware,
  ].sort(
    (
      first,
      second,
    ) =>
      second.priority -
      first.priority,
  );
}

/**
 * Creates a middleware context.
 */
export function createEventMiddlewareContext<
  TEvent extends Event,
>(
  event:
    TEvent,
  options:
    EventMiddlewarePipelineOptions = {},
):
  EventMiddlewareContext<TEvent> {
  return {
    event,

    signal:
      options.signal ??
      new AbortController()
        .signal,

    metadata:
      Object.freeze({
        ...(options.metadata ??
          {}),
      }),

    executionId:
      createEventMiddlewareId(),

    startedAt:
      new Date(),

    state:
      options.state ??
      new Map<
        string,
        unknown
      >(),
  };
}

/**
 * Executes a middleware pipeline.
 *
 * Middleware executes in descending priority order:
 *
 * middleware A
 *   → middleware B
 *     → handler
 *   ← middleware B
 * ← middleware A
 */
export async function executeEventMiddlewarePipeline<
  TEvent extends Event,
  TResult,
>(
  middleware:
    readonly RegisteredEventMiddleware<
      TEvent,
      TResult
    >[],
  context:
    EventMiddlewareContext<TEvent>,
  terminal:
    EventMiddlewareNext<TResult>,
):
  Promise<
    EventMiddlewarePipelineResult<TResult>
  > {
  const started =
    performance.now();

  const activeMiddleware =
    sortEventMiddleware(
      middleware.filter(
        (
          item,
        ) =>
          item.enabled,
      ),
    );

  const executions:
    EventMiddlewareExecution<TResult>[] =
    [];

  let index =
    -1;

  const dispatch =
    async (
      currentIndex:
        number,
    ):
      Promise<TResult> => {
      if (
        context.signal.aborted
      ) {
        throw createAbortError();
      }

      if (
        currentIndex ===
        activeMiddleware.length
      ) {
        return terminal();
      }

      if (
        currentIndex <=
        index
      ) {
        throw new EventMiddlewareError(
          "Event middleware called next() more than once.",
          {
            event:
              context.event,
          },
        );
      }

      index =
        currentIndex;

      const current =
        activeMiddleware[
          currentIndex
        ];

      if (
        !current
      ) {
        return terminal();
      }

      const middlewareStarted =
        performance.now();

      let nextCalled =
        false;

      const next =
        async () => {
          if (
            nextCalled
          ) {
            throw new EventMiddlewareError(
              `Middleware "${current.id}" called next() more than once.`,
              {
                middlewareId:
                  current.id,

                event:
                  context.event,
              },
            );
          }

          nextCalled =
            true;

          return dispatch(
            currentIndex + 1,
          );
        };

      try {
        const result =
          await executeEventMiddleware(
            current.middleware,
            context,
            next,
          );

        executions.push({
          middlewareId:
            current.id,

          result,

          duration:
            performance.now() -
            middlewareStarted,
        });

        return result;
      } catch (
        error
      ) {
        if (
          error instanceof
          EventMiddlewareError
        ) {
          throw error;
        }

        throw new EventMiddlewareError(
          `Event middleware "${current.id}" failed.`,
          {
            middlewareId:
              current.id,

            event:
              context.event,

            cause:
              toEventError(
                error,
                {
                  event:
                    context.event,
                },
              ),
          },
        );
      }
    };

  const result =
    await dispatch(0);

  return {
    result,

    executions,

    duration:
      performance.now() -
      started,
  };
}

/**
 * Creates a middleware that executes before downstream
 * middleware and handlers.
 */
export function beforeEvent(
  callback:
    (
      context:
        EventMiddlewareContext,
    ) =>
      void |
      Promise<void>,
  options:
    EventMiddlewareOptions = {},
):
  RegisteredEventMiddleware {
  return createEventMiddleware(
    async (
      context,
      next,
    ) => {
      await callback(
        context,
      );

      return next();
    },
    options,
  );
}

/**
 * Creates a middleware that executes after downstream
 * middleware and handlers.
 */
export function afterEvent(
  callback:
    (
      context:
        EventMiddlewareContext,
      result:
        unknown,
    ) =>
      void |
      Promise<void>,
  options:
    EventMiddlewareOptions = {},
):
  RegisteredEventMiddleware {
  return createEventMiddleware(
    async (
      context,
      next,
    ) => {
      const result =
        await next();

      await callback(
        context,
        result,
      );

      return result;
    },
    options,
  );
}

/**
 * Creates a middleware that wraps the entire event operation.
 */
export function aroundEvent(
  callback:
    (
      context:
        EventMiddlewareContext,
      next:
        EventMiddlewareNext,
    ) =>
      Promise<unknown>,
  options:
    EventMiddlewareOptions = {},
):
  RegisteredEventMiddleware {
  return createEventMiddleware(
    callback,
    options,
  );
}

/**
 * Creates middleware that validates an event before it
 * reaches downstream handlers.
 */
export function validateEventMiddleware<
  TEvent extends Event,
>(
  validator:
    (
      event:
        TEvent,
    ) =>
      boolean |
      Promise<boolean>,
  options:
    EventMiddlewareOptions = {},
):
  RegisteredEventMiddleware<TEvent> {
  return beforeEvent(
    async (
      context,
    ) => {
      const valid =
        await validator(
          context.event as TEvent,
        );

      if (
        !valid
      ) {
        throw new EventMiddlewareError(
          `Event "${context.event.type}" failed middleware validation.`,
          {
            event:
              context.event,
          },
        );
      }
    },
    options,
  );
}

/**
 * Creates middleware that records event timing.
 */
export function timingEventMiddleware(
  callback:
    (
      duration:
        number,
      context:
        EventMiddlewareContext,
    ) =>
      void |
      Promise<void>,
  options:
    EventMiddlewareOptions = {},
):
  RegisteredEventMiddleware {
  return aroundEvent(
    async (
      context,
      next,
    ) => {
      const started =
        performance.now();

      try {
        return await next();
      } finally {
        await callback(
          performance.now() -
            started,
          context,
        );
      }
    },
    options,
  );
}

/**
 * Creates middleware that stores a value in the
 * middleware context state.
 */
export function stateEventMiddleware<T>(
  key:
    string,
  factory:
    (
      context:
        EventMiddlewareContext,
    ) =>
      T |
      Promise<T>,
  options:
    EventMiddlewareOptions = {},
):
  RegisteredEventMiddleware {
  return beforeEvent(
    async (
      context,
    ) => {
      context.state.set(
        key,
        await factory(
          context,
        ),
      );
    },
    options,
  );
}

/**
 * Enables middleware.
 */
export function enableEventMiddleware<
  TEvent extends Event,
  TResult,
>(
  middleware:
    RegisteredEventMiddleware<
      TEvent,
      TResult
    >,
):
  RegisteredEventMiddleware<
    TEvent,
    TResult
  > {
  return Object.freeze({
    ...middleware,

    enabled:
      true,
  });
}

/**
 * Disables middleware.
 */
export function disableEventMiddleware<
  TEvent extends Event,
  TResult,
>(
  middleware:
    RegisteredEventMiddleware<
      TEvent,
      TResult
    >,
):
  RegisteredEventMiddleware<
    TEvent,
    TResult
  > {
  return Object.freeze({
    ...middleware,

    enabled:
      false,
  });
}

/**
 * Creates a middleware that stops execution when the
 * supplied AbortSignal is cancelled.
 */
export function abortableEventMiddleware(
  options:
    EventMiddlewareOptions = {},
):
  RegisteredEventMiddleware {
  return beforeEvent(
    async (
      context,
    ) => {
      if (
        context.signal.aborted
      ) {
        throw createAbortError();
      }
    },
    options,
  );
}

/**
 * Creates an AbortError without relying on a runtime-specific
 * DOMException implementation.
 */
function createAbortError():
  EventMiddlewareError {
  return new EventMiddlewareError(
    "Event middleware execution was aborted.",
    {
      code:
        "EVENT_MIDDLEWARE_ABORTED",

      cause:
        new Error(
          "AbortSignal was aborted.",
        ),
    },
  );
}