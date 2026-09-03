/**
 * Event registry type definitions for Zudo.
 */

import type {
  Event,
  EventDefinition,
  EventType,
} from "../eventTypes/eventDefinition.type.js";

import type { RegisteredEventHandler } from "../eventHandler/eventHandler.core.js";

export interface EventRegistryOptions {
  readonly allowDuplicateDefinitions?: boolean;
  readonly allowDuplicateHandlerIds?: boolean;
}

export enum EventRegistryChangeType {
  EVENT_REGISTERED = "event.registered",
  EVENT_UNREGISTERED = "event.unregistered",
  HANDLER_REGISTERED = "handler.registered",
  HANDLER_UNREGISTERED = "handler.unregistered",
}

export interface EventRegistryChange {
  readonly type: EventRegistryChangeType;
  readonly eventType: EventType;
  readonly handler?: RegisteredEventHandler;
  readonly timestamp: Date;
}

export type EventRegistryListener = (change: EventRegistryChange) => void;

export interface RegisteredEventDefinition<
  TType extends EventType = EventType,
  TPayload = unknown,
> {
  readonly type: TType;
  readonly definition: EventDefinition<TType, TPayload>;
  readonly registeredAt: Date;
}
