/**
 * Parallel event handler dispatch for Lattice.
 */

import type {
  Event,
} from "../eventTypes/eventDefinition.type.js";

import type {
  EventHandlerContext,
  RegisteredEventHandler,
} from "../eventHandler/eventHandler.core.js";

import {
  executeEventHandler,
} from "../eventHandler/eventHandler.core.js";

import type {
  EventHandlerExecutionResult,
} from "./eventEmitter.type.js";

import {
  EventErrorMode,
} from "./eventEmitter.type.js";

import {
  createAbortError,
} from "./eventEmitter.abort.js";

/**
 * Executes handlers concurrently.
 */
export async function emitParallel<
  TEvent extends Event,
>(
  handlers:
    readonly RegisteredEventHandler<TEvent>[],
  event:
    TEvent,
  context:
    EventHandlerContext<TEvent>,
  errorMode:
    EventErrorMode,
  results:
    EventHandlerExecutionResult[],
  errors:
    unknown[],
  onOnceHandler:
    (
      handlerId:
        string,
    ) =>
      void,
):
  Promise<void> {
  const executions =
    handlers.map(
      async (
        handler,
      ) => {
        if (
          context.signal.aborted
        ) {
          throw createAbortError();
        }

        const started =
          performance.now();

        try {
          const result =
            await executeEventHandler(
              handler.handler,
              event,
              context,
            );

          const execution:
            EventHandlerExecutionResult =
            {
              handlerId:
                handler.id,

              eventId:
                event.id,

              result,

              duration:
                performance.now() -
                started,
            };

          if (
            handler.once
          ) {
            onOnceHandler(
              handler.id,
            );
          }

          return execution;
        } catch (
          error
        ) {
          return {
            handlerId:
              handler.id,

            eventId:
              event.id,

            result:
              undefined,

            duration:
              performance.now() -
              started,

            error,
          };
        }
      },
    );

  const settled =
    await Promise.all(
      executions,
    );

  for (
    const result of
    settled
  ) {
    results.push(
      result,
    );

    if (
      result.error !==
        undefined
    ) {
      errors.push(
        result.error,
      );
    }
  }

  if (
    errors.length >
      0 &&
    errorMode ===
      EventErrorMode.THROW
  ) {
    throw errors[0];
  }
}
