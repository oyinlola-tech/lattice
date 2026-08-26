/**
 * Event bus for Lattice.
 *
 * The EventBus is the high-level orchestration layer of the events
 * package. It combines the event registry and local emitter while
 * keeping event definitions, subscriptions, and dispatching separate.
 *
 * Middleware wraps event publication and can be used for logging,
 * tracing, authorization, validation, metrics, and other
 * cross-cutting concerns.
 */

import type {
  Event,
  EventDefinition,
  EventInput,
  EventType,
} from "./event.js";

import type {
  EventTypePattern,
} from "./event-type.js";

import {
  createEvent,
} from "./event.js";

import type {
  EventHandlerLike,
  EventHandlerOptions,
  RegisteredEventHandler,
} from "./event-handler.js";

import type {
  EventSubscription,
} from "./event-subscription.js";

import {
  EventEmitter,
  EventEmitterMode,
  EventErrorMode,
} from "./event-emitter.js";

import {
  EventRegistry,
} from "./event-registry.js";

import {
  EventDispatchAbortedError,
  EventError,
  toEventError,
} from "./event-error.js";

import type {
  EventMiddlewareLike,
  EventMiddlewareOptions,
  RegisteredEventMiddleware,
} from "./event-middleware.js";

import {
  createEventMiddleware,
  createEventMiddlewareContext,
  executeEventMiddlewarePipeline,
  sortEventMiddleware,
  createEventMiddlewareId,
  isEventMiddleware,
  isFunctionEventMiddleware,
  isObjectEventMiddleware,
} from "./event-middleware.js";

/**
 * Configuration for the event bus.
 */
export interface EventBusOptions {
  /**
   * Event emitter options.
   */
  readonly emitter?:
    {
      readonly mode?:
        EventEmitterMode;

      readonly errorMode?:
        EventErrorMode;

      readonly freezeEvents?:
        boolean;
    };

  /**
   * Registry options.
   */
  readonly registry?:
    {
      readonly allowDuplicateDefinitions?:
        boolean;

      readonly allowDuplicateHandlerIds?:
        boolean;
    };

  /**
   * Whether publishing an event requires its type to be
   * registered first.
   *
   * Defaults to false.
   */
  readonly requireRegistration?:
    boolean;

  /**
   * Middleware applied to all publications.
   */
  readonly middleware?:
    readonly EventMiddlewareLike[];
}

/**
 * Options for publishing an event.
 */
export interface PublishOptions {
  /**
   * Dispatch mode override.
   */
  readonly mode?:
    EventEmitterMode;

  /**
   * Error mode override.
   */
  readonly errorMode?:
    EventErrorMode;

  /**
   * Abort signal.
   */
  readonly signal?:
    AbortSignal;

  /**
   * Metadata passed to handlers.
   */
  readonly metadata?:
    Readonly<
      Record<string, unknown>
    >;

  /**
   * Per-publication middleware overrides.
   */
  readonly middleware?:
    readonly EventMiddlewareLike[];
}

/**
 * Result of publishing an event.
 */
export interface EventPublishResult<
  TEvent extends Event = Event,
> {
  /**
   * Event that was published.
   */
  readonly event:
    TEvent;

  /**
   * Whether at least one handler processed the event.
   */
  readonly handled:
    boolean;

  /**
   * Number of matching handlers.
   */
  readonly handlerCount:
    number;

  /**
   * Successful handler executions.
   */
  readonly results:
    readonly unknown[];

  /**
   * Errors produced during dispatch.
   */
  readonly errors:
    readonly unknown[];

  /**
   * Middleware execution results.
   */
  readonly middlewareExecutions?:
    readonly {
      readonly middlewareId:
        string;
      readonly result:
        unknown;
      readonly duration:
        number;
    }[];
}

/**
 * Event bus lifecycle state.
 */
export enum EventBusState {
  CREATED =
    "created",

  ACTIVE =
    "active",

  DISPOSED =
    "disposed",
}

/**
 * Event bus change notification.
 */
export interface EventBusEvent {
  readonly type:
    | "started"
    | "stopped"
    | "published";

  readonly event?:
    Event;

  readonly timestamp:
    Date;
}

/**
 * Listener for event bus lifecycle activity.
 */
export type EventBusListener =
  (
    event:
      EventBusEvent,
  ) =>
    void;

/**
 * High-level event bus.
 */
export class EventBus {
  private readonly emitter:
    EventEmitter;

  private readonly registry:
    EventRegistry;

  private readonly options:
    Required<
      Pick<
        EventBusOptions,
        "requireRegistration"
      >
    >;

