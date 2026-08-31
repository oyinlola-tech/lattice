/**
 * Access-related permission errors.
 */

import { ErrorCode } from "@lattice/errors";
import { PermissionError } from "./permissionError.base.js";

/**
 * Access denied — the actor is not authorized.
 */
export class PermissionDeniedError extends PermissionError {
  constructor(
    message = "Access denied",
    options?: {
      readonly actorId?: string;
      readonly permission?: string;
      readonly resourceType?: string;
    },
  ) {
    super(message, {
      code: ErrorCode.ACCESS_DENIED,
      metadata: {
        actorId: options?.actorId,
        permission: options?.permission,
        resourceType: options?.resourceType,
      },
    });
  }
}

/**
 * A referenced permission does not exist in the registry.
 */
export class PermissionNotFoundError extends PermissionError {
  constructor(permission: string) {
    super(`Permission not found: ${permission}`, {
      code: ErrorCode.NOT_FOUND,
      metadata: { permission },
    });
  }
}

/**
 * A duplicate permission was registered.
 */
export class DuplicatePermissionError extends PermissionError {
  constructor(permission: string) {
    super(`Duplicate permission: ${permission}`, {
      code: ErrorCode.CONFLICT,
      metadata: { permission },
    });
  }
}

/**
 * A referenced role does not exist in the registry.
 */
export class RoleNotFoundError extends PermissionError {
  constructor(role: string) {
    super(`Role not found: ${role}`, {
      code: ErrorCode.NOT_FOUND,
      metadata: { role },
    });
  }
}

/**
 * A duplicate role was registered.
 */
export class DuplicateRoleError extends PermissionError {
  constructor(role: string) {
    super(`Duplicate role: ${role}`, {
      code: ErrorCode.CONFLICT,
      metadata: { role },
    });
  }
}
