/**
 * Event handler and middleware error classes.
 */

import { ErrorCode } from "../../base/types/errorCode.type.js";
import { EventError } from "./eventError.base.js";

/** Error thrown when an event handler fails. */
export class EventHandlerError extends EventError {
  constructor(
    message: string,
    options: {
      handlerId: string;
      eventType?: string;
      eventId?: string;
      cause?: unknown;
    },
  ) {
    super(message, {
      code: ErrorCode.EVENT_HANDLER_FAILED as ErrorCode | string,
      handlerId: options.handlerId,
      eventType: options.eventType,
      eventId: options.eventId,
      cause: options.cause,
    });
  }
}

/** Creates an event handler error from an unknown failure. */
export function createEventHandlerError(
  handlerId: string,
  eventType: string,
  eventId: string,
  cause: unknown,
): EventHandlerError {
  return new EventHandlerError(
    `Event handler "${handlerId}" failed while processing "${eventType}".`,
    { handlerId, eventType, eventId, cause },
  );
}

/** Error thrown when an event handler cannot be found. */
export class EventHandlerNotFoundError extends EventError {
  constructor(handlerId: string) {
    super(
      `Event handler "${handlerId}" was not found.`,
      {
        code: ErrorCode.RESOURCE_NOT_FOUND as ErrorCode | string,
        handlerId,
        statusCode: 404,
        expose: true,
      },
    );
  }
}

/** Error thrown when an event handler is already registered. */
export class DuplicateEventHandlerError extends EventError {
  constructor(handlerId: string) {
    super(
      `Event handler "${handlerId}" is already registered.`,
      {
        code: ErrorCode.CONFLICT,
        handlerId,
        statusCode: 409,
        expose: true,
      },
    );
  }
}

/** Error thrown when event middleware fails. */
export class EventMiddlewareError extends EventError {
  public readonly middlewareId?: string;

  constructor(
    message: string,
    options: {
      middlewareId?: string;
      eventType?: string;
      eventId?: string;
      cause?: unknown;
    } = {},
  ) {
    super(message, {
      code: ErrorCode.MIDDLEWARE_EXECUTION as ErrorCode | string,
      middlewareId: options.middlewareId,
      eventType: options.eventType,
      eventId: options.eventId,
      cause: options.cause,
    });
    this.middlewareId = options.middlewareId;
  }
}
