/**
 * Event handler primitives for Zudo.
 *
 * Handlers are responsible for processing events.
 * They do not own event registration or event dispatching.
 */

import type { Event, EventType } from "../eventTypes/eventDefinition.type.js";

import type { EventTypePattern } from "../eventTypes/eventType.type.js";

import { matchesEventType } from "../eventTypes/eventType.type.js";

/**
 * Result returned by an event handler.
 */
export type EventHandlerResult = void | unknown;

/**
 * Context supplied to an event handler.
 */
export interface EventHandlerContext<TEvent extends Event = Event> {
  /**
   * Event currently being handled.
   */
  readonly event: TEvent;

  /**
   * Event type.
   */
  readonly type: EventType;

  /**
   * Event identifier.
   */
  readonly eventId: string;

  /**
   * Optional correlation identifier.
   */
  readonly correlationId?: string;

  /**
   * Optional causation identifier.
   */
  readonly causationId?: string;

  /**
   * Abort signal for the current dispatch.
   */
  readonly signal: AbortSignal;

  /**
   * Metadata associated with the dispatch operation.
   */
  readonly metadata: Readonly<Record<string, unknown>>;
}

/**
 * Function-based event handler.
 */
export type EventHandler<TEvent extends Event = Event> = (
  event: TEvent,
  context: EventHandlerContext<TEvent>,
) => EventHandlerResult | Promise<EventHandlerResult>;

/**
 * Event handler object contract.
 */
export interface EventHandlerObject<TEvent extends Event = Event> {
  /**
   * Handles an event.
   */
  handle(
    event: TEvent,
    context: EventHandlerContext<TEvent>,
  ): EventHandlerResult | Promise<EventHandlerResult>;
}

/**
 * Supported event handler representation.
 */
export type EventHandlerLike<TEvent extends Event = Event> =
  EventHandler<TEvent> | EventHandlerObject<TEvent>;

/**
 * Options for an event handler.
 */
export interface EventHandlerOptions {
  /**
   * Optional handler identifier.
   */
  readonly id?: string;

  /**
   * Optional description.
   */
  readonly description?: string;

  /**
   * Event type or pattern handled by this handler.
   */
  readonly eventType?: EventTypePattern;

  /**
   * Handler execution priority.
   *
   * Higher values execute first.
   *
   * Defaults to 0.
   */
  readonly priority?: number;

  /**
   * Whether the handler is enabled.
   *
   * Defaults to true.
   */
  readonly enabled?: boolean;

  /**
   * Whether the handler should only execute once.
   */
  readonly once?: boolean;
}

/**
 * Complete registered event handler.
 */
export interface RegisteredEventHandler<TEvent extends Event = Event> {
  /**
   * Unique handler identifier.
   */
  readonly id: string;

  /**
   * Event type pattern handled by the handler.
   */
  readonly eventType: EventTypePattern;

  /**
   * Handler priority.
   */
  readonly priority: number;

  /**
   * Whether the handler is enabled.
   */
  readonly enabled: boolean;

  /**
   * Whether the handler executes only once.
   */
  readonly once: boolean;

  /**
   * Optional description.
   */
  readonly description?: string;

  /**
   * Actual handler.
   */
  readonly handler: EventHandlerLike<TEvent>;
}

/**
 * Generates a handler identifier.
 */
export function createEventHandlerId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return `handler:${crypto.randomUUID()}`;
  }

  return `handler:${Date.now().toString(36)}:${Math.random()
    .toString(36)
    .slice(2)}`;
}

/**
 * Creates an event handler context.
 */
export function createEventHandlerContext<TEvent extends Event>(
  event: TEvent,
  options: Partial<
    Pick<EventHandlerContext<TEvent>, "signal" | "metadata">
  > = {},
): EventHandlerContext<TEvent> {
  return Object.freeze({
    event,

    type: event.type,

    eventId: event.id,

    correlationId: event.correlationId,

    causationId: event.causationId,

    signal: options.signal ?? new AbortController().signal,

    metadata: Object.freeze({
      ...(options.metadata ?? {}),
    }),
  });
}

/**
 * Creates a registered event handler.
 */
export function createEventHandler<TEvent extends Event = Event>(
  handler: EventHandlerLike<TEvent>,
  options: EventHandlerOptions = {},
): RegisteredEventHandler<TEvent> {
  const eventType = options.eventType ?? "*";

  if (!isValidHandler(handler)) {
    throw new TypeError("Invalid event handler.");
  }

  return Object.freeze({
    id: options.id ?? createEventHandlerId(),

    eventType,

    priority: options.priority ?? 0,

    enabled: options.enabled ?? true,

    once: options.once ?? false,

    description: options.description,

    handler,
  });
}

/**
 * Determines whether a value is a function event handler.
 */
