/**
 * Event emitter for Lattice.
 *
 * The emitter provides local, synchronous-registration event
 * dispatching. It does not manage global event definitions or
 * application-level routing.
 */

import type {
  Event,
  EventInput,
} from "./event.js";

import type {
  EventTypePattern,
} from "./event-type.js";

import {
  createEvent,
} from "./event.js";

import type {
  EventHandler,
  EventHandlerContext,
  EventHandlerLike,
  EventHandlerOptions,
  RegisteredEventHandler,
} from "./event-handler.js";

import {
  createEventHandler,
  createEventHandlerContext,
  executeEventHandler,
  getMatchingEventHandlers,
} from "./event-handler.js";

import type {
  EventSubscription,
} from "./event-subscription.js";

import {
  EventSubscriptionGroup,
  createEventSubscription,
} from "./event-subscription.js";

/**
 * Controls how an emitter dispatches handlers.
 */
export enum EventEmitterMode {
  /**
   * Execute matching handlers sequentially.
   */
  SEQUENTIAL = "sequential",

  /**
   * Execute matching handlers concurrently.
   */
  PARALLEL = "parallel",
}

/**
 * Controls what happens when a handler throws.
 */
export enum EventErrorMode {
  /**
   * Stop dispatching and throw immediately.
   */
  THROW = "throw",

  /**
   * Continue executing remaining handlers.
   */
  CONTINUE = "continue",
}

/**
 * Options for an event emitter.
 */
export interface EventEmitterOptions {
  /**
   * Default dispatch mode.
   */
  readonly mode?:
    EventEmitterMode;

  /**
   * Default error handling mode.
   */
  readonly errorMode?:
    EventErrorMode;

  /**
   * Whether emitted events should be frozen.
   */
  readonly freezeEvents?:
    boolean;
}

/**
 * Options for emitting an event.
 */
export interface EmitOptions {
  /**
   * Dispatch mode override.
   */
  readonly mode?:
    EventEmitterMode;

  /**
   * Error handling mode override.
   */
  readonly errorMode?:
    EventErrorMode;

  /**
   * Abort signal for the dispatch.
   */
  readonly signal?:
    AbortSignal;

  /**
   * Dispatch metadata.
   */
  readonly metadata?:
    Readonly<
      Record<string, unknown>
    >;
}

/**
 * Result from executing one event handler.
 */
export interface EventHandlerExecutionResult {
  readonly handlerId:
    string;

  readonly eventId:
    string;

  readonly result:
    unknown;

  readonly duration:
    number;

  readonly error?:
    unknown;
}

/**
 * Result from emitting an event.
 */
export interface EventEmitResult<
  TEvent extends Event = Event,
> {
  readonly event:
    TEvent;

  readonly handled:
    boolean;

  readonly results:
    readonly EventHandlerExecutionResult[];

  readonly errors:
    readonly unknown[];
}

/**
 * Event emitter listener record.
 */
interface EmitterListener {
  readonly registration:
    RegisteredEventHandler;

  readonly subscription:
    EventSubscription;
}

/**
 * Main local event emitter.
 */
export class EventEmitter {
  private readonly listeners =
    new Map<
      string,
      EmitterListener
    >();

  private readonly options:
    Required<EventEmitterOptions>;

  private disposed =
    false;

  constructor(
    options:
      EventEmitterOptions = {},
  ) {
    this.options = {
      mode:
        options.mode ??
        EventEmitterMode.SEQUENTIAL,

      errorMode:
        options.errorMode ??
        EventErrorMode.THROW,

      freezeEvents:
        options.freezeEvents ??
        true,
    };
  }

  /**
   * Registers an event handler.
   */
  on<
    TEvent extends Event = Event,
  >(
    eventType:
      EventTypePattern,
    handler:
      EventHandlerLike<TEvent>,
    options:
      Omit<
        EventHandlerOptions,
        "eventType"
      > = {},
  ):
    EventSubscription {
    this.ensureActive();

    const registration =
      createEventHandler(
        handler,
        {
          ...options,
          eventType,
        },
      );

    return this.addRegistration(
      registration as RegisteredEventHandler,
    );
  }

  /**
   * Registers a handler for an event type and automatically
   * removes it after its first execution.
   */
  once<
    TEvent extends Event = Event,
  >(
    eventType:
      EventTypePattern,
    handler:
      EventHandlerLike<TEvent>,
    options:
      Omit<
        EventHandlerOptions,
        | "eventType"
        | "once"
      > = {},
  ):
    EventSubscription {
    return this.on(
      eventType,
      handler,
      {
        ...options,
        once:
          true,
      },
    );
  }

  /**
   * Registers a handler for every event.
   */
  onAny<
    TEvent extends Event = Event,
  >(
    handler:
      EventHandlerLike<TEvent>,
    options:
      Omit<
        EventHandlerOptions,
        "eventType"
      > = {},
  ):
    EventSubscription {
    return this.on(
      "*",
      handler,
      options,
    );
  }

  /**
   * Removes a handler using its subscription.
   */
  off(
    subscription:
      EventSubscription,
  ):
    boolean {
    this.ensureActive();

    const removed =
      this.listeners.delete(
        subscription.id,
      );

    if (
      removed &&
      subscription.active
    ) {
      subscription.unsubscribe();
    }

    return removed;
  }

