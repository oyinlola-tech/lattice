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
 * Options for creating a message error.
 */
export interface MessageErrorOptions
  extends Omit<BaseErrorOptions, "category"> {
  readonly category?: ErrorCategory;
  readonly messageType?: string;
  readonly messageId?: string;
  readonly handlerId?: string;
  readonly middlewareId?: string;
}

/**
 * Base error for all message subsystem failures.
 */
export class MessageError extends BaseError {
  public readonly messageType?: string;
  public readonly messageId?: string;
  public readonly handlerId?: string;

  constructor(
    message: string,
    options: MessageErrorOptions = {},
  ) {
    super(
      message,
      {
        ...options,
        code:
          options.code ??
          ErrorCode.MESSAGE_DISPATCH_FAILED,
        category:
          options.category ??
          ErrorCategory.MESSAGE,
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

    this.messageType = options.messageType;
    this.messageId = options.messageId;
    this.handlerId = options.handlerId;
  }

  public override toJSON() {
    return {
      ...super.toJSON(),
      ...(this.messageType !== undefined
        ? { messageType: this.messageType }
        : {}),
      ...(this.messageId !== undefined
        ? { messageId: this.messageId }
        : {}),
      ...(this.handlerId !== undefined
        ? { handlerId: this.handlerId }
        : {}),
    };
  }
}

/**
 * Creates a message error.
 */
export function createMessageError(
  message: string,
  options: MessageErrorOptions = {},
): MessageError {
  return new MessageError(message, options);
}

/**
 * Determines whether an unknown value is a MessageError.
 */
export function isMessageError(
  value: unknown,
): value is MessageError {
  return value instanceof MessageError;
}

/**
 * Converts an unknown thrown value into a MessageError.
 */
export function toMessageError(
  error: unknown,
  options: {
    message?: string;
    messageType?: string;
    messageId?: string;
    code?: string;
  } = {},
): MessageError {
  if (error instanceof MessageError) {
    return error;
  }

  if (error instanceof Error) {
    return new MessageError(
      options.message ?? error.message,
      {
        code: options.code as ErrorCode | undefined,
        messageType: options.messageType,
        messageId: options.messageId,
        cause: error,
      },
    );
  }

  return new MessageError(
    options.message ?? String(error),
    {
      code: options.code as ErrorCode | undefined,
      messageType: options.messageType,
      messageId: options.messageId,
      cause: error,
    },
  );
}

/**
 * Error raised when message dispatch fails.
 */
export class MessageDispatchError extends MessageError {
  constructor(
    messageType: string,
    message?: string,
    cause?: unknown,
  ) {
    super(
      message ??
        `Failed to dispatch message "${messageType}".`,
      {
        code:
          ErrorCode.MESSAGE_DISPATCH_FAILED,
        messageType,
        cause,
      },
    );
  }
}

/**
 * Error thrown when a message is invalid.
 */
export class InvalidMessageError extends MessageError {
  constructor(
    message: string,
    options: {
      messageType?: string;
      messageId?: string;
      cause?: unknown;
    } = {},
  ) {
    super(message, {
      code: ErrorCode.MESSAGE_INVALID,
      messageType: options.messageType,
      messageId: options.messageId,
      cause: options.cause,
      statusCode: 400,
      expose: true,
    });
  }
}

/**
 * Error thrown when a message type is not registered.
 */
export class MessageTypeNotFoundError
  extends MessageError {
  constructor(messageType: string) {
    super(
      `Message type "${messageType}" is not registered.`,
      {
        code: ErrorCode.NOT_FOUND,
        messageType,
        statusCode: 404,
        expose: true,
      },
    );
  }
}

/**
 * Error thrown when a message handler fails.
 */
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

/**
 * Creates a message handler error from an unknown failure.
 */
export function createMessageHandlerError(
  handlerId: string,
  messageType: string,
  messageId: string,
  cause: unknown,
): MessageHandlerError {
  return new MessageHandlerError(
    `Message handler "${handlerId}" failed while processing "${messageType}".`,
    {
      handlerId,
      messageType,
      messageId,
      cause,
    },
  );
}

/**
 * Error thrown when a message handler cannot be found.
 */
export class MessageHandlerNotFoundError
  extends MessageError {
  constructor(handlerId: string) {
    super(
      `Message handler "${handlerId}" was not found.`,
      {
        code:
          ErrorCode.MESSAGE_HANDLER_NOT_FOUND,
        handlerId,
        statusCode: 404,
        expose: true,
      },
    );
  }
}

/**
 * Error thrown when a message handler is already registered.
 */
export class DuplicateMessageHandlerError
  extends MessageError {
  constructor(handlerId: string) {
    super(
      `Message handler "${handlerId}" is already registered.`,
      {
        code: ErrorCode.MESSAGE_DUPLICATE_HANDLER,
        handlerId,
        statusCode: 409,
        expose: true,
      },
    );
  }
}

/**
 * Error thrown when message dispatch is aborted.
 */
export class MessageDispatchAbortedError
  extends MessageError {
  constructor(
    message = "Message dispatch was aborted.",
    options: {
      messageType?: string;
      messageId?: string;
    } = {},
  ) {
    super(message, {
      code: ErrorCode.MESSAGE_ABORTED,
      messageType: options.messageType,
      messageId: options.messageId,
      statusCode: 499,
      expose: false,
    });
  }
}

/**
 * Error thrown when a message bus has been disposed.
 */
export class MessageBusDisposedError
  extends MessageError {
  constructor() {
    super(
      "Message bus has already been disposed.",
      {
        code:
          ErrorCode.MESSAGE_BUSDisposed,
        statusCode: 500,
        isOperational: false,
      },
    );
  }
}

/**
 * Error thrown when a message operation times out.
 */
export class MessageTimeoutError extends MessageError {
  public readonly timeoutMs: number;

  constructor(
    timeoutMs: number,
    options: {
      messageType?: string;
      messageId?: string;
    } = {},
  ) {
    super(
      `Message processing exceeded the timeout of ${timeoutMs}ms.`,
      {
        code: ErrorCode.MESSAGE_TIMEOUT,
        messageType: options.messageType,
        messageId: options.messageId,
        metadata: { timeoutMs },
        statusCode: 504,
      },
    );

    this.timeoutMs = timeoutMs;
  }
}

/**
 * Error thrown when message middleware fails.
 */
export class MessageMiddlewareError
  extends MessageError {
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
      code: ErrorCode.MIDDLEWARE_EXECUTION,
      middlewareId: options.middlewareId,
      messageType: options.messageType,
      messageId: options.messageId,
      cause: options.cause,
    });

    this.middlewareId = options.middlewareId;
  }
}

/**
 * Error thrown when message validation fails.
 */
export class MessageValidationError
  extends MessageError {
  constructor(
    message: string,
    options: {
      messageType?: string;
      messageId?: string;
      cause?: unknown;
    } = {},
  ) {
    super(message, {
      code: ErrorCode.MESSAGE_VALIDATION_FAILED,
      messageType: options.messageType,
      messageId: options.messageId,
      cause: options.cause,
      statusCode: 400,
      expose: true,
    });
  }
}
