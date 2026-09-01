/**
 * Base error class for feature flag errors.
 *
 * @module featureFlagErrors/featureFlagError.base
 */

import { ApplicationError, ErrorCode } from "@oyinlola141/lattice-errors";
import type {
  ErrorCategory,
  ErrorSeverity,
  ErrorMetadata,
} from "@oyinlola141/lattice-errors";

/** Options for creating a feature flag error. */
export interface FeatureFlagErrorOptions {
  readonly code?: ErrorCode;
  readonly category?: ErrorCategory;
  readonly severity?: ErrorSeverity;
  readonly cause?: unknown;
  readonly metadata?: ErrorMetadata;
  readonly expose?: boolean;
}

/**
 * Base class for all feature flag errors.
 * Extends ApplicationError from @oyinlola141/lattice-errors.
 */
export class FeatureFlagError extends ApplicationError {
  public constructor(message: string, options: FeatureFlagErrorOptions = {}) {
    super(message, {
      code: options.code ?? ErrorCode.UNKNOWN,
      category: options.category as ErrorCategory | undefined,
      severity: options.severity as ErrorSeverity | undefined,
      cause: options.cause,
      metadata: options.metadata,
      expose: options.expose ?? false,
    });
    this.name = "FeatureFlagError";
  }
}