  /**
   * Emits an existing event instance.
   */
  async emit<
    TEvent extends Event,
  >(
    event:
      TEvent,
    options:
      EmitOptions = {},
  ):
    Promise<
      EventEmitResult<TEvent>
    > {
    this.ensureActive();

    if (
      options.signal?.aborted
    ) {
      throw createAbortError();
    }

    const mode =
      options.mode ??
      this.options.mode;

    const errorMode =
      options.errorMode ??
      this.options.errorMode;

    const handlers =
      getMatchingEventHandlers(
        this.getRegistrations(),
        event,
      );

    const context =
      createEventHandlerContext(
        event,
        {
          signal:
            options.signal,
          metadata:
            options.metadata,
        },
      );

    if (
      handlers.length ===
        0
    ) {
      return {
        event,
        handled:
          false,
        results:
          [],
        errors:
          [],
      };
    }

    const results:
      EventHandlerExecutionResult[] =
      [];

    const errors:
      unknown[] =
      [];

    if (
      mode ===
        EventEmitterMode.PARALLEL
    ) {
      await this.emitParallel(
        handlers,
        event,
        context,
        errorMode,
        results,
        errors,
      );
    } else {
      await this.emitSequential(
        handlers,
        event,
        context,
        errorMode,
        results,
        errors,
      );
    }

    return {
      event,
      handled:
        results.length >
        0,
      results,
      errors,
    };
  }

  /**
   * Creates and emits an event from input data.
   */
  async emitEvent<
    TPayload,
  >(
    input:
      EventInput<TPayload>,
    options:
      EmitOptions = {},
  ):
    Promise<
      EventEmitResult<
        Event<TPayload>
      >
    > {
    const event =
      createEvent(
        input,
      );

    return this.emit(
      event,
      options,
    );
  }

  /**
   * Returns the number of active handlers.
   */
  get listenerCount():
    number {
    return this.listeners.size;
  }

  /**
   * Returns all registered handlers.
   */
  getRegistrations():
    readonly RegisteredEventHandler[] {
    return [
      ...this.listeners.values(),
    ].map(
      ({
        registration,
      }) =>
        registration,
    );
  }

  /**
   * Removes all listeners.
   */
  removeAllListeners():
    void {
    this.ensureActive();

    const subscriptions =
      [
        ...this.listeners.values(),
      ].map(
        ({
          subscription,
        }) =>
          subscription,
      );

    for (
      const subscription of
      subscriptions
    ) {
      subscription.unsubscribe();
    }

    this.listeners.clear();
  }

  /**
   * Creates a subscription group.
   */
  createSubscriptionGroup():
    EventSubscriptionGroup {
    this.ensureActive();

    return new EventSubscriptionGroup();
  }

  /**
   * Disposes the emitter.
   */
  dispose():
    void {
    if (
      this.disposed
    ) {
      return;
    }

    this.removeAllListeners();

    this.disposed =
      true;
  }

  /**
   * Whether the emitter has been disposed.
   */
  isDisposed():
    boolean {
    return this.disposed;
  }

  /**
   * Adds a handler registration.
   */
  private addRegistration(
    registration:
      RegisteredEventHandler,
  ):
    EventSubscription {
    const subscription =
      createEventSubscription(
        () => {
          this.listeners.delete(
            registration.id,
          );
        },
        {
          id:
            registration.id,
          description:
            registration.description,
        },
      );

    this.listeners.set(
      registration.id,
      {
        registration,
        subscription,
      },
    );

    return subscription;
  }

  /**
   * Executes handlers sequentially.
   */
  private async emitSequential<
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
  ):
    Promise<void> {
    for (
      const handler of
      handlers
    ) {
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

        results.push({
          handlerId:
            handler.id,

          eventId:
            event.id,

          result,

          duration:
            performance.now() -
            started,
        });

        if (
          handler.once
        ) {
          this.removeHandler(
            handler.id,
          );
        }
      } catch (
        error
      ) {
        const execution:
          EventHandlerExecutionResult =
          {
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

        results.push(
          execution,
        );

        errors.push(
          error,
        );

        if (
          errorMode ===
            EventErrorMode.THROW
        ) {
          throw error;
        }
      }
    }
  }

  /**
   * Executes handlers concurrently.
   */
  private async emitParallel<
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
              this.removeHandler(
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

  /**
   * Removes a handler by registration identifier.
   */
  private removeHandler(
    id:
      string,
  ):
    void {
    const listener =
      this.listeners.get(
        id,
      );

    if (
      !listener
    ) {
      return;
    }

    this.listeners.delete(
      id,
    );

    listener.subscription.unsubscribe();
  }

  /**
   * Ensures the emitter can be used.
   */
  private ensureActive():
    void {
    if (
      this.disposed
    ) {
      throw new Error(
        "EventEmitter has already been disposed.",
      );
    }
  }
}

/**
 * Creates a new event emitter.
 */
export function createEventEmitter(
  options:
    EventEmitterOptions = {},
):
  EventEmitter {
  return new EventEmitter(
    options,
  );
}

/**
 * Creates an AbortError consistently across runtimes.
 */
function createAbortError():
  Error {
  const error =
    new Error(
      "Event dispatch was aborted.",
    );

  error.name =
    "AbortError";

  return error;
}