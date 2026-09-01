/**
 * @oyinlola141/lattice-events/eventErrors/eventError.base
 *
 * All event error types are centralized in @oyinlola141/lattice-errors.
 * This file re-exports them for backward compatibility.
 */

export {
  EventError,
  createEventError,
  isEventError,
  toEventError,
  EventPublishError,
  InvalidEventError,
  EventTypeNotFoundError,
  EventHandlerError,
  createEventHandlerError,
  EventHandlerNotFoundError,
  DuplicateEventHandlerError,
  DuplicateEventDefinitionError,
  EventDefinitionNotFoundError,
  EventDispatchAbortedError,
  EventEmitterDisposedError,
  EventRegistryDisposedError,
  EventSubscriptionClosedError,
  EventTimeoutError,
  EventMiddlewareError,
  EventSerializationError,
  EventDeserializationError,
} from "@oyinlola141/lattice-errors";
