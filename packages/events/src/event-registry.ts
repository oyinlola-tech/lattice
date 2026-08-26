/**
 * Event registry for Lattice.
 *
 * The registry owns event definitions and registered handlers.
 * It does not perform event dispatching. Dispatching belongs to
 * EventEmitter and higher-level routing belongs to EventBus.
 */

import type {
  Event,
  EventDefinition,
  EventType,
} from "./event.js";

import type {
  EventTypePattern,
} from "./event-type.js";

import type {
  EventHandlerLike,
  EventHandlerOptions,
  RegisteredEventHandler,
} from "./event-handler.js";

import {
  createEventHandler,
} from "./event-handler.js";

import {
  isValidEventType,
  isValidEventTypePattern,
  matchesEventType,
  normalizeEventType,
} from "./event-type.js";

import type {
  EventSubscription,
} from "./event-subscription.js";

import {
  createEventSubscription,
} from "./event-subscription.js";

/**
 * Registry configuration.
 */
export interface EventRegistryOptions {
  /**
   * Whether duplicate event definitions are allowed.
   *
   * Defaults to false.
   */
  readonly allowDuplicateDefinitions?:
    boolean;

  /**
   * Whether duplicate handler IDs are allowed.
   *
   * Defaults to false.
   */
  readonly allowDuplicateHandlerIds?:
    boolean;
}

/**
 * Event registry change type.
 */
export enum EventRegistryChangeType {
  EVENT_REGISTERED =
    "event.registered",

  EVENT_UNREGISTERED =
    "event.unregistered",

  HANDLER_REGISTERED =
    "handler.registered",

  HANDLER_UNREGISTERED =
    "handler.unregistered",
}

/**
 * Event registry change notification.
 */
export interface EventRegistryChange {
  readonly type:
    EventRegistryChangeType;

  readonly eventType:
    EventType;

  readonly handler?:
    RegisteredEventHandler;

  readonly timestamp:
    Date;
}

/**
 * Registry listener.
 */
export type EventRegistryListener =
  (
    change:
      EventRegistryChange,
  ) =>
    void;

/**
 * Registered event definition.
 */
export interface RegisteredEventDefinition<
  TType extends EventType = EventType,
  TPayload = unknown,
> {
  readonly type:
    TType;

  readonly definition:
    EventDefinition<
      TType,
      TPayload
    >;

  readonly registeredAt:
    Date;
}

import {
  DuplicateEventDefinitionError,
  EventDefinitionNotFoundError,
  DuplicateEventHandlerError,
  EventHandlerNotFoundError,
} from "./event-error.js";

export {
  DuplicateEventDefinitionError,
  EventDefinitionNotFoundError,
  DuplicateEventHandlerError,
  EventHandlerNotFoundError,
};

/**
 * Main event registry.
 */
export class EventRegistry {
  private readonly definitions =
    new Map<
      EventType,
      RegisteredEventDefinition
    >();

  private readonly handlers =
    new Map<
      string,
      RegisteredEventHandler
    >();

  private readonly listeners =
    new Set<
      EventRegistryListener
    >();

  private readonly options:
    Required<EventRegistryOptions>;

  private disposed =
    false;

  constructor(
    options:
      EventRegistryOptions = {},
  ) {
    this.options = {
      allowDuplicateDefinitions:
        options.allowDuplicateDefinitions ??
        false,

      allowDuplicateHandlerIds:
        options.allowDuplicateHandlerIds ??
        false,
    };
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
  ):
    RegisteredEventDefinition<
      TType,
      TPayload
    > {
    this.ensureActive();

    const type =
      normalizeEventType(
        definition.type,
      );

    if (
      !isValidEventType(
        type,
      )
    ) {
      throw new TypeError(
        `Invalid event type "${definition.type}".`,
      );
    }

    if (
      this.definitions.has(
        type,
      ) &&
      !this.options
        .allowDuplicateDefinitions
    ) {
      throw new DuplicateEventDefinitionError(
        type,
      );
    }

    const registered:
      RegisteredEventDefinition<
        TType,
        TPayload
      > = Object.freeze({
      type:
        type as TType,

      definition,

      registeredAt:
        new Date(),
    });

    this.definitions.set(
      type,
      registered as RegisteredEventDefinition,
    );

    this.notify({
      type:
        EventRegistryChangeType.EVENT_REGISTERED,

      eventType:
        type,

      timestamp:
        new Date(),
    });

    return registered;
  }

