/**
 * Event bus core class for Lattice.
 */

import type {
  Event,
  EventDefinition,
  EventInput,
  EventType,
} from "../eventTypes/eventDefinition.type.js";

import type { EventTypePattern } from "../eventTypes/eventType.type.js";

import type {
  EventHandlerLike,
  EventHandlerOptions,
  RegisteredEventHandler,
} from "../eventHandler/eventHandler.core.js";

import type { EventSubscription } from "../eventSubscription/eventSubscription.core.js";

import { EventEmitter } from "../eventEmitter/eventEmitter.core.js";

import { EventErrorMode } from "../eventEmitter/eventEmitter.type.js";

import { EventRegistry } from "../eventRegistry/eventRegistry.store.js";

import { EventError, toEventError } from "../eventErrors/eventError.base.js";

import type {
  EventMiddlewareLike,
  EventMiddlewareOptions,
  RegisteredEventMiddleware,
} from "../eventMiddleware/eventMiddleware.type.js";

import type {
  EventBusOptions,
  PublishOptions,
  EventPublishResult,
  EventBusEvent,
  EventBusListener,
} from "./eventBus.type.js";

import { EventBusState } from "./eventBus.type.js";

export { EventBusState } from "./eventBus.type.js";

import {
  busOn,
  busOnce,
  busOnAny,
  busOff,
  busUse,
  registerMiddlewareItem,
} from "./eventBus.registration.js";

import { busPublish, busPublishEvent } from "./eventBus.publish.js";

/**
 * High-level event bus.
 */
export class EventBus {
  private readonly emitter: EventEmitter;

  private readonly registry: EventRegistry;

  private readonly options: Required<
    Pick<EventBusOptions, "requireRegistration">
  >;

  private busMiddleware: RegisteredEventMiddleware[];

  private readonly listeners = new Set<EventBusListener>();

  private state: EventBusState = EventBusState.CREATED;

  constructor(options: EventBusOptions = {}) {
    this.options = {
      requireRegistration: options.requireRegistration ?? false,
    };

    this.registry = new EventRegistry(options.registry);

    this.emitter = new EventEmitter({
      ...options.emitter,
      errorMode: options.emitter?.errorMode ?? EventErrorMode.CONTINUE,
    });

    this.busMiddleware = (options.middleware ?? []).map((m, index) =>
      registerMiddlewareItem(m, index),
    );
  }

  start(): this {
    this.ensureNotDisposed();

    if (this.state === EventBusState.ACTIVE) {
      return this;
    }

    this.state = EventBusState.ACTIVE;

    this.notify({
      type: "started",

      timestamp: new Date(),
    });

    return this;
  }

  stop(): this {
    this.ensureNotDisposed();

    if (this.state !== EventBusState.ACTIVE) {
      return this;
    }

    this.state = EventBusState.CREATED;

    this.notify({
      type: "stopped",

      timestamp: new Date(),
    });

    return this;
  }

  register<TType extends EventType, TPayload>(
    definition: EventDefinition<TType, TPayload>,
  ) {
    this.ensureUsable();

    return this.registry.register(definition);
  }

  on<TEvent extends Event = Event>(
    eventType: EventTypePattern,
    handler: EventHandlerLike<TEvent>,
    options: Omit<EventHandlerOptions, "eventType"> = {},
  ): EventSubscription {
    return busOn(this.emitter, eventType, handler, options, () =>
      this.ensureUsable(),
    );
  }

  once<TEvent extends Event = Event>(
    eventType: EventTypePattern,
    handler: EventHandlerLike<TEvent>,
    options: Omit<EventHandlerOptions, "eventType" | "once"> = {},
  ): EventSubscription {
    return busOnce(this.emitter, eventType, handler, options, () =>
      this.ensureUsable(),
    );
  }

  onAny<TEvent extends Event = Event>(
    handler: EventHandlerLike<TEvent>,
    options: Omit<EventHandlerOptions, "eventType"> = {},
  ): EventSubscription {
    return busOnAny(this.emitter, handler, options, () => this.ensureUsable());
  }

  off(subscription: EventSubscription): boolean {
    return busOff(this.emitter, subscription, () => this.ensureNotDisposed());
  }

  use(
    middleware: EventMiddlewareLike,
    options: EventMiddlewareOptions = {},
  ): () => void {
    this.ensureNotDisposed();

    return busUse(this.busMiddleware, middleware, options);
  }

  async publish<TEvent extends Event>(
    event: TEvent,
    options: PublishOptions = {},
  ): Promise<EventPublishResult<TEvent>> {
    return busPublish(
      event,
      options,
      this.emitter,
      this.registry,
      this.busMiddleware,
      this.options.requireRegistration,
      () => this.ensureUsable(),
      (e) => this.notify(e),
    );
  }

  async publishEvent<TPayload>(
    input: EventInput<TPayload>,
    options: PublishOptions = {},
  ): Promise<EventPublishResult<Event<TPayload>>> {
    return busPublishEvent(
      input,
      options,
      this.emitter,
      this.registry,
      this.busMiddleware,
      this.options.requireRegistration,
      () => this.ensureUsable(),
      (e) => this.notify(e),
    );
  }

  async emit<TEvent extends Event>(
    event: TEvent,
    options: PublishOptions = {},
  ): Promise<EventPublishResult<TEvent>> {
    return this.publish(event, options);
  }

  getDefinition<TType extends EventType, TPayload = unknown>(eventType: TType) {
    this.ensureUsable();

    return this.registry.get<TType, TPayload>(eventType);
  }

  hasEvent(eventType: EventType): boolean {
    this.ensureUsable();

    return this.registry.has(eventType);
  }

  unregister(eventType: EventType): boolean {
    this.ensureUsable();

    return this.registry.unregister(eventType);
  }

  getRegistry(): EventRegistry {
    this.ensureUsable();

    return this.registry;
  }

  getEmitter(): EventEmitter {
    this.ensureUsable();

    return this.emitter;
  }

  getDefinitions() {
    this.ensureUsable();

    return this.registry.getDefinitions();
  }

  getHandlers(): readonly RegisteredEventHandler[] {
    this.ensureUsable();

    return this.emitter.getRegistrations();
  }

  getState(): EventBusState {
    return this.state;
  }

  isActive(): boolean {
    return this.state === EventBusState.ACTIVE;
  }

  get eventCount(): number {
    return this.registry.eventCount;
  }

  get handlerCount(): number {
    return this.emitter.listenerCount;
  }

  subscribe(listener: EventBusListener): () => void {
    this.ensureNotDisposed();

    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  dispose(): void {
    if (this.state === EventBusState.DISPOSED) {
      return;
    }

    this.emitter.dispose();
    this.registry.dispose();

    this.listeners.clear();

    this.state = EventBusState.DISPOSED;
  }

  toError(error: unknown, event?: Event): EventError {
    return toEventError(error, {
      eventType: event?.type,
      eventId: event?.id,
    });
  }

  private ensureUsable(): void {
    this.ensureNotDisposed();

    if (this.state === EventBusState.CREATED) {
      this.start();
    }
  }

  private ensureNotDisposed(): void {
    if (this.state === EventBusState.DISPOSED) {
      throw new EventError("Event bus has already been disposed.", {
        code: "EVENT_BUS_DISPOSED",
      });
    }
  }

  private notify(event: EventBusEvent): void {
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch {
        /**
         * Observers must never be able to break
         * event bus operations.
         */
      }
    }
  }
}
