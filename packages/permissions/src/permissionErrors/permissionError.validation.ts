/**
 * Validation and policy-related permission errors.
 */

import { ErrorCode } from "@zudoliblib/errors";
import { PermissionError } from "./permissionError.base.js";

/**
 * A permission string is malformed.
 */
export class InvalidPermissionError extends PermissionError {
  constructor(permission: string) {
    super(`Invalid permission format: ${permission}`, {
      code: ErrorCode.VALIDATION_FAILED,
      metadata: { permission },
    });
  }
}

/**
 * A role definition is invalid.
 */
export class InvalidRoleError extends PermissionError {
  constructor(message: string) {
    super(message, { code: ErrorCode.VALIDATION_FAILED });
  }
}

/**
 * Circular role inheritance detected.
 */
export class CircularRoleInheritanceError extends PermissionError {
  constructor(chain: readonly string[]) {
    super(`Circular role inheritance: ${chain.join(" → ")}`, {
      code: ErrorCode.VALIDATION_FAILED,
      metadata: { chain: chain.join(",") },
    });
  }
}

/**
 * A policy evaluation failed.
 */
export class PolicyError extends PermissionError {
  constructor(policyName: string, cause?: unknown) {
    super(`Policy evaluation failed: ${policyName}`, {
      code: ErrorCode.OPERATION_FAILED,
      cause,
      metadata: { policyName },
    });
  }
}

/**
 * A policy evaluation exceeded the timeout.
 */
export class PolicyTimeoutError extends PermissionError {
  constructor(policyName: string, timeoutMs: number) {
    super(`Policy timeout: ${policyName} exceeded ${timeoutMs}ms`, {
      code: ErrorCode.TIMEOUT,
      metadata: { policyName, timeoutMs },
    });
  }
}

/**
 * A permission resolver failed.
 */
export class PermissionResolverError extends PermissionError {
  constructor(message: string, cause?: unknown) {
    super(message, {
      code: ErrorCode.OPERATION_FAILED,
      cause,
    });
  }
}

/**
 * Authorization was cancelled via AbortSignal.
 */
export class AuthorizationAbortedError extends PermissionError {
  constructor() {
    super("Authorization aborted", { code: ErrorCode.OPERATION_CANCELLED });
  }
}
