import { BaseError } from "../../base/core/baseError.core.js";
import type { BaseErrorOptions } from "../../base/types/baseError.type.js";

import {
  ErrorCategory,
} from "../../base/types/errorCategory.type.js";

import {
  ErrorCode,
} from "../../base/types/errorCode.type.js";

import {
  ErrorSeverity,
} from "../../base/types/errorSeverity.type.js";

/**
 * Options for creating an event error.
 */
export interface EventErrorOptions
  extends Omit<BaseErrorOptions, "category"> {
  readonly category?: ErrorCategory;
  readonly eventType?: string;
  readonly eventId?: string;
  readonly handlerId?: string;
  readonly middlewareId?: string;
}

/**
 * Base error for all event subsystem failures.
 */
export class EventError extends BaseError {
  public readonly eventType?: string;
  public readonly eventId?: string;
  public readonly handlerId?: string;

  constructor(
    message: string,
    options: EventErrorOptions = {},
  ) {
    super(
      message,
      {
        ...options,
        code:
          options.code ??
          ErrorCode.EVENT_HANDLING_FAILED,
        category:
          options.category ??
          ErrorCategory.EVENT,
        severity:
          options.severity ??
          ErrorSeverity.ERROR,
        statusCode:
          options.statusCode ?? 500,
        expose:
          options.expose ?? false,
        isOperational:
          options.isOperational ?? true,
      },
    );

    this.eventType = options.eventType;
    this.eventId = options.eventId;
    this.handlerId = options.handlerId;
  }

  public override toJSON() {
    return {
      ...super.toJSON(),
      ...(this.eventType !== undefined
        ? { eventType: this.eventType }
        : {}),
      ...(this.eventId !== undefined
        ? { eventId: this.eventId }
        : {}),
      ...(this.handlerId !== undefined
        ? { handlerId: this.handlerId }
        : {}),
    };
  }
}

/**
 * Creates an event error.
 */
export function createEventError(
  message: string,
  options: EventErrorOptions = {},
): EventError {
  return new EventError(message, options);
}

/**
 * Determines whether an unknown value is an EventError.
 */
export function isEventError(
  value: unknown,
): value is EventError {
  return value instanceof EventError;
}

/**
 * Converts an unknown thrown value into an EventError.
 */
export function toEventError(
  error: unknown,
  options: {
    message?: string;
    eventType?: string;
    eventId?: string;
    code?: string;
  } = {},
): EventError {
  if (error instanceof EventError) {
    return error;
  }

  if (error instanceof Error) {
    return new EventError(
      options.message ?? error.message,
      {
        code: options.code as ErrorCode | undefined,
        eventType: options.eventType,
        eventId: options.eventId,
        cause: error,
      },
    );
  }

  return new EventError(
    options.message ?? String(error),
    {
      code: options.code as ErrorCode | undefined,
      eventType: options.eventType,
      eventId: options.eventId,
      cause: error,
    },
  );
}

/**
 * Error raised when event publishing fails.
 */
export class EventPublishError extends EventError {
  constructor(
    eventType: string,
    message?: string,
    cause?: unknown,
  ) {
    super(
      message ??
        `Failed to publish event "${eventType}".`,
      {
        code:
          ErrorCode.EVENT_PUBLISH_FAILED,
        eventType,
        cause,
      },
    );
  }
}

/**
 * Error thrown when an event is invalid.
 */
export class InvalidEventError extends EventError {
  constructor(
    message: string,
    options: {
      eventType?: string;
      eventId?: string;
      cause?: unknown;
    } = {},
  ) {
    super(message, {
      code: ErrorCode.INVALID_INPUT,
      eventType: options.eventType,
      eventId: options.eventId,
      cause: options.cause,
      statusCode: 400,
      expose: true,
    });
  }
}

/**
 * Error thrown when an event type is not registered.
 */
export class EventTypeNotFoundError
  extends EventError {
  constructor(eventType: string) {
    super(
      `Event type "${eventType}" is not registered.`,
      {
        code: ErrorCode.NOT_FOUND,
        eventType,
        statusCode: 404,
        expose: true,
      },
    );
  }
}

/**
 * Error thrown when an event handler fails.
 */
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
    super(message, {        code:
          ErrorCode.EVENT_HANDLER_FAILED as ErrorCode | string,
      handlerId: options.handlerId,
      eventType: options.eventType,
      eventId: options.eventId,
      cause: options.cause,
    });
  }
}

/**
 * Creates an event handler error from an unknown failure.
 */
