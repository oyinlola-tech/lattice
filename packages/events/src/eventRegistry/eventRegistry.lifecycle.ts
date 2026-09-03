/**
 * Event registry lifecycle methods for Zudo.
 */

import type { EventType } from "../eventTypes/eventDefinition.type.js";

import type { RegisteredEventHandler } from "../eventHandler/eventHandler.core.js";

import type {
  EventRegistryChange,
  EventRegistryListener,
  RegisteredEventDefinition,
} from "./eventRegistry.type.js";

import {
  registryUnregister,
  registryUnregisterHandler,
} from "./eventRegistry.registration.js";

/**
 * Clears all handlers and definitions from the registry.
 */
export function registryClear(
  definitions: Map<EventType, RegisteredEventDefinition>,
  handlers: Map<string, RegisteredEventHandler>,
  ensureActive: () => void,
  notify: (change: EventRegistryChange) => void,
): void {
  ensureActive();

  const handlerIds = [...handlers.keys()];

  for (const handlerId of handlerIds) {
    registryUnregisterHandler(handlerId, handlers, ensureActive, notify);
  }

  const eventTypes = [...definitions.keys()];

  for (const eventType of eventTypes) {
    registryUnregister(eventType, definitions, ensureActive, notify);
  }
}

/**
 * Disposes the registry.
 */
export function registryDispose(
  disposed: boolean,
  definitions: Map<EventType, RegisteredEventDefinition>,
  handlers: Map<string, RegisteredEventHandler>,
  listeners: Set<EventRegistryListener>,
  ensureActive: () => void,
  notify: (change: EventRegistryChange) => void,
): void {
  if (disposed) {
    return;
  }

  registryClear(definitions, handlers, ensureActive, notify);

  listeners.clear();
}

/**
 * Notifies registry listeners.
 */
export function registryNotify(
  change: EventRegistryChange,
  listeners: Set<EventRegistryListener>,
): void {
  for (const listener of listeners) {
    try {
      listener(change);
    } catch {
      /**
       * Registry observers must not be able to break
       * registry mutations.
       */
    }
  }
}
