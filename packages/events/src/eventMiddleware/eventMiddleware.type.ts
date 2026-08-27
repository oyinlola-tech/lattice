/**
 * Event middleware type definitions for Lattice.
 */

import type {
  Event,
} from "../eventTypes/eventDefinition.type.js";

import type {
  EventHandlerContext,
} from "../eventHandler/eventHandler.core.js";

export interface EventMiddlewareContext<TEvent extends Event = Event> {
  readonly event: TEvent;
  readonly handlerContext?: EventHandlerContext<TEvent>;
  readonly signal: AbortSignal;
  readonly metadata: Readonly<Record<string, unknown>>;
  readonly executionId: string;
  readonly startedAt: Date;
  readonly state: Map<string, unknown>;
}

export type EventMiddlewareNext<TResult = unknown> = () => Promise<TResult>;

export type EventMiddleware<TEvent extends Event = Event, TResult = unknown> = (
  context: EventMiddlewareContext<TEvent>,
  next: EventMiddlewareNext<TResult>,
) => Promise<TResult>;

export interface EventMiddlewareObject<TEvent extends Event = Event, TResult = unknown> {
  readonly handle: EventMiddleware<TEvent, TResult>;
}

export type EventMiddlewareLike<TEvent extends Event = Event, TResult = unknown> =
  | EventMiddleware<TEvent, TResult>
  | EventMiddlewareObject<TEvent, TResult>;

export interface EventMiddlewareOptions {
  readonly id?: string;
  readonly description?: string;
  readonly priority?: number;
  readonly enabled?: boolean;
}

export interface RegisteredEventMiddleware<TEvent extends Event = Event, TResult = unknown> {
  readonly id: string;
  readonly description?: string;
  readonly priority: number;
  readonly enabled: boolean;
  readonly middleware: EventMiddlewareLike<TEvent, TResult>;
}

export interface EventMiddlewareExecution<TResult = unknown> {
  readonly middlewareId: string;
  readonly result: TResult;
  readonly duration: number;
}

export interface EventMiddlewarePipelineResult<TResult = unknown> {
  readonly result: TResult;
  readonly executions: readonly EventMiddlewareExecution[];
  readonly duration: number;
}

export interface EventMiddlewarePipelineOptions {
  readonly signal?: AbortSignal;
  readonly metadata?: Readonly<Record<string, unknown>>;
  readonly state?: Map<string, unknown>;
}
