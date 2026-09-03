/**
 * Core event primitives for Lattice.
 *
 * Events are immutable messages that describe something that
 * happened inside the application or framework.
 *
 * This module intentionally contains no dispatching logic.
 */

import type {
  EventId as BaseEventId,
  CorrelationId as BaseCorrelationId,
} from "@zudo/constants";

/**
 * Unique identifier for an event instance.
 * Re-exported from @zudo/constants for type safety.
 */
export type EventId = BaseEventId;

/**
 * Event type identifier.
 *
 * Examples:
 *
 * "user.created"
 * "module.loaded"
 * "runtime.started"
 */
export type EventType = string;

/**
 * Event timestamp.
 */
export type EventTimestamp = Date;

/**
 * Event source identifier.
 *
 * Identifies the subsystem that produced the event.
 */
export type EventSource = string;

/**
 * Correlation identifier.
 *
 * Useful for connecting multiple events belonging to the
 * same operation/request/workflow.
 * Re-exported from @zudo/constants for type safety.
 */
export type EventCorrelationId = BaseCorrelationId;

/**
 * Causation identifier.
 *
 * Identifies the event or operation that caused this event.
 */
export type EventCausationId = string;

/**
 * Generic event payload.
 */
export type EventPayload = unknown;

/**
 * Base event contract.
 *
 * Every Lattice event must contain a type, unique identifier,
 * timestamp, and payload.
 */
export interface Event<TPayload = EventPayload> {
  /**
   * Unique event identifier.
   */
  readonly id: EventId;

  /**
   * Event type.
   */
  readonly type: EventType;

  /**
   * Event payload.
   */
  readonly payload: TPayload;

  /**
   * Time at which the event was created.
   */
  readonly timestamp: EventTimestamp;

  /**
   * Optional source subsystem.
   */
  readonly source?: EventSource;

  /**
   * Optional correlation identifier.
   */
  readonly correlationId?: EventCorrelationId;

  /**
   * Optional causation identifier.
   */
  readonly causationId?: EventCausationId;

  /**
   * Optional event metadata.
   */
  readonly metadata?: Readonly<Record<string, unknown>>;
}

/**
 * Input used to create an event.
 */
export interface EventInput<TPayload = EventPayload> {
  /**
   * Optional event identifier.
   */
  readonly id?: EventId;

  /**
   * Event type.
   */
  readonly type: EventType;

  /**
   * Event payload.
   */
  readonly payload: TPayload;

  /**
   * Optional timestamp.
   */
  readonly timestamp?: EventTimestamp | number;

  /**
   * Optional source subsystem.
   */
  readonly source?: EventSource;

  /**
   * Optional correlation identifier.
   */
  readonly correlationId?: EventCorrelationId;

  /**
   * Optional causation identifier.
   */
  readonly causationId?: EventCausationId;

  /**
   * Optional event metadata.
   */
  readonly metadata?: Readonly<Record<string, unknown>>;
}

/**
 * Typed event definition.
 *
 * Allows a specific event type to declare its payload.
 */
export interface EventDefinition<
  TType extends EventType = EventType,
  TPayload = EventPayload,
> {
  readonly type: TType;

  readonly create: (
    payload: TPayload,
    options?: Omit<EventInput<TPayload>, "type" | "payload">,
  ) => Event<TPayload>;
}

/**
 * Determines whether an unknown value satisfies the Event
 * contract.
 */
export function isEvent(value: unknown): value is Event {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.type === "string" &&
    candidate.timestamp instanceof Date &&
    "payload" in candidate
  );
}

/**
 * Creates a unique event identifier.
 * Returns a branded EventId type from @zudo/constants.
 */
export function createEventId(): EventId {
  const uuid = crypto.randomUUID();

  return `event:${uuid}` as EventId;
}

/**
 * Normalizes an event timestamp.
 */
function normalizeTimestamp(timestamp: EventInput["timestamp"]): Date {
  if (timestamp instanceof Date) {
    return new Date(timestamp.getTime());
  }

  if (typeof timestamp === "number") {
    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) {
      throw new TypeError("Invalid event timestamp.");
    }

    return date;
  }

  return new Date();
}

/**
 * Freezes event metadata.
 */
function normalizeMetadata(
  metadata: EventInput["metadata"],
): Readonly<Record<string, unknown>> | undefined {
  if (metadata === undefined) {
    return undefined;
  }

  return Object.freeze({
    ...metadata,
  });
}

/**
 * Creates an immutable event.
 */
export function createEvent<TPayload = EventPayload>(
  input: EventInput<TPayload>,
): Event<TPayload> {
  if (typeof input.type !== "string" || input.type.trim().length === 0) {
    throw new TypeError("Event type must be a non-empty string.");
  }

  const event: Event<TPayload> = {
    id: input.id ?? createEventId(),

    type: input.type,

    payload: input.payload,

    timestamp: normalizeTimestamp(input.timestamp),

    source: input.source,

    correlationId: input.correlationId,

    causationId: input.causationId,

    metadata: normalizeMetadata(input.metadata),
  };

  return Object.freeze(event);
}

/**
 * Creates a typed event definition.
 */
export function defineEvent<TType extends EventType, TPayload>(
  type: TType,
): EventDefinition<TType, TPayload> {
  if (type.trim().length === 0) {
    throw new TypeError("Event type must be a non-empty string.");
  }

  return Object.freeze({
    type,

    create(
      payload: TPayload,
      options: Omit<EventInput<TPayload>, "type" | "payload"> = {},
    ): Event<TPayload> {
      return createEvent({
        ...options,

        type,

        payload,
      });
    },
  });
}

/**
 * Creates a copy of an event with modified metadata.
 *
 * The original event remains immutable.
 */
export function withEventMetadata<TPayload>(
  event: Event<TPayload>,
  metadata: Readonly<Record<string, unknown>>,
): Event<TPayload> {
  return createEvent({
    ...event,

    metadata: {
      ...(event.metadata ?? {}),
      ...metadata,
    },
  });
}

/**
 * Creates a derived event while preserving correlation
 * information from the original event.
 */
export function createDerivedEvent<TPayload>(
  sourceEvent: Event,
  input: EventInput<TPayload>,
): Event<TPayload> {
  return createEvent({
    ...input,

    correlationId:
      input.correlationId ??
      sourceEvent.correlationId ??
      (sourceEvent.id as unknown as BaseCorrelationId),

    causationId: input.causationId ?? sourceEvent.id,
  });
}

/**
 * Returns the event type.
 */
export function getEventType<TPayload>(event: Event<TPayload>): EventType {
  return event.type;
}

/**
 * Returns the event payload.
 */
export function getEventPayload<TPayload>(event: Event<TPayload>): TPayload {
  return event.payload;
}

/**
 * Returns a human-readable event description.
 */
export function describeEvent(event: Event): string {
  return `${event.type} (${event.id})`;
}
