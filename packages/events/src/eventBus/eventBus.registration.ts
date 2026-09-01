/**
 * Event bus registration and subscription methods for Lattice.
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

import type {
  EventMiddlewareLike,
  EventMiddlewareOptions,
  RegisteredEventMiddleware,
} from "../eventMiddleware/eventMiddleware.type.js";

import {
  createEventMiddlewareId,
  isFunctionEventMiddleware,
  isObjectEventMiddleware,
} from "../eventMiddleware/eventMiddleware.helper.js";

/**
 * Registers an event definition on the given registry.
 */
export function busRegister<TType extends EventType, TPayload>(
  registry: { register: Function },
  definition: EventDefinition<TType, TPayload>,
  ensureUsable: () => void,
) {
  ensureUsable();

  return registry.register(definition);
}

/**
 * Registers a handler on the emitter.
 */
export function busOn<TEvent extends Event = Event>(
  emitter: {
    on: (
      eventType: EventTypePattern,
      handler: EventHandlerLike<TEvent>,
      options: Omit<EventHandlerOptions, "eventType">,
    ) => EventSubscription;
  },
  eventType: EventTypePattern,
  handler: EventHandlerLike<TEvent>,
  options: Omit<EventHandlerOptions, "eventType"> = {},
  ensureUsable: () => void,
): EventSubscription {
  ensureUsable();

  return emitter.on(eventType, handler, options);
}

/**
 * Registers a one-time handler.
 */
export function busOnce<TEvent extends Event = Event>(
  emitter: {
    on: (
      eventType: EventTypePattern,
      handler: EventHandlerLike<TEvent>,
      options: Omit<EventHandlerOptions, "eventType">,
    ) => EventSubscription;
  },
  eventType: EventTypePattern,
  handler: EventHandlerLike<TEvent>,
  options: Omit<EventHandlerOptions, "eventType" | "once"> = {},
  ensureUsable: () => void,
): EventSubscription {
  return busOn(
    emitter,
    eventType,
    handler,
    {
      ...options,
      once: true,
    },
    ensureUsable,
  );
}

/**
 * Registers a wildcard handler.
 */
export function busOnAny<TEvent extends Event = Event>(
  emitter: {
    on: (
      eventType: EventTypePattern,
      handler: EventHandlerLike<TEvent>,
      options: Omit<EventHandlerOptions, "eventType">,
    ) => EventSubscription;
  },
  handler: EventHandlerLike<TEvent>,
  options: Omit<EventHandlerOptions, "eventType"> = {},
  ensureUsable: () => void,
): EventSubscription {
  return busOn(emitter, "*", handler, options, ensureUsable);
}

/**
 * Removes a handler.
 */
export function busOff(
  emitter: {
    off: (subscription: EventSubscription) => boolean;
  },
  subscription: EventSubscription,
  ensureNotDisposed: () => void,
): boolean {
  ensureNotDisposed();

  return emitter.off(subscription);
}

/**
 * Adds middleware to the bus.
 */
export function busUse(
  busMiddleware: RegisteredEventMiddleware[],
  middleware: EventMiddlewareLike,
  options: EventMiddlewareOptions = {},
): () => void {
  const id = options.id ?? createEventMiddlewareId();

  const registered: RegisteredEventMiddleware = {
    id,
    description: options.description,
    priority: options.priority ?? 0,
    enabled: options.enabled ?? true,
    middleware,
  };

  busMiddleware.push(registered);

  return () => {
    const idx = busMiddleware.indexOf(registered);

    if (idx >= 0) {
      busMiddleware.splice(idx, 1);
    }
  };
}

/**
 * Normalizes a middleware item into a RegisteredEventMiddleware.
 */
export function registerMiddlewareItem(
  item: EventMiddlewareLike,
  index: number,
): RegisteredEventMiddleware {
  const id = `bus-mw-${index}`;

  if (isFunctionEventMiddleware(item)) {
    return {
      id,
      priority: 0,
      enabled: true,
      middleware: item,
    };
  }

  if (isObjectEventMiddleware(item)) {
    return {
      id,
      priority: 0,
      enabled: true,
      middleware: item,
    };
  }

  return item as RegisteredEventMiddleware;
}
