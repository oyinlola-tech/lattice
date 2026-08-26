/**
 * Event errors for Lattice.
 *
 * This module contains the error hierarchy used by the events
 * package. Errors are deliberately independent from the event
 * emitter, registry, and event bus so they can be reused across
 * the entire event infrastructure.
 */

import type {
  Event,
  EventType,
} from "./event.js";

/**
 * Base error for all Lattice event-system failures.
 */
export class EventError extends Error {
  /**
   * Stable machine-readable error code.
   */
  readonly code:
    string;

  /**
   * Optional event identifier.
   */
  readonly eventId?:
    string;

  /**
   * Optional event type.
   */
  readonly eventType?:
    EventType;

  public override name: string = "EventError";

  constructor(
    message:
      string,
    options:
      {
        code?:
          string;

        event?:
          Event;

        eventId?:
          string;

        eventType?:
          EventType;

        cause?:
          unknown;
      } = {},
  ) {
    super(
      message,
      {
        cause: options.cause,
      },
    );

    this.name =
      "EventError";

    this.code =
      options.code ??
      "EVENT_ERROR";

    this.eventId =
      options.eventId ??
      options.event?.id;

    this.eventType =
      options.eventType ??
      options.event?.type;

    Object.setPrototypeOf(
      this,
      new.target.prototype,
    );
  }
}

/**
 * Error thrown when an event is invalid.
 */
export class InvalidEventError
  extends EventError {
  constructor(
    message:
      string,
    event?:
      Event,
    cause?:
      unknown,
  ) {
    super(
      message,
      {
        code:
          "INVALID_EVENT",

        event,

        cause,
      },
    );

    this.name =
      "InvalidEventError";
  }
}

/**
 * Error thrown when an event type is invalid.
 */
export class InvalidEventTypeError
  extends EventError {
  constructor(
    eventType:
      unknown,
  ) {
    super(
      `Invalid event type: "${String(eventType)}".`,
      {
        code:
          "INVALID_EVENT_TYPE",

        eventType:
          typeof eventType ===
          "string"
            ? eventType
            : undefined,
      },
    );

    this.name =
      "InvalidEventTypeError";
  }
}

/**
 * Error thrown when an event type is not registered.
 */
export class EventTypeNotFoundError
  extends EventError {
  constructor(
    eventType:
      EventType,
  ) {
    super(
      `Event type "${eventType}" is not registered.`,
      {
        code:
          "EVENT_TYPE_NOT_FOUND",

        eventType,
      },
    );

    this.name =
      "EventTypeNotFoundError";
  }
}

/**
 * Error thrown when an event handler fails.
 */
export class EventHandlerError
  extends EventError {
  /**
   * Identifier of the handler that failed.
   */
  readonly handlerId:
    string;

  constructor(
    message:
      string,
    options:
      {
        handlerId:
          string;

        event?:
          Event;

        cause?:
          unknown;
      },
  ) {
    super(
      message,
      {
        code:
          "EVENT_HANDLER_ERROR",

        event:
          options.event,

        cause:
          options.cause,
      },
    );

    this.name =
      "EventHandlerError";

    this.handlerId =
      options.handlerId;
  }
}

/**
 * Error thrown when an event handler cannot be found.
 */
export class EventHandlerNotFoundError
  extends EventError {
  readonly handlerId:
    string;

  constructor(
    handlerId:
      string,
  ) {
    super(
      `Event handler "${handlerId}" was not found.`,
      {
        code:
          "EVENT_HANDLER_NOT_FOUND",
      },
    );

    this.name =
      "EventHandlerNotFoundError";

    this.handlerId =
      handlerId;
  }
}

/**
 * Error thrown when an event handler is already registered.
 */
export class DuplicateEventHandlerError
  extends EventError {
  readonly handlerId:
    string;

  constructor(
    handlerId:
      string,
  ) {
    super(
      `Event handler "${handlerId}" is already registered.`,
      {
        code:
          "DUPLICATE_EVENT_HANDLER",
      },
    );

    this.name =
      "DuplicateEventHandlerError";

    this.handlerId =
      handlerId;
  }
}

/**
 * Error thrown when an event definition is duplicated.
 */
export class DuplicateEventDefinitionError
  extends EventError {
  constructor(
    eventType:
      EventType,
  ) {
    super(
      `Event definition "${eventType}" is already registered.`,
      {
        code:
          "DUPLICATE_EVENT_DEFINITION",

        eventType,
      },
    );

    this.name =
      "DuplicateEventDefinitionError";
  }
}

/**
 * Error thrown when an event definition is missing.
 */
