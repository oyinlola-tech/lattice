/**
 * Core message type definitions for Zudolib.
 *
 * Messages are the fundamental unit of communication in the
 * messaging infrastructure. They carry type information, a
 * unique identity, and an arbitrary payload.
 *
 * @module message/messageType
 */

import type {
  MessageId as BaseEntityMessageId,
  CorrelationId as BaseCorrelationId,
  MessageCausationId as BaseEntityCausationId,
} from "@zudoliblib/constants";

/**
 * Unique identifier for a message instance.
 * Re-exported from @zudoliblib/constants for type safety.
 */
export type MessageId = BaseEntityMessageId;

/**
 * Message type identifier.
 *
 * Examples:
 * - "order.created"
 * - "user.registered"
 * - "getInventory"
 */
export type MessageType = string;

/**
 * Message timestamp.
 */
export type MessageTimestamp = Date;

/**
 * Message source identifier.
 *
 * Identifies the subsystem that produced the message.
 */
export type MessageSource = string;

/**
 * Correlation identifier.
 *
 * Useful for connecting multiple messages belonging to the
 * same operation/request/workflow.
 * Re-exported from @zudoliblib/constants for type safety.
 */
export type MessageCorrelationId = BaseCorrelationId;

/**
 * Causation identifier.
 *
 * Identifies the message or operation that caused this message.
 * Re-exported from @zudoliblib/constants for type safety.
 */
export type MessageCausationId = BaseEntityCausationId;

/**
 * Generic message payload.
 */
export type MessagePayload = unknown;

/**
 * Base message contract.
 *
 * Every Zudolib message must contain a type, unique identifier,
 * timestamp, and payload.
 */
export interface Message<TPayload = MessagePayload> {
  /** Unique message identifier. */
  readonly id: MessageId;

  /** Message type. */
  readonly type: MessageType;

  /** Message payload. */
  readonly payload: TPayload;

  /** Time at which the message was created. */
  readonly timestamp: MessageTimestamp;

  /** Optional source subsystem. */
  readonly source?: MessageSource;

  /** Optional correlation identifier. */
  readonly correlationId?: MessageCorrelationId;

  /** Optional causation identifier. */
  readonly causationId?: MessageCausationId;

  /** Optional message metadata. */
  readonly metadata?: Readonly<Record<string, unknown>>;
}

/**
 * Input used to create a message.
 */
export interface MessageInput<TPayload = MessagePayload> {
  /** Optional message identifier. */
  readonly id?: MessageId;

  /** Message type. */
  readonly type: MessageType;

  /** Message payload. */
  readonly payload: TPayload;

  /** Optional timestamp. */
  readonly timestamp?: MessageTimestamp | number;

  /** Optional source subsystem. */
  readonly source?: MessageSource;

  /** Optional correlation identifier. */
  readonly correlationId?: MessageCorrelationId;

  /** Optional causation identifier. */
  readonly causationId?: MessageCausationId;

  /** Optional message metadata. */
  readonly metadata?: Readonly<Record<string, unknown>>;
}
