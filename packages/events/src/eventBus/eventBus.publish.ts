/**
 * Event bus publish methods for Lattice.
 */

import type {
  Event,
  EventInput,
  EventType,
} from "../eventTypes/eventDefinition.type.js";

import {
  createEvent,
} from "../eventTypes/eventDefinition.type.js";

import type {
  RegisteredEventHandler,
} from "../eventHandler/eventHandler.core.js";

import {
  EventEmitter,
} from "../eventEmitter/eventEmitter.core.js";

import {
  EventRegistry,
} from "../eventRegistry/eventRegistry.store.js";

import {
  EventDispatchAbortedError,
  EventError,
  toEventError,
} from "../eventErrors/eventError.base.js";

import type {
  EventMiddlewareLike,
  RegisteredEventMiddleware,
} from "../eventMiddleware/eventMiddleware.type.js";

import {
  createEventMiddlewareContext,
} from "../eventMiddleware/eventMiddleware.helper.js";

import {
  executeEventMiddlewarePipeline,
} from "../eventMiddleware/eventMiddleware.pipeline.js";

import type {
  PublishOptions,
  EventPublishResult,
  EventBusEvent,
} from "./eventBus.type.js";

import {
  registerMiddlewareItem,
} from "./eventBus.registration.js";

/**
 * Publishes an event through the bus.
 */
export async function busPublish<
  TEvent extends Event,
>(
  event:
    TEvent,
  options:
    PublishOptions,
  emitter:
    EventEmitter,
  registry:
    EventRegistry,
  busMiddleware:
    RegisteredEventMiddleware[],
  requireRegistration:
    boolean,
  ensureUsable:
    () => void,
  notify:
    (
      e:
        EventBusEvent,
    ) =>
      void,
):
  Promise<
    EventPublishResult<TEvent>
  > {
  ensureUsable();

  if (
    options.signal?.aborted
  ) {
    throw new EventDispatchAbortedError("Event dispatch was aborted.", {
      eventType: event?.type,
      eventId: event?.id,
    });
  }

  if (
    requireRegistration &&
    !registry.has(
      event.type,
    )
  ) {
    throw new EventError(
      `Event type "${event.type}" is not registered.`,
      {
        eventType: event.type,
        eventId: event.id,
      },
    );
  }

  const allMiddleware = [
    ...busMiddleware,
    ...(options.middleware ?? []).map(
      (
        m,
        index,
      ) =>
        registerMiddlewareItem(
          m,
          index +
            busMiddleware.length,
        ),
    ),
  ];

  const middlewareContext =
    createEventMiddlewareContext(
      event,
      {
        signal:
          options.signal,
        metadata:
          options.metadata,
      },
    );

  const terminal =
    async () => {
      return emitter.emit(
        event,
        {
          mode:
            options.mode,

          errorMode:
            options.errorMode,

          signal:
            options.signal,

          metadata:
            options.metadata,
        },
      );
    };

  let result:
    Awaited<
      ReturnType<
        typeof terminal
      >
    >;

  let middlewareResult:
    | {
        result: unknown;
        executions: readonly {
          middlewareId: string;
          result: unknown;
          duration: number;
        }[];
      }
    | undefined;

  if (
    allMiddleware.length >
    0
  ) {
    const pipelineResult =
      await executeEventMiddlewarePipeline(
        allMiddleware,
        middlewareContext,
        terminal,
      );

    result =
      pipelineResult.result as Awaited<
        ReturnType<
          typeof terminal
        >
      >;

    middlewareResult =
      {
        result:
          pipelineResult.result,
        executions:
          pipelineResult.executions,
      };
  } else {
    result =
      await terminal();
  }

  notify({
    type:
      "published",

    event,

    timestamp:
      new Date(),
  });

  return {
    event,

    handled:
      result.handled,

    handlerCount:
      result.results.length,

    results:
      result.results.map(
        (
          execution,
        ) =>
          execution.result,
      ),

    errors:
      result.errors,

    middlewareExecutions:
      middlewareResult
        ?.executions,
  };
}

/**
 * Creates and publishes an event from input data.
 */
export async function busPublishEvent<
  TPayload,
>(
  input:
    EventInput<TPayload>,
  options:
    PublishOptions,
  emitter:
    EventEmitter,
  registry:
    EventRegistry,
  busMiddleware:
    RegisteredEventMiddleware[],
  requireRegistration:
    boolean,
  ensureUsable:
    () => void,
  notify:
    (
      e:
        EventBusEvent,
    ) =>
      void,
):
  Promise<
    EventPublishResult<
      Event<TPayload>
    >
  > {
  const event =
    createEvent(
      input,
    );

  return busPublish(
    event,
    options,
    emitter,
    registry,
    busMiddleware,
    requireRegistration,
    ensureUsable,
    notify,
  );
}
