/**
 * @zudo/events/eventTypes
 *
 * Event type definitions and payload types.
 */

export {
  type EventId,
  type EventType,
  type EventTimestamp,
  type EventSource,
  type EventCorrelationId,
  type EventCausationId,
  type EventPayload,
  type Event,
  type EventInput,
  type EventDefinition,
  isEvent,
  createEventId,
  createEvent,
  defineEvent,
  withEventMetadata,
  createDerivedEvent,
  getEventType,
  getEventPayload,
  describeEvent,
} from "./eventDefinition.type.js";

export {
  type ObjectEventPayload,
  type PrimitiveEventPayload,
  type JsonEventPayload,
  type PayloadOf,
  type PayloadMap,
  type EventPayloadFactory,
  type EventPayloadOptions,
  isPrimitiveEventPayload,
  isObjectEventPayload,
  isJsonEventPayload,
  createEventPayload,
  validateEventPayload,
} from "./eventPayload.type.js";

export {
  type EventTypeList,
  type EventTypePattern,
  type EventTypeOf,
  type EventUnion,
  isValidEventType,
  isValidEventTypePattern,
  normalizeEventType,
  createEventType,
  getEventNamespace,
} from "./eventType.type.js";
