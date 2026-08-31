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
 * Options for creating a container error.
 */
export interface ContainerErrorOptions
  extends Omit<BaseErrorOptions, "category"> {
  readonly category?: ErrorCategory;
}

/**
 * Base error for all container subsystem failures.
 */
export class ContainerError extends BaseError {
  constructor(
    message: string,
    options: ContainerErrorOptions = {},
  ) {
    super(
      message,
      {
        ...options,
        code:
          options.code ??
          ErrorCode.SERVICE_ERROR,
        category:
          options.category ??
          ErrorCategory.CONTAINER,
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
  }
}

/**
 * Creates a container error.
 */
export function createContainerError(
  message: string,
  options: ContainerErrorOptions = {},
): ContainerError {
  return new ContainerError(message, options);
}

/**
 * Determines whether an unknown value is a ContainerError.
 */
export function isContainerError(
  value: unknown,
): value is ContainerError {
  return value instanceof ContainerError;
}

/**
 * Error thrown when a registration already exists and
 * duplicate registrations are disabled.
 */
export class DuplicateRegistrationError
  extends ContainerError {
  public readonly tokenDescription: string;

  constructor(
    tokenDescription: string,
    message?: string,
  ) {
    super(
      message ??
        `A registration already exists for token: ${tokenDescription}.`,
      {
        code:
          ErrorCode.CONTAINER_DUPLICATE_REGISTRATION,
        category:
          ErrorCategory.CONTAINER,
        statusCode: 409,
        expose: true,
        metadata: {
          token: tokenDescription,
        },
      },
    );

    this.tokenDescription =
      tokenDescription;
  }
}

/**
 * Creates a duplicate registration error.
 */
export function createDuplicateRegistrationError(
  tokenDescription: string,
): DuplicateRegistrationError {
  return new DuplicateRegistrationError(
    tokenDescription,
  );
}

/**
 * Determines whether an unknown value is a
 * DuplicateRegistrationError.
 */
export function isDuplicateRegistrationError(
  value: unknown,
): value is DuplicateRegistrationError {
  return (
    value instanceof DuplicateRegistrationError
  );
}

/**
 * Error thrown when attempting to modify a registration
 * that does not exist.
 */
export class RegistrationNotFoundError
  extends ContainerError {
  public readonly tokenDescription: string;

  constructor(
    tokenDescription: string,
    message?: string,
  ) {
    super(
      message ??
        `No registration exists for token: ${tokenDescription}.`,
      {
        code:
          ErrorCode.CONTAINER_REGISTRATION_NOT_FOUND,
        category:
          ErrorCategory.CONTAINER,
        statusCode: 404,
        expose: true,
        metadata: {
          token: tokenDescription,
        },
      },
    );

    this.tokenDescription =
      tokenDescription;
  }
}

/**
 * Creates a registration not found error.
 */
export function createRegistrationNotFoundError(
  tokenDescription: string,
): RegistrationNotFoundError {
  return new RegistrationNotFoundError(
    tokenDescription,
  );
}

/**
 * Determines whether an unknown value is a
 * RegistrationNotFoundError.
 */
export function isRegistrationNotFoundError(
  value: unknown,
): value is RegistrationNotFoundError {
  return (
    value instanceof RegistrationNotFoundError
  );
}

/**
 * Error thrown when circular dependency resolution is detected.
 */
export class CircularDependencyError
  extends ContainerError {
  public readonly dependencyPath: string[];

  constructor(dependencyPath: string[]) {
    const formatted =
      dependencyPath.join(" -> ");

    super(
      `Circular dependency detected: ${formatted}.`,
      {
        code:
          ErrorCode.CONTAINER_CIRCULAR_DEPENDENCY,
        category:
          ErrorCategory.CONTAINER,
        statusCode: 500,
        expose: false,
        metadata: {
          dependencyPath: formatted,
        },
      },
    );

    this.dependencyPath = dependencyPath;
  }
}

/**
 * Creates a circular dependency error.
 */
export function createCircularDependencyError(
  dependencyPath: string[],
): CircularDependencyError {
  return new CircularDependencyError(
    dependencyPath,
  );
}

/**
 * Determines whether an unknown value is a
 * CircularDependencyError.
 */
export function isCircularDependencyError(
  value: unknown,
): value is CircularDependencyError {
  return (
    value instanceof CircularDependencyError
  );
}

/**
 * Error thrown when a provider cannot be resolved.
 */
export class ProviderResolutionError
  extends ContainerError {
  public readonly tokenDescription: string;

  constructor(
    tokenDescription: string,
    cause?: unknown,
  ) {
    const causeMessage =
      cause instanceof Error
        ? cause.message
        : String(cause);

    super(
      `Failed to resolve provider for ${tokenDescription}: ${causeMessage}`,
      {
        code:
          ErrorCode.CONTAINER_PROVIDER_RESOLUTION_FAILED,
        category:
          ErrorCategory.CONTAINER,
        statusCode: 500,
        expose: false,
        cause,
        metadata: {
          token: tokenDescription,
        },
      },
    );

    this.tokenDescription =
      tokenDescription;
  }
}

/**
 * Creates a provider resolution error.
 */
export function createProviderResolutionError(
  tokenDescription: string,
  cause?: unknown,
): ProviderResolutionError {
  return new ProviderResolutionError(
    tokenDescription,
    cause,
  );
}

/**
 * Determines whether an unknown value is a
 * ProviderResolutionError.
 */
export function isProviderResolutionError(
  value: unknown,
): value is ProviderResolutionError {
  return (
    value instanceof ProviderResolutionError
  );
}

/**
 * Error thrown when a container lifecycle operation fails.
 */
export class ContainerLifecycleError
  extends ContainerError {
  public readonly operation: string;

  constructor(
    operation: string,
    message?: string,
    cause?: unknown,
  ) {
    super(
      message ??
        `Container lifecycle operation "${operation}" failed.`,
      {
        code:
          ErrorCode.CONTAINER_LIFECYCLE,
        category:
          ErrorCategory.CONTAINER,
        statusCode: 500,
        expose: false,
        cause,
        isOperational: false,
        metadata: {
          operation,
        },
      },
    );

    this.operation = operation;
  }
}

/**
 * Creates a container lifecycle error.
 */
export function createContainerLifecycleError(
  operation: string,
  cause?: unknown,
): ContainerLifecycleError {
  return new ContainerLifecycleError(
    operation,
    undefined,
    cause,
  );
}

/**
 * Determines whether an unknown value is a
 * ContainerLifecycleError.
 */
export function isContainerLifecycleError(
  value: unknown,
): value is ContainerLifecycleError {
  return (
    value instanceof ContainerLifecycleError
  );
}
