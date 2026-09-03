/**
 * Event registry store for Zudolib.
 *
 * The registry owns event definitions and registered handlers.
 * It does not perform event dispatching. Dispatching belongs to
 * EventEmitter and higher-level routing belongs to EventBus.
 */

import type {
  Event,
  EventDefinition,
  EventType,
} from "../eventTypes/eventDefinition.type.js";

import type { EventTypePattern } from "../eventTypes/eventType.type.js";

import type {
  EventHandlerLike,
  EventHandlerOptions,
  RegisteredEventHandler,
} from "../eventHandler/eventHandler.core.js";

import type { EventSubscription } from "../eventSubscription/eventSubscription.core.js";

import {
  DuplicateEventDefinitionError,
  EventDefinitionNotFoundError,
  DuplicateEventHandlerError,
  EventHandlerNotFoundError,
} from "../eventErrors/eventError.base.js";

import type {
  EventRegistryOptions,
  EventRegistryChange,
  EventRegistryListener,
  RegisteredEventDefinition,
} from "./eventRegistry.type.js";

import {
  registryRegister,
  registryRegisterHandler,
  registryUnregister,
  registryUnregisterHandler,
} from "./eventRegistry.registration.js";

import {
  getHandlersForEvent,
  getHandlersForType,
  getAllDefinitions,
  getAllHandlers,
} from "./eventRegistry.queries.js";

import {
  registryClear,
  registryDispose,
  registryNotify,
} from "./eventRegistry.lifecycle.js";

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
  private readonly definitions = new Map<
    EventType,
    RegisteredEventDefinition
  >();

  private readonly handlers = new Map<string, RegisteredEventHandler>();

  private readonly listeners = new Set<EventRegistryListener>();

  private readonly options: Required<EventRegistryOptions>;

  private disposed = false;

  constructor(options: EventRegistryOptions = {}) {
    this.options = {
      allowDuplicateDefinitions: options.allowDuplicateDefinitions ?? false,

      allowDuplicateHandlerIds: options.allowDuplicateHandlerIds ?? false,
    };
  }

  register<TType extends EventType, TPayload>(
    definition: EventDefinition<TType, TPayload>,
  ): RegisteredEventDefinition<TType, TPayload> {
    return registryRegister(
      definition,
      this.definitions,
      this.options,
      () => this.ensureActive(),
      (c) => this.notify(c),
    );
  }

  registerHandler<TEvent extends Event = Event>(
    eventType: EventTypePattern,
    handler: EventHandlerLike<TEvent>,
    options: Omit<EventHandlerOptions, "eventType"> = {},
  ): EventSubscription {
    return registryRegisterHandler(
      eventType,
      handler,
      options,
      this.handlers,
      this.options,
      () => this.ensureActive(),
      (c) => this.notify(c),
    );
  }

  get<TType extends EventType, TPayload = unknown>(
    eventType: TType,
  ): RegisteredEventDefinition<TType, TPayload> | undefined {
    this.ensureActive();

    return this.definitions.get(eventType) as
      RegisteredEventDefinition<TType, TPayload> | undefined;
  }

  require<TType extends EventType, TPayload = unknown>(
    eventType: TType,
  ): RegisteredEventDefinition<TType, TPayload> {
    const definition = this.get<TType, TPayload>(eventType);

    if (!definition) {
      throw new EventDefinitionNotFoundError(eventType);
    }

    return definition;
  }

  has(eventType: EventType): boolean {
    this.ensureActive();

    return this.definitions.has(eventType);
  }

  unregister(eventType: EventType): boolean {
    return registryUnregister(
      eventType,
      this.definitions,
      () => this.ensureActive(),
      (c) => this.notify(c),
    );
  }

  getHandler(handlerId: string): RegisteredEventHandler | undefined {
    this.ensureActive();

    return this.handlers.get(handlerId);
  }

  requireHandler(handlerId: string): RegisteredEventHandler {
    const handler = this.getHandler(handlerId);

    if (!handler) {
      throw new EventHandlerNotFoundError(handlerId);
    }

    return handler;
  }

  hasHandler(handlerId: string): boolean {
    this.ensureActive();

    return this.handlers.has(handlerId);
  }

  unregisterHandler(handlerId: string): boolean {
    return registryUnregisterHandler(
      handlerId,
      this.handlers,
      () => this.ensureActive(),
      (c) => this.notify(c),
    );
  }

  getDefinitions(): readonly RegisteredEventDefinition[] {
    this.ensureActive();

    return getAllDefinitions(this.definitions);
  }

  getHandlers(): readonly RegisteredEventHandler[] {
    this.ensureActive();

    return getAllHandlers(this.handlers);
  }

  getHandlersForEvent(event: Event): readonly RegisteredEventHandler[] {
    this.ensureActive();

    return getHandlersForEvent(this.handlers, event);
  }

  getHandlersForType(eventType: EventType): readonly RegisteredEventHandler[] {
    this.ensureActive();

    return getHandlersForType(this.handlers, eventType);
  }

  subscribe(listener: EventRegistryListener): () => void {
    this.ensureActive();

    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  get eventCount(): number {
    return this.definitions.size;
  }

  get handlerCount(): number {
    return this.handlers.size;
  }

  clear(): void {
    registryClear(
      this.definitions,
      this.handlers,
      () => this.ensureActive(),
      (c) => this.notify(c),
    );
  }

  dispose(): void {
    registryDispose(
      this.disposed,
      this.definitions,
      this.handlers,
      this.listeners,
      () => this.ensureActive(),
      (c) => this.notify(c),
    );

    this.disposed = true;
  }

  isDisposed(): boolean {
    return this.disposed;
  }

  private notify(change: EventRegistryChange): void {
    registryNotify(change, this.listeners);
  }

  private ensureActive(): void {
    if (this.disposed) {
      throw new Error("EventRegistry has already been disposed.");
    }
  }
}

/**
 * Creates an event registry.
 */
export function createEventRegistry(
  options: EventRegistryOptions = {},
): EventRegistry {
  return new EventRegistry(options);
}
