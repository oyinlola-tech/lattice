/**
 * Event fixtures for testing.
 *
 * Factory functions for creating test event payloads.
 */

import type { Event, EventInput } from "@zudojs/events";

import type { EventId } from "@zudojs/constants";

/**
 * Options for creating a test event.
 */
export interface CreateEventOptions<TPayload> {
  readonly type?: string;
  readonly payload?: TPayload;
  readonly id?: EventId;
  readonly timestamp?: Date;
  readonly metadata?: Record<string, unknown>;
}

let eventCounter = 0;

/**
 * Creates a test event.
 *
 * @param options - Event options.
 * @returns A test Event instance.
 *
 * @example
 * ```ts
 * const event = createEvent<{ userId: string }>({
 *   type: "user.created",
 *   payload: { userId: "123" },
 * });
 *
 * expect(event.type).toBe("user.created");
 * expect(event.payload).toEqual({ userId: "123" });
 * ```
 */
export function createEvent<TPayload = unknown>(
  options: CreateEventOptions<TPayload> = {},
): Event<TPayload> {
  eventCounter++;

  return {
    id: options.id ?? (`evt_${Date.now()}_${eventCounter}` as EventId),
    type: options.type ?? "test.event",
    payload: options.payload ?? ({} as TPayload),
    timestamp: options.timestamp ?? new Date(),
    ...(options.metadata ? { metadata: options.metadata } : {}),
  };
}

/**
 * Creates a test event input.
 *
 * @param type - Event type.
 * @param payload - Event payload.
 * @param metadata - Optional metadata.
 * @returns An EventInput instance.
 */
export function createEventInput<TPayload>(
  type: string,
  payload: TPayload,
  metadata?: Record<string, unknown>,
): EventInput<TPayload> {
  return {
    type,
    payload,
    ...(metadata ? { metadata } : {}),
  };
}

/**
 * Creates multiple test events.
 *
 * @param count - Number of events to create.
 * @param factory - Factory function for each event.
 * @returns Array of test Events.
 */
export function createEvents<TPayload>(
  count: number,
  factory: (index: number) => CreateEventOptions<TPayload>,
): Event<TPayload>[] {
  return Array.from({ length: count }, (_, i) => createEvent(factory(i)));
}
