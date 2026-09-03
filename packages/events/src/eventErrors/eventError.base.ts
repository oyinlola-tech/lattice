/**
 * @zudoliblib/events/eventErrors/eventError.base
 *
 * All event error types are centralized in @zudoliblib/errors.
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
} from "@zudoliblib/errors";