export function isFunctionEventHandler(value: unknown): value is EventHandler {
  return typeof value === "function";
}

/**
 * Determines whether a value is an object event handler.
 */
export function isObjectEventHandler(
  value: unknown,
): value is EventHandlerObject {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (
      value as {
        handle?: unknown;
      }
    ).handle === "function"
  );
}

/**
 * Determines whether a value is a supported event handler.
 */
export function isEventHandler(value: unknown): value is EventHandlerLike {
  return isFunctionEventHandler(value) || isObjectEventHandler(value);
}

/**
 * Internal handler validation.
 */
function isValidHandler(handler: unknown): boolean {
  return isEventHandler(handler);
}

/**
 * Executes an event handler regardless of whether it is
 * represented as a function or an object.
 */
export async function executeEventHandler<TEvent extends Event>(
  handler: EventHandlerLike<TEvent>,
  event: TEvent,
  context: EventHandlerContext<TEvent>,
): Promise<EventHandlerResult> {
  if (isFunctionEventHandler(handler)) {
    return handler(event, context);
  }

  return (handler as EventHandlerObject<TEvent>).handle(event, context);
}

/**
 * Determines whether a registered handler should process
 * a given event.
 */
export function handlerMatchesEvent<TEvent extends Event>(
  handler: RegisteredEventHandler<TEvent>,
  event: TEvent,
): boolean {
  if (!handler.enabled) {
    return false;
  }

  return matchesEventType(event.type, handler.eventType);
}

/**
 * Sorts handlers by execution priority.
 *
 * Higher priority handlers execute first.
 * Registration order is preserved for equal priorities.
 */
export function sortEventHandlers<TEvent extends Event>(
  handlers: readonly RegisteredEventHandler<TEvent>[],
): RegisteredEventHandler<TEvent>[] {
  return [...handlers].sort(
    (first, second) => second.priority - first.priority,
  );
}

/**
 * Filters handlers that can process an event.
 */
export function getMatchingEventHandlers<TEvent extends Event>(
  handlers: readonly RegisteredEventHandler<TEvent>[],
  event: TEvent,
): RegisteredEventHandler<TEvent>[] {
  return sortEventHandlers(
    handlers.filter((handler) => handlerMatchesEvent(handler, event)),
  );
}

/**
 * Creates a handler restricted to a specific event type.
 */
export function typedEventHandler<TEvent extends Event>(
  eventType: EventTypePattern,
  handler: EventHandlerLike<TEvent>,
  options: Omit<EventHandlerOptions, "eventType"> = {},
): RegisteredEventHandler<TEvent> {
  return createEventHandler(handler, {
    ...options,
    eventType,
  });
}

/**
 * Creates a handler that executes only once.
 */
export function onceEventHandler<TEvent extends Event>(
  eventType: EventTypePattern,
  handler: EventHandlerLike<TEvent>,
  options: Omit<EventHandlerOptions, "eventType" | "once"> = {},
): RegisteredEventHandler<TEvent> {
  return createEventHandler(handler, {
    ...options,

    eventType,

    once: true,
  });
}

/**
 * Creates an event handler with a specific priority.
 */
export function prioritizedEventHandler<TEvent extends Event>(
  eventType: EventTypePattern,
  priority: number,
  handler: EventHandlerLike<TEvent>,
  options: Omit<EventHandlerOptions, "eventType" | "priority"> = {},
): RegisteredEventHandler<TEvent> {
  return createEventHandler(handler, {
    ...options,

    eventType,

    priority,
  });
}

/**
 * Enables a registered handler.
 */
export function enableEventHandler<TEvent extends Event>(
  handler: RegisteredEventHandler<TEvent>,
): RegisteredEventHandler<TEvent> {
  return Object.freeze({
    ...handler,
    enabled: true,
  });
}

/**
 * Disables a registered handler.
 */
export function disableEventHandler<TEvent extends Event>(
  handler: RegisteredEventHandler<TEvent>,
): RegisteredEventHandler<TEvent> {
  return Object.freeze({
    ...handler,
    enabled: false,
  });
}

/**
 * Changes the priority of a handler.
 */
export function setEventHandlerPriority<TEvent extends Event>(
  handler: RegisteredEventHandler<TEvent>,
  priority: number,
): RegisteredEventHandler<TEvent> {
  if (!Number.isFinite(priority)) {
    throw new RangeError("Event handler priority must be a finite number.");
  }

  return Object.freeze({
    ...handler,
    priority,
  });
}

/**
 * Creates a handler that ignores its return value.
 */
export function fireAndForgetHandler<TEvent extends Event>(
  handler: EventHandlerLike<TEvent>,
): EventHandler<TEvent> {
  return async (event, context) => {
    await executeEventHandler(handler, event, context);
  };
}
