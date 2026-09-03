/**
 * Event bus type definitions for Zudo.
 */

import type { Event } from "../eventTypes/eventDefinition.type.js";

import type {
  EventEmitterMode,
  EventErrorMode,
} from "../eventEmitter/eventEmitter.type.js";

import type { EventMiddlewareLike } from "../eventMiddleware/eventMiddleware.type.js";

export interface EventBusOptions {
  readonly emitter?: {
    readonly mode?: EventEmitterMode;
    readonly errorMode?: EventErrorMode;
    readonly freezeEvents?: boolean;
  };
  readonly registry?: {
    readonly allowDuplicateDefinitions?: boolean;
    readonly allowDuplicateHandlerIds?: boolean;
  };
  readonly requireRegistration?: boolean;
  readonly middleware?: readonly EventMiddlewareLike[];
}

export interface PublishOptions {
  readonly mode?: EventEmitterMode;
  readonly errorMode?: EventErrorMode;
  readonly signal?: AbortSignal;
  readonly metadata?: Readonly<Record<string, unknown>>;
  readonly middleware?: readonly EventMiddlewareLike[];
}

export interface EventPublishResult<TEvent extends Event = Event> {
  readonly event: TEvent;
  readonly handled: boolean;
  readonly handlerCount: number;
  readonly results: readonly unknown[];
  readonly errors: readonly unknown[];
  readonly middlewareExecutions?: readonly {
    readonly middlewareId: string;
    readonly result: unknown;
    readonly duration: number;
  }[];
}

export enum EventBusState {
  CREATED = "created",
  ACTIVE = "active",
  DISPOSED = "disposed",
}

export interface EventBusEvent {
  readonly type: "started" | "stopped" | "published";
  readonly event?: Event;
  readonly timestamp: Date;
}

export type EventBusListener = (event: EventBusEvent) => void;