export class EventDefinitionNotFoundError
  extends EventError {
  constructor(
    eventType:
      EventType,
  ) {
    super(
      `Event definition "${eventType}" was not found.`,
      {
        code:
          "EVENT_DEFINITION_NOT_FOUND",

        eventType,
      },
    );

    this.name =
      "EventDefinitionNotFoundError";
  }
}

/**
 * Error thrown when event dispatch is aborted.
 */
export class EventDispatchAbortedError
  extends EventError {
  constructor(
    event?:
      Event,
  ) {
    super(
      "Event dispatch was aborted.",
      {
        code:
          "EVENT_DISPATCH_ABORTED",

        event,
      },
    );

    this.name =
      "EventDispatchAbortedError";
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
          "EVENT_EMITTER_DISPOSED",
      },
    );

    this.name =
      "EventEmitterDisposedError";
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
          "EVENT_REGISTRY_DISPOSED",
      },
    );

    this.name =
      "EventRegistryDisposedError";
  }
}

/**
 * Error thrown when an event subscription has already
 * been closed.
 */
export class EventSubscriptionClosedError
  extends EventError {
  readonly subscriptionId:
    string;

  constructor(
    subscriptionId:
      string,
  ) {
    super(
      `Event subscription "${subscriptionId}" is already closed.`,
      {
        code:
          "EVENT_SUBSCRIPTION_CLOSED",
      },
    );

    this.name =
      "EventSubscriptionClosedError";

    this.subscriptionId =
      subscriptionId;
  }
}

/**
 * Error thrown when an event operation times out.
 */
export class EventTimeoutError
  extends EventError {
  readonly timeout:
    number;

  constructor(
    timeout:
      number,
    event?:
      Event,
  ) {
    super(
      `Event processing exceeded the timeout of ${timeout}ms.`,
      {
        code:
          "EVENT_TIMEOUT",

        event,
      },
    );

    this.name =
      "EventTimeoutError";

    this.timeout =
      timeout;
  }
}

/**
 * Error thrown when event middleware fails.
 */
export class EventMiddlewareError
  extends EventError {
  readonly middlewareId?:
    string;

  constructor(
    message:
      string,
    options:
      {
        code?:
          string;

        middlewareId?:
          string;

        event?:
          Event;

        cause?:
          unknown;
      } = {},
  ) {
    super(
      message,
      {
        code:
          options.code ??
          "EVENT_MIDDLEWARE_ERROR",

        event:
          options.event,

        cause:
          options.cause,
      },
    );

    this.name =
      "EventMiddlewareError";

    this.middlewareId =
      options.middlewareId;
  }
}

/**
 * Error thrown when event serialization fails.
 */
export class EventSerializationError
  extends EventError {
  constructor(
    message:
      string,
    event?:
      Event,
    cause?:
      unknown,
  ) {
    super(
      message,
      {
        code:
          "EVENT_SERIALIZATION_ERROR",

        event,

        cause,
      },
    );

    this.name =
      "EventSerializationError";
  }
}

/**
 * Error thrown when event deserialization fails.
 */
export class EventDeserializationError
  extends EventError {
  constructor(
    message:
      string,
    cause?:
      unknown,
  ) {
    super(
      message,
      {
        code:
          "EVENT_DESERIALIZATION_ERROR",

        cause,
      },
    );

    this.name =
      "EventDeserializationError";
  }
}

/**
 * Determines whether an unknown value is an EventError.
 */
export function isEventError(
  value:
    unknown,
):
  value is EventError {
  return (
    value instanceof
      EventError
  );
}

/**
 * Converts an unknown thrown value into an EventError.
 */
export function toEventError(
  error:
    unknown,
    options:
      {
        message?:
          string;

        event?:
          Event;

        code?:
          string;
      } = {},
):
  EventError {
  if (
    error instanceof
      EventError
  ) {
    return error;
  }

  if (
    error instanceof
      Error
  ) {
    return new EventError(
      options.message ??
        error.message,
      {
        code:
          options.code ??
          "EVENT_ERROR",

        event:
          options.event,

        cause:
          error,
      },
    );
  }

  return new EventError(
    options.message ??
      String(error),
    {
      code:
        options.code ??
        "EVENT_ERROR",

      event:
        options.event,

      cause:
        error,
    },
  );
}

/**
 * Returns the original cause of an event error.
 */
export function getEventErrorCause(
  error:
    EventError,
):
  unknown {
  return error.cause;
}

/**
 * Creates an event-handler error from an unknown failure.
 */
export function createEventHandlerError(
  handlerId:
    string,
  event:
    Event,
  cause:
    unknown,
):
  EventHandlerError {
  return new EventHandlerError(
    `Event handler "${handlerId}" failed while processing "${event.type}".`,
    {
      handlerId,
      event,
      cause,
    },
  );
}