/**
 * Event serialization and deserialization error classes.
 */

import { ErrorCode } from "../../base/types/errorCode.type.js";
import { EventError } from "./eventError.base.js";

/** Error thrown when event serialization fails. */
export class EventSerializationError extends EventError {
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

/** Error thrown when event deserialization fails. */
export class EventDeserializationError extends EventError {
  constructor(message: string, cause?: unknown) {
    super(message, { code: ErrorCode.INVALID_FORMAT, cause });
  }
}
