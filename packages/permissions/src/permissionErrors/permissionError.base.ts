/**
 * Base PermissionError class.
 *
 * @module permissionErrors/permissionError
 *
 * Extends AuthorizationError from @zudojs/errors.
 */

import {
  AuthorizationError,
  ErrorCode,
  type ErrorMetadata,
} from "@zudojs/errors";

/**
 * Base error for all permission-related failures.
 */
export class PermissionError extends AuthorizationError {
  constructor(
    message: string,
    options?: {
      readonly code?: ErrorCode;
      readonly metadata?: ErrorMetadata;
      readonly cause?: unknown;
    },
  ) {
    super(message, {
      code: options?.code ?? ErrorCode.FORBIDDEN,
      metadata: options?.metadata,
      cause: options?.cause,
    });
  }
}
