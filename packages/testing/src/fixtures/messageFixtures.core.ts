/**
 * Message fixtures for testing.
 *
 * Factory functions for creating test message payloads.
 */

import type { Message, MessageInput } from "@zudoliblib/messaging";

import type { MessageId } from "@zudoliblib/messaging";

/**
 * Options for creating a test message.
 */
export interface CreateMessageOptions<TPayload> {
  readonly type?: string;
  readonly payload?: TPayload;
  readonly id?: MessageId;
  readonly timestamp?: Date;
  readonly metadata?: Record<string, unknown>;
}

let messageCounter = 0;

/**
 * Creates a test message.
 *
 * @param options - Message options.
 * @returns A test Message instance.
 *
 * @example
 * ```ts
 * const message = createMessage<{ userId: string }>({
 *   type: "user.created",
 *   payload: { userId: "123" },
 * });
 *
 * expect(message.type).toBe("user.created");
 * expect(message.payload).toEqual({ userId: "123" });
 * ```
 */
export function createMessage<TPayload = unknown>(
  options: CreateMessageOptions<TPayload> = {},
): Message<TPayload> {
  messageCounter++;

  return {
    id: options.id ?? (`msg_${Date.now()}_${messageCounter}` as MessageId),
    type: options.type ?? "test.message",
    payload: options.payload ?? ({} as TPayload),
    timestamp: options.timestamp ?? new Date(),
    ...(options.metadata ? { metadata: options.metadata } : {}),
  };
}

/**
 * Creates a test message input.
 *
 * @param type - Message type.
 * @param payload - Message payload.
 * @param metadata - Optional metadata.
 * @returns A MessageInput instance.
 */
export function createMessageInput<TPayload>(
  type: string,
  payload: TPayload,
  metadata?: Record<string, unknown>,
): MessageInput<TPayload> {
  return {
    type,
    payload,
    ...(metadata ? { metadata } : {}),
  };
}

/**
 * Creates multiple test messages.
 *
 * @param count - Number of messages to create.
 * @param factory - Factory function for each message.
 * @returns Array of test Messages.
 */
export function createMessages<TPayload>(
  count: number,
  factory: (index: number) => CreateMessageOptions<TPayload>,
): Message<TPayload>[] {
  return Array.from({ length: count }, (_, i) => createMessage(factory(i)));
}