  private busMiddleware: RegisteredEventMiddleware[];

  private readonly listeners =
    new Set<EventBusListener>();

  private state:
    EventBusState =
    EventBusState.CREATED;

  constructor(
    options:
      EventBusOptions = {},
  ) {
    this.options = {
      requireRegistration:
        options.requireRegistration ??
        false,
    };

    this.registry =
      new EventRegistry(
        options.registry,
      );

    this.emitter =
      new EventEmitter(
        {
          ...options.emitter,
          errorMode:
            options.emitter?.errorMode ??
            EventErrorMode.CONTINUE,
        },
      );

    this.busMiddleware =
      (options.middleware ?? []).map(
        (
          m,
          index,
        ) =>
          this.registerMiddlewareItem(
            m,
            index,
          ),
      );
  }

  /**
   * Starts the event bus.
   */
  start():
    this {
    this.ensureNotDisposed();

    if (
      this.state ===
      EventBusState.ACTIVE
    ) {
      return this;
    }

    this.state =
      EventBusState.ACTIVE;

    this.notify({
      type:
        "started",

      timestamp:
        new Date(),
    });

    return this;
  }

  /**
   * Stops the event bus.
   *
   * The bus can be started again after stopping.
   */
  stop():
    this {
    this.ensureNotDisposed();

    if (
      this.state !==
      EventBusState.ACTIVE
    ) {
      return this;
    }

    this.state =
      EventBusState.CREATED;

    this.notify({
      type:
        "stopped",

      timestamp:
        new Date(),
    });

    return this;
  }

  /**
   * Registers an event definition.
   */
  register<
    TType extends EventType,
    TPayload,
  >(
    definition:
      EventDefinition<
        TType,
        TPayload
      >,
  ) {
    this.ensureUsable();

    return this.registry.register(
      definition,
    );
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
    this.ensureUsable();

    return this.emitter.on(
      eventType,
      handler,
      options,
    );
  }

  /**
   * Registers a one-time event handler.
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
   * Removes a registered handler.
   */
  off(
    subscription:
      EventSubscription,
  ):
    boolean {
    this.ensureNotDisposed();

    return this.emitter.off(
      subscription,
    );
  }

  /**
   * Adds middleware to the bus.
   *
   * Returns a removal function.
   */
  use(
    middleware:
      EventMiddlewareLike,
    options:
      EventMiddlewareOptions = {},
  ):
    () => void {
    this.ensureNotDisposed();

    const id =
      options.id ??
      createEventMiddlewareId();

    const registered: RegisteredEventMiddleware =
      {
        id,
        description:
          options.description,
        priority:
          options.priority ?? 0,
        enabled:
          options.enabled ?? true,
        middleware,
      };

    this.busMiddleware.push(registered);

    return () => {
      const idx = this.busMiddleware.indexOf(registered);
      if (idx >= 0) {
        this.busMiddleware.splice(idx, 1);
      }
    };
  }

