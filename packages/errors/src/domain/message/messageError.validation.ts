/**
 * Message validation error classes.
 */

import { ErrorCode } from "../../base/types/errorCode.type.js";
import { MessageError } from "./messageError.base.js";

/** Error thrown when message validation fails. */
export class MessageValidationError extends MessageError {
  public readonly issues: readonly string[];

  constructor(message: string, issues: readonly string[] = [], messageType?: string) {
    super(message, {
      code: ErrorCode.MESSAGE_VALIDATION_FAILED,
      messageType,
      metadata: { issues },
      statusCode: 422,
      expose: true,
    });
    this.issues = Object.freeze([...issues]);
  }
}
