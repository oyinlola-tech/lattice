/**
 * Event registry query functions for Zudolib.
 */

import type { Event, EventType } from "../eventTypes/eventDefinition.type.js";

import {
  normalizeEventType,
  matchesEventType,
} from "../eventTypes/eventType.type.js";

import type { RegisteredEventHandler } from "../eventHandler/eventHandler.core.js";

import type { RegisteredEventDefinition } from "./eventRegistry.type.js";

/**
 * Returns handlers matching an event.
 */
export function getHandlersForEvent(
  handlers: Map<string, RegisteredEventHandler>,
  event: Event,
): readonly RegisteredEventHandler[] {
  return [...handlers.values()].filter((handler) => {
    if (!handler.enabled) {
      return false;
    }

    return matchesEventType(event.type, handler.eventType);
  });
}

/**
 * Returns handlers matching an event type.
 */
export function getHandlersForType(
  handlers: Map<string, RegisteredEventHandler>,
  eventType: EventType,
): readonly RegisteredEventHandler[] {
  const type = normalizeEventType(eventType);

  return [...handlers.values()].filter((handler) =>
    matchesEventType(type, handler.eventType),
  );
}

/**
 * Returns all event definitions as an array.
 */
export function getAllDefinitions(
  definitions: Map<EventType, RegisteredEventDefinition>,
): readonly RegisteredEventDefinition[] {
  return [...definitions.values()];
}

/**
 * Returns all handlers as an array.
 */
export function getAllHandlers(
  handlers: Map<string, RegisteredEventHandler>,
): readonly RegisteredEventHandler[] {
  return [...handlers.values()];
}
