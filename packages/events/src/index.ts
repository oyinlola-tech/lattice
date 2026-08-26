/**
 * Public API for @lattice/events.
 *
 * Keep this file as the single public entry point for the package.
 * Internal implementation files should not need to be imported directly
 * by consumers.
 */

/* Event primitives */
export type {
  Event,
  EventDefinition,
  EventInput,
  EventType,
} from "./event.js";

export type {
  EventTypePattern,
} from "./event-type.js";

export {
  createEvent,
} from "./event.js";

/* Event types */
export {
  isValidEventType,
  isValidEventTypePattern,
  matchesEventType,
  normalizeEventType,
} from "./event-type.js";

/* Event payload */
export type {
  EventPayload,
  EventPayloadMap,
} from "./event-payload.js";

/* Event handlers */
export type {
  EventHandler,
  EventHandlerContext,
  EventHandlerLike,
  EventHandlerObject,
  EventHandlerOptions,
  EventHandlerResult,
  RegisteredEventHandler,
} from "./event-handler.js";

export {
  createEventHandler,
  createEventHandlerContext,
  createEventHandlerId,
  disableEventHandler,
  enableEventHandler,
  executeEventHandler,
  fireAndForgetHandler,
  getMatchingEventHandlers,
  handlerMatchesEvent,
  isEventHandler,
  isFunctionEventHandler,
  isObjectEventHandler,
  onceEventHandler,
  prioritizedEventHandler,
  setEventHandlerPriority,
  sortEventHandlers,
  typedEventHandler,
} from "./event-handler.js";

/* Event subscriptions */
export type {
  EventSubscription,
  EventSubscriptionGroup,
  EventSubscriptionOptions,
} from "./event-subscription.js";

export {
  createEventSubscription,
} from "./event-subscription.js";

/* Event emitter */
export type {
  EventEmitResult,
  EventEmitterOptions,
  EmitOptions,
  EventHandlerExecutionResult,
} from "./event-emitter.js";

export {
  EventEmitter,
  EventEmitterMode,
  EventErrorMode,
  createEventEmitter,
} from "./event-emitter.js";

/* Event registry */
export type {
  EventRegistryChange,
  EventRegistryListener,
  EventRegistryOptions,
  RegisteredEventDefinition,
} from "./event-registry.js";

export {
  EventRegistry,
  EventRegistryChangeType,
  createEventRegistry,
} from "./event-registry.js";

/* Event errors */
export {
 DuplicateEventDefinitionError as RegistryDuplicateEventDefinitionError,
  DuplicateEventHandlerError as RegistryDuplicateEventHandlerError,
  EventDefinitionNotFoundError as RegistryEventDefinitionNotFoundError,
  EventHandlerNotFoundError as RegistryEventHandlerNotFoundError,
} from "./event-registry.js";

export {
  EventError,
  EventHandlerError,
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
  InvalidEventError,
  InvalidEventTypeError,
  EventTypeNotFoundError,
  createEventHandlerError,
  getEventErrorCause,
  isEventError,
  toEventError,
} from "./event-error.js";

/* Event middleware */
export type {
  EventMiddleware,
  EventMiddlewareContext,
  EventMiddlewareLike,
  EventMiddlewareNext,
  EventMiddlewareObject,
  EventMiddlewareOptions,
  EventMiddlewarePipelineOptions,
  EventMiddlewarePipelineResult,
  EventMiddlewareExecution,
  RegisteredEventMiddleware,
} from "./event-middleware.js";

export {
  abortableEventMiddleware,
  afterEvent,
  aroundEvent,
  beforeEvent,
  createEventMiddleware,
  createEventMiddlewareContext,
  createEventMiddlewareId,
  disableEventMiddleware,
  enableEventMiddleware,
  executeEventMiddleware,
  executeEventMiddlewarePipeline,
  isEventMiddleware,
  isFunctionEventMiddleware,
  isObjectEventMiddleware,
  sortEventMiddleware,
  stateEventMiddleware,
  timingEventMiddleware,
  validateEventMiddleware,
} from "./event-middleware.js";

/* Event bus */
export type {
  EventBusEvent,
  EventBusListener,
  EventBusOptions,
  EventPublishResult,
  PublishOptions,
} from "./event-bus.js";

export {
  EventBus,
  EventBusState,
  createEventBus,
  createStartedEventBus,
} from "./event-bus.js";