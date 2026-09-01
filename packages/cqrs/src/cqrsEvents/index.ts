/**
 * @oyinlola141/lattice-cqrs/cqrsEvents
 *
 * CQRS event types, event bus, and event result types.
 *
 * Re-uses the base Lattice EventBus and Event types,
 * extending them with aggregate-specific fields.
 */

export {
  type CqrsEvent,
  type CqrsEventExtensions,
  type CreateCqrsEventInput,
  type CqrsEventHandler,
  type CqrsEventHandlerRegistration,
  createEventId,
  createCqrsEvent,
  getEventType,
  getAggregateId,
  isCqrsEvent,
  isAggregateEvent,
  createCqrsEventHandler,
  createEvent,
  type EventHandler,
  type EventHandlerRegistration,
  createEventHandler,
} from "./cqrsEvents.type.js";

export {
  EventBus,
  type EventBusOptions,
  type EventPublishResult,
  createEventBus,
  createStartedEventBus,
  type PublishOptions,
  EventBusState,
  type EventBusEvent,
  type EventBusListener,
} from "./cqrsEventBus.core.js";

export {
  type EventResultStatus,
  type EventResult,
  type CreateEventResultOptions,
  createEventResult,
  createSuccessfulEventResult,
  createPartialEventResult,
  createFailedEventResult,
  isEventPublished,
  isEventPartiallyPublished,
  isEventFailed,
  hasEventHandlerFailures,
  allEventHandlersSucceeded,
  getEventErrors,
  withEventResultMetadata,
} from "./cqrsEventResult.type.js";
