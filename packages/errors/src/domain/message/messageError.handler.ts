/**
 * Message handler and middleware error classes.
 */

import { ErrorCode } from "../../base/types/errorCode.type.js";
import { MessageError } from "./messageError.base.js";

/** Error thrown when a message handler fails. */
export class MessageHandlerError extends MessageError {
  constructor(
    message: string,
    options: {
      handlerId: string;
      messageType?: string;
      messageId?: string;
      cause?: unknown;
    },
  ) {
    super(message, {
      code: ErrorCode.MESSAGE_HANDLER_NOT_FOUND,
      handlerId: options.handlerId,
      messageType: options.messageType,
      messageId: options.messageId,
      cause: options.cause,
    });
  }
}

/** Creates a message handler error from an unknown failure. */
export function createMessageHandlerError(
  handlerId: string,
  messageType: string,
  messageId: string,
  cause: unknown,
): MessageHandlerError {
  return new MessageHandlerError(
    `Message handler "${handlerId}" failed while processing "${messageType}".`,
    { handlerId, messageType, messageId, cause },
  );
}

/** Error thrown when a message handler cannot be found. */
export class MessageHandlerNotFoundError extends MessageError {
  constructor(handlerId: string) {
    super(`Message handler "${handlerId}" was not found.`, {
      code: ErrorCode.RESOURCE_NOT_FOUND as ErrorCode | string,
      handlerId,
      statusCode: 404,
      expose: true,
    });
  }
}

/** Error thrown when a message handler is already registered. */
export class DuplicateMessageHandlerError extends MessageError {
  constructor(handlerId: string) {
    super(`Message handler "${handlerId}" is already registered.`, {
      code: ErrorCode.CONFLICT,
      handlerId,
      statusCode: 409,
      expose: true,
    });
  }
}

/** Error thrown when message middleware fails. */
export class MessageMiddlewareError extends MessageError {
  public readonly middlewareId?: string;

  constructor(
    message: string,
    options: {
      middlewareId?: string;
      messageType?: string;
      messageId?: string;
      cause?: unknown;
    } = {},
  ) {
    super(message, {
      code: ErrorCode.MIDDLEWARE_EXECUTION as ErrorCode | string,
      middlewareId: options.middlewareId,
      messageType: options.messageType,
      messageId: options.messageId,
      cause: options.cause,
    });
    this.middlewareId = options.middlewareId;
  }
}
