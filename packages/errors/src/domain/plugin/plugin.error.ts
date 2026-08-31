import { BaseError } from "../../base/core/baseError.core.js";
import type { BaseErrorOptions } from "../../base/types/baseError.type.js";
import type { ErrorMetadataValue } from "../../base/core/errorMetadata.core.js";
import { ErrorCategory } from "../../base/types/errorCategory.type.js";
import { ErrorCode } from "../../base/types/errorCode.type.js";
import { ErrorSeverity } from "../../base/types/errorSeverity.type.js";

/**
 * Options for creating a plugin error.
 */
export interface PluginErrorOptions
  extends Omit<BaseErrorOptions, "category"> {
  readonly category?: ErrorCategory;
  readonly pluginName?: string;
}

/**
 * Base error for all plugin failures.
 */
export class PluginError extends BaseError {
  public readonly pluginName?: string;

  constructor(
    message: string,
    options: PluginErrorOptions = {},
  ) {
    super(
      message,
      {
        ...options,
        code: options.code ?? ErrorCode.PLUGIN_ERROR,
        category: options.category ?? ErrorCategory.PLUGIN,
        severity: options.severity ?? ErrorSeverity.ERROR,
        statusCode: options.statusCode ?? 500,
        expose: options.expose ?? false,
        isOperational: options.isOperational ?? true,
      },
    );

    this.pluginName = options.pluginName;
  }

  public override toJSON() {
    return {
      ...super.toJSON(),
      ...(this.pluginName !== undefined ? { pluginName: this.pluginName } : {}),
    };
  }
}

/**
 * Creates a plugin error.
 */
export function createPluginError(
  message: string,
  options: PluginErrorOptions = {},
): PluginError {
  return new PluginError(message, options);
}

/**
 * Determines whether an unknown value is a PluginError.
 */
export function isPluginError(
  value: unknown,
): value is PluginError {
  return value instanceof PluginError;
}

/**
 * Error thrown when a plugin registration fails.
 */
export class PluginRegistrationError extends PluginError {
  constructor(
    message: string,
    pluginName?: string,
    options: PluginErrorOptions = {},
  ) {
    super(message, {
      ...options,
      code: ErrorCode.PLUGIN_REGISTRATION,
      pluginName,
      statusCode: 400,
      expose: true,
    });

    this.name = "PluginRegistrationError";
  }
}

/**
 * Error thrown when a plugin is already registered.
 */
export class PluginAlreadyRegisteredError extends PluginError {
  constructor(
    pluginName: string,
    options: PluginErrorOptions = {},
  ) {
    super(
      `Plugin "${pluginName}" is already registered.`,
      {
        ...options,
        code: ErrorCode.PLUGIN_ALREADY_REGISTERED,
        pluginName,
        statusCode: 409,
        expose: true,
      },
    );

    this.name = "PluginAlreadyRegisteredError";
  }
}

/**
 * Error thrown when a plugin is not found.
 */
export class PluginNotFoundError extends PluginError {
  constructor(
    pluginName: string,
    options: PluginErrorOptions = {},
  ) {
    super(
      `Plugin "${pluginName}" is not registered.`,
      {
        ...options,
        code: ErrorCode.PLUGIN_NOT_FOUND,
        pluginName,
        statusCode: 404,
        expose: true,
      },
    );

    this.name = "PluginNotFoundError";
  }
}

/**
 * Error thrown when a plugin dependency is missing.
 */
export class PluginDependencyError extends PluginError {
  constructor(
    pluginName: string,
    dependencyName: string,
    options: PluginErrorOptions = {},
  ) {
    super(
      `Plugin "${pluginName}" depends on "${dependencyName}" which is not registered.`,
      {
        ...options,
        code: ErrorCode.PLUGIN_DEPENDENCY,
        pluginName,
        statusCode: 400,
        expose: true,
        metadata: { dependencyName } as Record<string, ErrorMetadataValue>,
      },
    );

    this.name = "PluginDependencyError";
  }
}

/**
 * Error thrown when a circular plugin dependency is detected.
 */
export class PluginDependencyCycleError extends PluginError {
  constructor(
    cycle: readonly string[],
    options: PluginErrorOptions = {},
  ) {
    super(
      `Circular plugin dependency detected: ${cycle.join(" -> ")}.`,
      {
        ...options,
        code: ErrorCode.PLUGIN_DEPENDENCY_CYCLE,
        statusCode: 400,
        expose: true,
        metadata: { cycle: [...cycle] } as Record<string, ErrorMetadataValue>,
      },
    );

    this.name = "PluginDependencyCycleError";
  }
}

/**
 * Error thrown when a plugin initialization fails.
 */
export class PluginInitializationError extends PluginError {
  constructor(
    message: string,
    pluginName?: string,
    options: PluginErrorOptions = {},
  ) {
    super(message, {
      ...options,
      code: ErrorCode.PLUGIN_INITIALIZATION,
      pluginName,
      statusCode: 500,
      expose: false,
    });

    this.name = "PluginInitializationError";
  }
}

/**
 * Error thrown when a plugin start fails.
 */
export class PluginStartError extends PluginError {
  constructor(
    message: string,
    pluginName?: string,
    options: PluginErrorOptions = {},
  ) {
    super(message, {
      ...options,
      code: ErrorCode.PLUGIN_START,
      pluginName,
      statusCode: 500,
      expose: false,
    });

    this.name = "PluginStartError";
  }
}

/**
 * Error thrown when a plugin stop fails.
 */
export class PluginStopError extends PluginError {
  constructor(
    message: string,
    pluginName?: string,
    options: PluginErrorOptions = {},
  ) {
    super(message, {
      ...options,
      code: ErrorCode.PLUGIN_STOP,
      pluginName,
      statusCode: 500,
      expose: false,
    });

    this.name = "PluginStopError";
  }
}

/**
 * Error thrown when a plugin dispose fails.
 */
export class PluginDisposeError extends PluginError {
  constructor(
    message: string,
    pluginName?: string,
    options: PluginErrorOptions = {},
  ) {
    super(message, {
      ...options,
      code: ErrorCode.PLUGIN_DISPOSE,
      pluginName,
      statusCode: 500,
      expose: false,
    });

    this.name = "PluginDisposeError";
  }
}

/**
 * Error thrown when a plugin operation times out.
 */
export class PluginTimeoutError extends PluginError {
  constructor(
    pluginName: string,
    timeout: number,
    options: PluginErrorOptions = {},
  ) {
    super(
      `Plugin "${pluginName}" timed out after ${timeout}ms.`,
      {
        ...options,
        code: ErrorCode.PLUGIN_TIMEOUT,
        pluginName,
        statusCode: 504,
        expose: false,
        metadata: { timeout } as Record<string, ErrorMetadataValue>,
      },
    );

    this.name = "PluginTimeoutError";
  }
}

/**
 * Error thrown when an invalid plugin state transition is attempted.
 */
export class PluginStateError extends PluginError {
  constructor(
    pluginName: string,
    fromState: string,
    toState: string,
    options: PluginErrorOptions = {},
  ) {
    super(
      `Cannot transition plugin "${pluginName}" from "${fromState}" to "${toState}".`,
      {
        ...options,
        code: ErrorCode.PLUGIN_STATE,
        pluginName,
        statusCode: 400,
        expose: true,
        metadata: { fromState, toState } as Record<string, ErrorMetadataValue>,
      },
    );

    this.name = "PluginStateError";
  }
}
