/**
 * MessageContext type definitions for Lattice.
 *
 * The context carries correlation and causation identifiers
 * through the dispatch chain, enabling distributed tracing
 * and message lineage.
 *
 * @module messageContext/messageContextType
 */

import type {
  Message,
  MessageCorrelationId,
  MessageCausationId,
} from "../message/messageType.type.js";

/**
 * Execution context attached to a message during dispatch.
 *
 * Carries correlation, causation, and arbitrary headers
 * through the dispatch chain.
 */
export interface MessageContext {
  /** The original message being dispatched. */
  readonly message: Message;

  /** Correlation identifier for the dispatch chain. */
  readonly correlationId: MessageCorrelationId;

  /** Causation identifier linking to the parent message. */
  readonly causationId: MessageCausationId;

  /** Optional headers carried through the pipeline. */
  readonly headers: Readonly<Record<string, unknown>>;

  /** AbortSignal for cancellation. */
  readonly signal: AbortSignal;

  /** Mutable state for middleware. */
  readonly state: Map<string, unknown>;

  /** When the dispatch started. */
  readonly startedAt: Date;
}

/**
 * Options for creating a message context.
 */
export interface MessageContextOptions {
  /** Correlation identifier. Falls back to message ID. */
  readonly correlationId?: MessageCorrelationId;

  /** Causation identifier. Falls back to message ID. */
  readonly causationId?: MessageCausationId;

  /** Optional headers. */
  readonly headers?: Readonly<Record<string, unknown>>;

  /** Optional AbortSignal. */
  readonly signal?: AbortSignal;

  /** Optional mutable state. */
  readonly state?: Map<string, unknown>;
}

/**
 * Creates a message context from a message and options.
 */
export function createMessageContext(
  message: Message,
  options: MessageContextOptions = {},
): MessageContext {
  return Object.freeze({
    message,
    correlationId: options.correlationId ?? message.correlationId ?? (message.id as unknown as MessageCorrelationId),
    causationId: options.causationId ?? message.causationId ?? (message.id as unknown as MessageCausationId),
    headers: Object.freeze({ ...options.headers }),
    signal: options.signal ?? new AbortController().signal,
    state: options.state ?? new Map<string, unknown>(),
    startedAt: new Date(),
  });
}
