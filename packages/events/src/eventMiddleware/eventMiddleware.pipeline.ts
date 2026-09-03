/**
 * Event middleware pipeline execution for Zudolib.
 */

import type { Event } from "../eventTypes/eventDefinition.type.js";

import {
  EventMiddlewareError,
  toEventError,
} from "../eventErrors/eventError.base.js";

import type {
  EventMiddlewareContext,
  EventMiddlewareNext,
  RegisteredEventMiddleware,
  EventMiddlewareExecution,
  EventMiddlewarePipelineResult,
} from "./eventMiddleware.type.js";

import {
  sortEventMiddleware,
  executeEventMiddleware,
} from "./eventMiddleware.helper.js";

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
  middleware: readonly RegisteredEventMiddleware<TEvent, TResult>[],
  context: EventMiddlewareContext<TEvent>,
  terminal: EventMiddlewareNext<TResult>,
): Promise<EventMiddlewarePipelineResult<TResult>> {
  const started = performance.now();

  const activeMiddleware = sortEventMiddleware(
    middleware.filter((item) => item.enabled),
  );

  const executions: EventMiddlewareExecution<TResult>[] = [];

  let index = -1;

  const dispatch = async (currentIndex: number): Promise<TResult> => {
    if (context.signal.aborted) {
      throw createAbortError();
    }

    if (currentIndex === activeMiddleware.length) {
      return terminal();
    }

    if (currentIndex <= index) {
      throw new EventMiddlewareError(
        "Event middleware called next() more than once.",
        {
          eventType: context.event?.type,
          eventId: context.event?.id,
        },
      );
    }

    index = currentIndex;

    const current = activeMiddleware[currentIndex];

    if (!current) {
      return terminal();
    }

    const middlewareStarted = performance.now();

    let nextCalled = false;

    const next = async () => {
      if (nextCalled) {
        throw new EventMiddlewareError(
          `Middleware "${current.id}" called next() more than once.`,
          {
            middlewareId: current.id,

            eventType: context.event?.type,
            eventId: context.event?.id,
          },
        );
      }

      nextCalled = true;

      return dispatch(currentIndex + 1);
    };

    try {
      const result = await executeEventMiddleware(
        current.middleware,
        context,
        next,
      );

      executions.push({
        middlewareId: current.id,

        result,

        duration: performance.now() - middlewareStarted,
      });

      return result;
    } catch (error) {
      if (error instanceof EventMiddlewareError) {
        throw error;
      }

      throw new EventMiddlewareError(
        `Event middleware "${current.id}" failed.`,
        {
          middlewareId: current.id,

          eventType: context.event?.type,
          eventId: context.event?.id,

          cause: toEventError(error, {
            eventType: context.event?.type,
            eventId: context.event?.id,
          }),
        },
      );
    }
  };

  const result = await dispatch(0);

  return {
    result,

    executions,

    duration: performance.now() - started,
  };
}

/**
 * Creates an AbortError without relying on a runtime-specific
 * DOMException implementation.
 */
function createAbortError(): EventMiddlewareError {
  return new EventMiddlewareError("Event middleware execution was aborted.", {
    cause: new Error("AbortSignal was aborted."),
  });
}