  /**
   * Publishes an existing event.
   */
  async publish<
    TEvent extends Event,
  >(
    event:
      TEvent,
    options:
      PublishOptions = {},
  ):
    Promise<
      EventPublishResult<TEvent>
    > {
    this.ensureUsable();

    if (
      options.signal?.aborted
    ) {
      throw new EventDispatchAbortedError(
        event,
      );
    }

    if (
      this.options
        .requireRegistration &&
      !this.registry.has(
        event.type,
      )
    ) {
      throw new EventError(
        `Event type "${event.type}" is not registered.`,
        {
          code:
            "EVENT_TYPE_NOT_REGISTERED",

          event,
        },
      );
    }

    // Combine bus-level and per-publication middleware
    const allMiddleware = [
      ...this.busMiddleware,
      ...(options.middleware ?? []).map(
        (
          m,
          index,
        ) =>
          this.registerMiddlewareItem(
            m,
            index +
              this.busMiddleware.length,
          ),
      ),
    ];

    // Run middleware pipeline around the actual dispatch
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
        return this.emitter.emit(
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

    this.notify({
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
  async publishEvent<
    TPayload,
  >(
    input:
      EventInput<TPayload>,
    options:
      PublishOptions = {},
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

    return this.publish(
      event,
      options,
    );
  }

  /**
   * Emits an event.
   *
   * Alias for publish().
   */
  async emit<
    TEvent extends Event,
  >(
    event:
      TEvent,
    options:
      PublishOptions = {},
  ):
    Promise<
      EventPublishResult<TEvent>
    > {
    return this.publish(
      event,
      options,
    );
  }

  /**
   * Returns an event definition.
   */
  getDefinition<
    TType extends EventType,
    TPayload = unknown,
  >(
    eventType:
      TType,
  ) {
    this.ensureUsable();

    return this.registry.get<
      TType,
      TPayload
    >(
      eventType,
    );
  }

  /**
   * Checks whether an event type is registered.
   */
  hasEvent(
    eventType:
      EventType,
  ):
    boolean {
    this.ensureUsable();

    return this.registry.has(
      eventType,
    );
  }

  /**
   * Unregisters an event definition.
   */
  unregister(
    eventType:
      EventType,
  ):
    boolean {
    this.ensureUsable();

    return this.registry.unregister(
      eventType,
    );
  }

  /**
   * Returns the registry.
   */
  getRegistry():
    EventRegistry {
    this.ensureUsable();

    return this.registry;
  }

  /**
   * Returns the emitter.
   */
  getEmitter():
    EventEmitter {
    this.ensureUsable();

    return this.emitter;
  }

  /**
   * Returns all registered event definitions.
   */
  getDefinitions() {
    this.ensureUsable();

    return this.registry.getDefinitions();
  }

  /**
   * Returns all registered handlers.
   */
  getHandlers():
    readonly RegisteredEventHandler[] {
    this.ensureUsable();

    return this.emitter.getRegistrations();
  }

  /**
   * Returns the current bus state.
   */
  getState():
    EventBusState {
    return this.state;
  }

  /**
   * Whether the bus is active.
   */
  isActive():
    boolean {
    return (
      this.state ===
      EventBusState.ACTIVE
    );
  }

  /**
   * Returns the number of registered event definitions.
   */
  get eventCount():
    number {
    return this.registry.eventCount;
  }

  /**
   * Returns the number of registered handlers.
   */
  get handlerCount():
    number {
    return this.emitter.listenerCount;
  }

  /**
   * Subscribes to bus-level activity.
   */
  subscribe(
    listener:
      EventBusListener,
  ):
    () => void {
    this.ensureNotDisposed();

    this.listeners.add(
      listener,
    );

    return () => {
      this.listeners.delete(
        listener,
      );
    };
  }

  /**
   * Disposes the bus permanently.
   */
  dispose():
    void {
    if (
      this.state ===
      EventBusState.DISPOSED
    ) {
      return;
    }

    this.emitter.dispose();
    this.registry.dispose();

    this.listeners.clear();

    this.state =
      EventBusState.DISPOSED;
  }

  /**
   * Converts an unknown event failure into EventError.
   */
  toError(
    error:
      unknown,
    event?:
      Event,
  ):
    EventError {
    return toEventError(
      error,
      {
        event,
      },
    );
  }

  /**
   * Normalizes a middleware item into a RegisteredEventMiddleware.
   */
  private registerMiddlewareItem(
    item:
      EventMiddlewareLike,
    index:
      number,
  ):
    RegisteredEventMiddleware {
    const id =
      `bus-mw-${index}`;

    if (
      isFunctionEventMiddleware(
        item,
      )
    ) {
      return {
        id,
        priority:
          0,
        enabled:
          true,
        middleware:
          item,
      };
    }

    if (
      isObjectEventMiddleware(
        item,
      )
    ) {
      return {
        id,
        priority:
          0,
        enabled:
          true,
        middleware:
          item,
      };
    }

    // Already a registered middleware
    return item as RegisteredEventMiddleware;
  }

  /**
   * Ensures the bus is usable.
   */
  private ensureUsable():
    void {
    this.ensureNotDisposed();

    if (
      this.state ===
      EventBusState.CREATED
    ) {
      this.start();
    }
  }

  /**
   * Ensures the bus has not been disposed.
   */
  private ensureNotDisposed():
    void {
    if (
      this.state ===
      EventBusState.DISPOSED
    ) {
      throw new EventError(
        "Event bus has already been disposed.",
        {
          code:
            "EVENT_BUS_DISPOSED",
        },
      );
    }
  }

  /**
   * Notifies bus listeners.
   */
  private notify(
    event:
      EventBusEvent,
  ):
    void {
    for (
      const listener of
      this.listeners
    ) {
      try {
        listener(
          event,
        );
      } catch {
        /**
         * Observers must never be able to break
         * event bus operations.
         */
      }
    }
  }
}

/**
 * Creates an EventBus.
 */
export function createEventBus(
  options:
    EventBusOptions = {},
):
  EventBus {
  return new EventBus(
    options,
  );
}

/**
 * Creates and starts an EventBus.
 */
export function createStartedEventBus(
  options:
    EventBusOptions = {},
):
  EventBus {
  return new EventBus(
    options,
  ).start();
}
