/**
 * Event emitter core class for Zudolib.
 */

import type { Event, EventInput } from "../eventTypes/eventDefinition.type.js";

import type { EventTypePattern } from "../eventTypes/eventType.type.js";

import { createEvent } from "../eventTypes/eventDefinition.type.js";

import type {
  EventHandlerLike,
  EventHandlerOptions,
  RegisteredEventHandler,
} from "../eventHandler/eventHandler.core.js";

import {
  createEventHandler,
  createEventHandlerContext,
  getMatchingEventHandlers,
} from "../eventHandler/eventHandler.core.js";

import type { EventSubscription } from "../eventSubscription/eventSubscription.core.js";

import {
  EventSubscriptionGroup,
  createEventSubscription,
} from "../eventSubscription/eventSubscription.core.js";

import type {
  EventEmitterOptions,
  EmitOptions,
  EventHandlerExecutionResult,
  EventEmitResult,
  EmitterListener,
} from "./eventEmitter.type.js";

import { EventEmitterMode, EventErrorMode } from "./eventEmitter.type.js";

import { emitSequential } from "./eventEmitter.sequential.js";

import { emitParallel } from "./eventEmitter.parallel.js";

import { createAbortError } from "./eventEmitter.abort.js";

/**
 * Main local event emitter.
 */
export class EventEmitter {
  private readonly listeners = new Map<string, EmitterListener>();

  private readonly options: Required<EventEmitterOptions>;

  private disposed = false;

  constructor(options: EventEmitterOptions = {}) {
    this.options = {
      mode: options.mode ?? EventEmitterMode.SEQUENTIAL,

      errorMode: options.errorMode ?? EventErrorMode.THROW,

      freezeEvents: options.freezeEvents ?? true,
    };
  }

  on<TEvent extends Event = Event>(
    eventType: EventTypePattern,
    handler: EventHandlerLike<TEvent>,
    options: Omit<EventHandlerOptions, "eventType"> = {},
  ): EventSubscription {
    this.ensureActive();

    const registration = createEventHandler(handler, {
      ...options,
      eventType,
    });

    return this.addRegistration(registration as RegisteredEventHandler);
  }

  once<TEvent extends Event = Event>(
    eventType: EventTypePattern,
    handler: EventHandlerLike<TEvent>,
    options: Omit<EventHandlerOptions, "eventType" | "once"> = {},
  ): EventSubscription {
    return this.on(eventType, handler, {
      ...options,
      once: true,
    });
  }

  onAny<TEvent extends Event = Event>(
    handler: EventHandlerLike<TEvent>,
    options: Omit<EventHandlerOptions, "eventType"> = {},
  ): EventSubscription {
    return this.on("*", handler, options);
  }

  off(subscription: EventSubscription): boolean {
    this.ensureActive();

    const removed = this.listeners.delete(subscription.id);

    if (removed && subscription.active) {
      subscription.unsubscribe();
    }

    return removed;
  }

  async emit<TEvent extends Event>(
    event: TEvent,
    options: EmitOptions = {},
  ): Promise<EventEmitResult<TEvent>> {
    this.ensureActive();

    if (options.signal?.aborted) {
      throw createAbortError();
    }

    const mode = options.mode ?? this.options.mode;

    const errorMode = options.errorMode ?? this.options.errorMode;

    const handlers = getMatchingEventHandlers(this.getRegistrations(), event);

    const context = createEventHandlerContext(event, {
      signal: options.signal,
      metadata: options.metadata,
    });

    if (handlers.length === 0) {
      return {
        event,
        handled: false,
        results: [],
        errors: [],
      };
    }

    const results: EventHandlerExecutionResult[] = [];

    const errors: unknown[] = [];

    const removeOnceHandler = (handlerId: string) =>
      this.removeHandler(handlerId);

    if (mode === EventEmitterMode.PARALLEL) {
      await emitParallel(
        handlers,
        event,
        context,
        errorMode,
        results,
        errors,
        removeOnceHandler,
      );
    } else {
      await emitSequential(
        handlers,
        event,
        context,
        errorMode,
        results,
        errors,
        removeOnceHandler,
      );
    }

    return {
      event,
      handled: results.length > 0,
      results,
      errors,
    };
  }

  async emitEvent<TPayload>(
    input: EventInput<TPayload>,
    options: EmitOptions = {},
  ): Promise<EventEmitResult<Event<TPayload>>> {
    const event = createEvent(input);

    return this.emit(event, options);
  }

  get listenerCount(): number {
    return this.listeners.size;
  }

  getRegistrations(): readonly RegisteredEventHandler[] {
    return [...this.listeners.values()].map(({ registration }) => registration);
  }

  removeAllListeners(): void {
    this.ensureActive();

    const subscriptions = [...this.listeners.values()].map(
      ({ subscription }) => subscription,
    );

    for (const subscription of subscriptions) {
      subscription.unsubscribe();
    }

    this.listeners.clear();
  }

  createSubscriptionGroup(): EventSubscriptionGroup {
    this.ensureActive();

    return new EventSubscriptionGroup();
  }

  dispose(): void {
    if (this.disposed) {
      return;
    }

    this.removeAllListeners();

    this.disposed = true;
  }

  isDisposed(): boolean {
    return this.disposed;
  }

  private addRegistration(
    registration: RegisteredEventHandler,
  ): EventSubscription {
    const subscription = createEventSubscription(
      () => {
        this.listeners.delete(registration.id);
      },
      {
        id: registration.id,
        description: registration.description,
      },
    );

    this.listeners.set(registration.id, {
      registration,
      subscription,
    });

    return subscription;
  }

  private removeHandler(id: string): void {
    const listener = this.listeners.get(id);

    if (!listener) {
      return;
    }

    this.listeners.delete(id);

    listener.subscription.unsubscribe();
  }

  private ensureActive(): void {
    if (this.disposed) {
      throw new Error("EventEmitter has already been disposed.");
    }
  }
}

/**
 * Creates a new event emitter.
 */
export function createEventEmitter(
  options: EventEmitterOptions = {},
): EventEmitter {
  return new EventEmitter(options);
}
