/**
 * Base TenantError class.
 *
 * @module tenancyErrors/tenancyError
 */

import {
  AuthorizationError,
  ErrorCode,
  type ErrorMetadata,
} from "@oyinlola141/lattice-errors";

/**
 * Base error for all tenancy-related failures.
 */
export class TenantError extends AuthorizationError {
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
