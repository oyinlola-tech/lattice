/**
 * Specific tenancy error subclasses.
 *
 * @module tenancyErrors/tenancyError.types
 */

import { ErrorCode } from "@zudoliblib/errors";
import { TenantError } from "./tenancyError.base.js";
import type { TenantId, TenantStatus } from "../tenancyTypes/tenantIdentity.js";

/**
 * The provided tenant ID is invalid.
 */
export class InvalidTenantIdError extends TenantError {
  constructor(value: string) {
    super(`Invalid tenant ID: "${value}"`, {
      code: ErrorCode.VALIDATION_FAILED,
      metadata: { value },
    });
  }
}

/**
 * Tenant not found.
 */
export class TenantNotFoundError extends TenantError {
  constructor(tenantId: string) {
    super(`Tenant not found: "${tenantId}"`, {
      code: ErrorCode.NOT_FOUND,
      metadata: { tenantId },
    });
  }
}

/**
 * No tenant context in current execution.
 */
export class TenantContextMissingError extends TenantError {
  constructor() {
    super("Tenant context is required but none was found", {
      code: ErrorCode.PRECONDITION_FAILED,
    });
  }
}

/**
 * Tenant resolution failed.
 */
export class TenantResolutionError extends TenantError {
  constructor(message: string, cause?: unknown) {
    super(message, {
      code: ErrorCode.OPERATION_FAILED,
      cause,
    });
  }
}

/**
 * Multiple resolvers returned different tenants.
 */
export class TenantResolutionConflictError extends TenantError {
  constructor(candidates: readonly string[]) {
    super(`Tenant resolution conflict: ${candidates.join(", ")}`, {
      code: ErrorCode.CONFLICT,
      metadata: { candidates: candidates.join(",") },
    });
  }
}

/**
 * Tenant is not in an usable state.
 */
export class TenantUnavailableError extends TenantError {
  constructor(tenantId: TenantId, status: TenantStatus) {
    super(`Tenant "${tenantId}" is not available (status: ${status})`, {
      code: ErrorCode.FORBIDDEN,
      metadata: { tenantId, status },
    });
  }
}

/**
 * Tenant access denied.
 */
export class TenantAccessDeniedError extends TenantError {
  constructor(tenantId: string) {
    super(`Access denied to tenant "${tenantId}"`, {
      code: ErrorCode.ACCESS_DENIED,
      metadata: { tenantId },
    });
  }
}

/**
 * Tenant already exists.
 */
export class TenantAlreadyExistsError extends TenantError {
  constructor(identifier: string) {
    super(`Tenant already exists: "${identifier}"`, {
      code: ErrorCode.CONFLICT,
      metadata: { identifier },
    });
  }
}

/**
 * Tenant provisioning failed.
 */
export class TenantProvisioningError extends TenantError {
  constructor(tenantId: string, cause?: unknown) {
    super(`Provisioning failed for tenant "${tenantId}"`, {
      code: ErrorCode.OPERATION_FAILED,
      cause,
      metadata: { tenantId },
    });
  }
}

/**
 * Tenant isolation violation detected.
 */
export class TenantIsolationError extends TenantError {
  constructor(expected: string, actual: string) {
    super(
      `Tenant isolation violation: expected "${expected}", got "${actual}"`,
      {
        code: ErrorCode.ACCESS_DENIED,
        metadata: { expected, actual },
      },
    );
  }
}