  /**
   * Registers a handler.
   */
  registerHandler<
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

    if (
      !isValidEventTypePattern(
        eventType,
      )
    ) {
      throw new TypeError(
        `Invalid event type pattern "${eventType}".`,
      );
    }

    const normalizedPattern =
      eventType === "*"
        ? "*"
        : eventType.endsWith(
            ".*",
          )
          ? `${normalizeEventType(
              eventType.slice(
                0,
                -2,
              ),
            )}.*`
          : normalizeEventType(
              eventType,
            );

    const registration =
      createEventHandler(
        handler,
        {
          ...options,

          eventType:
            normalizedPattern,
        },
      );

    if (
      this.handlers.has(
        registration.id,
      ) &&
      !this.options
        .allowDuplicateHandlerIds
    ) {
      throw new DuplicateEventHandlerError(
        registration.id,
      );
    }

    this.handlers.set(
      registration.id,
      registration as RegisteredEventHandler,
    );

    this.notify({
      type:
        EventRegistryChangeType.HANDLER_REGISTERED,

      eventType:
        normalizedPattern,

      handler:
        registration as RegisteredEventHandler,

      timestamp:
        new Date(),
    });

    return createEventSubscription(
      () => {
        this.unregisterHandler(
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
  }

  /**
   * Gets an event definition.
   */
  get<
    TType extends EventType,
    TPayload = unknown,
  >(
    eventType:
      TType,
  ):
    RegisteredEventDefinition<
      TType,
      TPayload
    > |
    undefined {
    this.ensureActive();

    return this.definitions.get(
      normalizeEventType(
        eventType,
      ),
    ) as
      | RegisteredEventDefinition<
          TType,
          TPayload
        >
      | undefined;
  }

  /**
   * Gets an event definition or throws.
   */
  require<
    TType extends EventType,
    TPayload = unknown,
  >(
    eventType:
      TType,
  ):
    RegisteredEventDefinition<
      TType,
      TPayload
    > {
    const definition =
      this.get<
        TType,
        TPayload
      >(
        eventType,
      );

    if (
      !definition
    ) {
      throw new EventDefinitionNotFoundError(
        eventType,
      );
    }

    return definition;
  }

  /**
   * Checks whether an event definition exists.
   */
  has(
    eventType:
      EventType,
  ):
    boolean {
    this.ensureActive();

    return this.definitions.has(
      normalizeEventType(
        eventType,
      ),
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
    this.ensureActive();

    const type =
      normalizeEventType(
        eventType,
      );

    const removed =
      this.definitions.delete(
        type,
      );

    if (
      removed
    ) {
      this.notify({
        type:
          EventRegistryChangeType.EVENT_UNREGISTERED,

        eventType:
          type,

        timestamp:
          new Date(),
      });
    }

    return removed;
  }

  /**
   * Gets a registered handler.
   */
  getHandler(
    handlerId:
      string,
  ):
    RegisteredEventHandler |
    undefined {
    this.ensureActive();

    return this.handlers.get(
      handlerId,
    );
  }

  /**
   * Gets a handler or throws.
   */
  requireHandler(
    handlerId:
      string,
  ):
    RegisteredEventHandler {
    const handler =
      this.getHandler(
        handlerId,
      );

    if (
      !handler
    ) {
      throw new EventHandlerNotFoundError(
        handlerId,
      );
    }

    return handler;
  }

  /**
   * Checks whether a handler exists.
   */
  hasHandler(
    handlerId:
      string,
  ):
    boolean {
    this.ensureActive();

    return this.handlers.has(
      handlerId,
    );
  }

  /**
   * Unregisters a handler.
   */
  unregisterHandler(
    handlerId:
      string,
  ):
    boolean {
    this.ensureActive();

    const handler =
      this.handlers.get(
        handlerId,
      );

    if (
      !handler
    ) {
      return false;
    }

    const removed =
      this.handlers.delete(
        handlerId,
      );

    if (
      removed
    ) {
      this.notify({
        type:
          EventRegistryChangeType.HANDLER_UNREGISTERED,

        eventType:
          handler.eventType,

        handler,

        timestamp:
          new Date(),
      });
    }

    return removed;
  }

  /**
   * Returns all event definitions.
   */
  getDefinitions():
    readonly RegisteredEventDefinition[] {
    this.ensureActive();

    return [
      ...this.definitions.values(),
    ];
  }

  /**
   * Returns all handlers.
   */
  getHandlers():
    readonly RegisteredEventHandler[] {
    this.ensureActive();

    return [
      ...this.handlers.values(),
    ];
  }

  /**
   * Returns handlers matching an event.
   */
  getHandlersForEvent(
    event:
      Event,
  ):
    readonly RegisteredEventHandler[] {
    this.ensureActive();

    return [
      ...this.handlers.values(),
    ].filter(
      (
        handler,
      ) => {
        if (
          !handler.enabled
        ) {
          return false;
        }

        return matchesEventType(
          event.type,
          handler.eventType,
        );
      },
    );
  }

  /**
   * Returns handlers matching an event type.
   */
  getHandlersForType(
    eventType:
      EventType,
  ):
    readonly RegisteredEventHandler[] {
    this.ensureActive();

    const type =
      normalizeEventType(
        eventType,
      );

    return [
      ...this.handlers.values(),
    ].filter(
      (
        handler,
      ) =>
        matchesEventType(
          type,
          handler.eventType,
        ),
    );
  }

  /**
   * Subscribes to registry changes.
   */
  subscribe(
    listener:
      EventRegistryListener,
  ):
    () => void {
    this.ensureActive();

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
   * Returns the number of event definitions.
   */
  get eventCount():
    number {
    return this.definitions.size;
  }

  /**
   * Returns the number of handlers.
   */
  get handlerCount():
    number {
    return this.handlers.size;
  }

  /**
   * Clears handlers and definitions.
   */
  clear():
    void {
    this.ensureActive();

    const handlers =
      [
        ...this.handlers.keys(),
      ];

    for (
      const handlerId of
      handlers
    ) {
      this.unregisterHandler(
        handlerId,
      );
    }

    const eventTypes =
      [
        ...this.definitions.keys(),
      ];

    for (
      const eventType of
      eventTypes
    ) {
      this.unregister(
        eventType,
      );
    }
  }

  /**
   * Disposes the registry.
   */
  dispose():
    void {
    if (
      this.disposed
    ) {
      return;
    }

    this.clear();

    this.listeners.clear();

    this.disposed =
      true;
  }

  /**
   * Whether the registry is disposed.
   */
  isDisposed():
    boolean {
    return this.disposed;
  }

  /**
   * Notifies registry listeners.
   */
  private notify(
    change:
      EventRegistryChange,
  ):
    void {
    for (
      const listener of
      this.listeners
    ) {
      try {
        listener(
          change,
        );
      } catch {
        /**
         * Registry observers must not be able to break
         * registry mutations.
         */
      }
    }
  }

  /**
   * Ensures the registry is active.
   */
  private ensureActive():
    void {
    if (
      this.disposed
    ) {
      throw new Error(
        "EventRegistry has already been disposed.",
      );
    }
  }
}

/**
 * Creates an event registry.
 */
export function createEventRegistry(
  options:
    EventRegistryOptions = {},
):
  EventRegistry {
  return new EventRegistry(
    options,
  );
}