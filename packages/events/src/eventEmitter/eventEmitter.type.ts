/**
 * Event emitter type definitions for Lattice.
 */

import type {
  Event,
} from "../eventTypes/eventDefinition.type.js";

import type {
  RegisteredEventHandler,
} from "../eventHandler/eventHandler.core.js";

import type {
  EventSubscription,
} from "../eventSubscription/eventSubscription.core.js";

export enum EventEmitterMode {
  SEQUENTIAL = "sequential",
  PARALLEL = "parallel",
}

export enum EventErrorMode {
  THROW = "throw",
  CONTINUE = "continue",
}

export interface EventEmitterOptions {
  readonly mode?: EventEmitterMode;
  readonly errorMode?: EventErrorMode;
  readonly freezeEvents?: boolean;
}

export interface EmitOptions {
  readonly mode?: EventEmitterMode;
  readonly errorMode?: EventErrorMode;
  readonly signal?: AbortSignal;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export interface EventHandlerExecutionResult {
  readonly handlerId: string;
  readonly eventId: string;
  readonly result: unknown;
  readonly duration: number;
  readonly error?: unknown;
}

export interface EventEmitResult<TEvent extends Event = Event> {
  readonly event: TEvent;
  readonly handled: boolean;
  readonly results: readonly EventHandlerExecutionResult[];
  readonly errors: readonly unknown[];
}

export interface EmitterListener {
  readonly registration: RegisteredEventHandler;
  readonly subscription: EventSubscription;
}
