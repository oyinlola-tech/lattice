/**
 * Sequential event handler dispatch for Zudo.
 */

import type { Event } from "../eventTypes/eventDefinition.type.js";

import type {
  EventHandlerContext,
  RegisteredEventHandler,
} from "../eventHandler/eventHandler.core.js";

import { executeEventHandler } from "../eventHandler/eventHandler.core.js";

import type { EventHandlerExecutionResult } from "./eventEmitter.type.js";

import { EventErrorMode } from "./eventEmitter.type.js";

import { createAbortError } from "./eventEmitter.abort.js";

/**
 * Executes handlers sequentially.
 */
export async function emitSequential<TEvent extends Event>(
  handlers: readonly RegisteredEventHandler<TEvent>[],
  event: TEvent,
  context: EventHandlerContext<TEvent>,
  errorMode: EventErrorMode,
  results: EventHandlerExecutionResult[],
  errors: unknown[],
  onOnceHandler: (handlerId: string) => void,
): Promise<void> {
  for (const handler of handlers) {
    if (context.signal.aborted) {
      throw createAbortError();
    }

    const started = performance.now();

    try {
      const result = await executeEventHandler(handler.handler, event, context);

      results.push({
        handlerId: handler.id,

        eventId: event.id,

        result,

        duration: performance.now() - started,
      });

      if (handler.once) {
        onOnceHandler(handler.id);
      }
    } catch (error) {
      const execution: EventHandlerExecutionResult = {
        handlerId: handler.id,

        eventId: event.id,

        result: undefined,

        duration: performance.now() - started,

        error,
      };

      results.push(execution);

      errors.push(error);

      if (errorMode === EventErrorMode.THROW) {
        throw error;
      }
    }
  }
}