export function createEventHandlerError(
  handlerId: string,
  eventType: string,
  eventId: string,
  cause: unknown,
): EventHandlerError {
  return new EventHandlerError(
    `Event handler "${handlerId}" failed while processing "${eventType}".`,
    {
      handlerId,
      eventType,
      eventId,
      cause,
    },
  );
}

/**
 * Error thrown when an event handler cannot be found.
 */
export class EventHandlerNotFoundError
  extends EventError {
  constructor(handlerId: string) {
    super(
      `Event handler "${handlerId}" was not found.`,
      {
        code:
          ErrorCode.RESOURCE_NOT_FOUND as ErrorCode | string,
        handlerId,
        statusCode: 404,
        expose: true,
      },
    );
  }
}

/**
 * Error thrown when an event handler is already registered.
 */
export class DuplicateEventHandlerError
  extends EventError {
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

/**
 * Error thrown when an event definition is duplicated.
 */
export class DuplicateEventDefinitionError
  extends EventError {
  constructor(eventType: string) {
    super(
      `Event definition "${eventType}" is already registered.`,
      {
        code: ErrorCode.CONFLICT,
        eventType,
        statusCode: 409,
        expose: true,
      },
    );
  }
}

/**
 * Error thrown when an event definition is missing.
 */
export class EventDefinitionNotFoundError
  extends EventError {
  constructor(eventType: string) {
    super(
      `Event definition "${eventType}" was not found.`,
      {
        code: ErrorCode.NOT_FOUND,
        eventType,
        statusCode: 404,
        expose: true,
      },
    );
  }
}

/**
 * Error thrown when event dispatch is aborted.
 */
export class EventDispatchAbortedError
  extends EventError {
  constructor(
    message = "Event dispatch was aborted.",
    options: {
      eventType?: string;
      eventId?: string;
    } = {},
  ) {
    super(message, {
      code: ErrorCode.OPERATION_CANCELLED,
      eventType: options.eventType,
      eventId: options.eventId,
      statusCode: 499,
      expose: false,
    });
  }
}

/**
 * Error thrown when an event emitter has been disposed.
 */
export class EventEmitterDisposedError
  extends EventError {
  constructor() {
    super(
      "Event emitter has already been disposed.",
      {
        code:
          ErrorCode.OPERATION_FAILED,
        statusCode: 500,
        isOperational: false,
      },
    );
  }
}

/**
 * Error thrown when an event registry has been disposed.
 */
export class EventRegistryDisposedError
  extends EventError {
  constructor() {
    super(
      "Event registry has already been disposed.",
      {
        code:
          ErrorCode.OPERATION_FAILED,
        statusCode: 500,
        isOperational: false,
      },
    );
  }
}

/**
 * Error thrown when an event subscription has been closed.
 */
export class EventSubscriptionClosedError
  extends EventError {
  constructor(subscriptionId: string) {
    super(
      `Event subscription "${subscriptionId}" is already closed.`,
      {
        code: ErrorCode.OPERATION_FAILED,
        statusCode: 410,
        expose: true,
      },
    );
  }
}

/**
 * Error thrown when an event operation times out.
 */
export class EventTimeoutError extends EventError {
  public readonly timeoutMs: number;

  constructor(
    timeoutMs: number,
    options: {
      eventType?: string;
      eventId?: string;
    } = {},
  ) {
    super(
      `Event processing exceeded the timeout of ${timeoutMs}ms.`,
      {
        code: ErrorCode.TIMEOUT,
        eventType: options.eventType,
        eventId: options.eventId,
        metadata: { timeoutMs },
        statusCode: 504,
      },
    );

    this.timeoutMs = timeoutMs;
  }
}

/**
 * Error thrown when event middleware fails.
 */
export class EventMiddlewareError
  extends EventError {
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
      code:
        ErrorCode.MIDDLEWARE_EXECUTION as ErrorCode | string,
      middlewareId: options.middlewareId,
      eventType: options.eventType,
      eventId: options.eventId,
      cause: options.cause,
    });

    this.middlewareId = options.middlewareId;
  }
}

/**
 * Error thrown when event serialization fails.
 */
export class EventSerializationError
  extends EventError {
  constructor(
    message: string,
    options: {
      eventType?: string;
      eventId?: string;
      cause?: unknown;
    } = {},
  ) {
    super(message, {
      code: ErrorCode.INTERNAL_ERROR,
      eventType: options.eventType,
      eventId: options.eventId,
      cause: options.cause,
    });
  }
}

/**
 * Error thrown when event deserialization fails.
 */
export class EventDeserializationError
  extends EventError {
  constructor(
    message: string,
    cause?: unknown,
  ) {
    super(message, {
      code: ErrorCode.INVALID_FORMAT,
      cause,
    });
  }
}
