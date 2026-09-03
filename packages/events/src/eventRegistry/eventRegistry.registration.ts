/**
 * Event registry registration methods for Zudolib.
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

import { createEventHandler } from "../eventHandler/eventHandler.core.js";

import {
  isValidEventType,
  isValidEventTypePattern,
  normalizeEventType,
} from "../eventTypes/eventType.type.js";

import type { EventSubscription } from "../eventSubscription/eventSubscription.core.js";

import { createEventSubscription } from "../eventSubscription/eventSubscription.core.js";

import {
  DuplicateEventDefinitionError,
  DuplicateEventHandlerError,
} from "../eventErrors/eventError.base.js";

import type {
  EventRegistryChange,
  EventRegistryListener,
  RegisteredEventDefinition,
} from "./eventRegistry.type.js";

import { EventRegistryChangeType } from "./eventRegistry.type.js";

/**
 * Registers an event definition.
 */
export function registryRegister<TType extends EventType, TPayload>(
  definition: EventDefinition<TType, TPayload>,
  definitions: Map<EventType, RegisteredEventDefinition>,
  options: {
    allowDuplicateDefinitions: boolean;
  },
  ensureActive: () => void,
  notify: (change: EventRegistryChange) => void,
): RegisteredEventDefinition<TType, TPayload> {
  ensureActive();

  const type = normalizeEventType(definition.type);

  if (!isValidEventType(type)) {
    throw new TypeError(`Invalid event type "${definition.type}".`);
  }

  if (definitions.has(type) && !options.allowDuplicateDefinitions) {
    throw new DuplicateEventDefinitionError(type);
  }

  const registered: RegisteredEventDefinition<TType, TPayload> = Object.freeze({
    type: type as TType,

    definition,

    registeredAt: new Date(),
  });

  definitions.set(type, registered as RegisteredEventDefinition);

  notify({
    type: EventRegistryChangeType.EVENT_REGISTERED,

    eventType: type,

    timestamp: new Date(),
  });

  return registered;
}

/**
 * Registers a handler.
 */
export function registryRegisterHandler<TEvent extends Event = Event>(
  eventType: EventTypePattern,
  handler: EventHandlerLike<TEvent>,
  handlerOptions: Omit<EventHandlerOptions, "eventType">,
  handlers: Map<string, RegisteredEventHandler>,
  options: {
    allowDuplicateHandlerIds: boolean;
  },
  ensureActive: () => void,
  notify: (change: EventRegistryChange) => void,
): EventSubscription {
  ensureActive();

  if (!isValidEventTypePattern(eventType)) {
    throw new TypeError(`Invalid event type pattern "${eventType}".`);
  }

  const normalizedPattern =
    eventType === "*"
      ? "*"
      : eventType.endsWith(".*")
        ? `${normalizeEventType(eventType.slice(0, -2))}.*`
        : normalizeEventType(eventType);

  const registration = createEventHandler(handler, {
    ...handlerOptions,

    eventType: normalizedPattern,
  });

  if (handlers.has(registration.id) && !options.allowDuplicateHandlerIds) {
    throw new DuplicateEventHandlerError(registration.id);
  }

  handlers.set(registration.id, registration as RegisteredEventHandler);

  notify({
    type: EventRegistryChangeType.HANDLER_REGISTERED,

    eventType: normalizedPattern,

    handler: registration as RegisteredEventHandler,

    timestamp: new Date(),
  });

  return createEventSubscription(
    () => {
      registryUnregisterHandler(
        registration.id,
        handlers,
        ensureActive,
        notify,
      );
    },
    {
      id: registration.id,

      description: registration.description,
    },
  );
}

/**
 * Unregisters an event definition.
 */
export function registryUnregister(
  eventType: EventType,
  definitions: Map<EventType, RegisteredEventDefinition>,
  ensureActive: () => void,
  notify: (change: EventRegistryChange) => void,
): boolean {
  ensureActive();

  const type = normalizeEventType(eventType);

  const removed = definitions.delete(type);

  if (removed) {
    notify({
      type: EventRegistryChangeType.EVENT_UNREGISTERED,

      eventType: type,

      timestamp: new Date(),
    });
  }

  return removed;
}

/**
 * Unregisters a handler.
 */
export function registryUnregisterHandler(
  handlerId: string,
  handlers: Map<string, RegisteredEventHandler>,
  ensureActive: () => void,
  notify: (change: EventRegistryChange) => void,
): boolean {
  ensureActive();

  const handler = handlers.get(handlerId);

  if (!handler) {
    return false;
  }

  const removed = handlers.delete(handlerId);

  if (removed) {
    notify({
      type: EventRegistryChangeType.HANDLER_UNREGISTERED,

      eventType: handler.eventType,

      handler,

      timestamp: new Date(),
    });
  }

  return removed;
}
