import { BaseError } from "../../base/core/baseError.core.js";
import type { BaseErrorOptions } from "../../base/types/baseError.type.js";
import { ErrorCategory } from "../../base/types/errorCategory.type.js";
import { ErrorCode } from "../../base/types/errorCode.type.js";
import { ErrorSeverity } from "../../base/types/errorSeverity.type.js";

/**
 * Options for creating a configuration error.
 *
 * Do not include the configuration value itself because it may
 * contain credentials or other sensitive information.
 */
export interface ConfigurationErrorOptions extends Omit<BaseErrorOptions, "category"> {
  readonly category?: ErrorCategory;
  readonly configKey?: string;
  readonly component?: string;
}

/**
 * Error raised when application configuration is missing or invalid.
 */
export class ConfigurationError extends BaseError {
  public readonly configKey?: string;
  public readonly component?: string;

  constructor(message = "Application configuration is invalid.", options: ConfigurationErrorOptions = {}) {
    super(message, {
      ...options,
      code: options.code ?? ErrorCode.CONFIGURATION_INVALID,
      category: options.category ?? ErrorCategory.CONFIGURATION,
      severity: options.severity ?? ErrorSeverity.CRITICAL,
      statusCode: options.statusCode ?? 500,
      expose: options.expose ?? false,
      isOperational: options.isOperational ?? false,
      metadata: {
        ...options.metadata,
        ...(options.configKey !== undefined ? { configKey: options.configKey } : {}),
        ...(options.component !== undefined ? { component: options.component } : {}),
      },
    });

    this.configKey = options.configKey;
    this.component = options.component;
  }

  public override toJSON() {
    return {
      ...super.toJSON(),
      ...(this.configKey !== undefined ? { configKey: this.configKey } : {}),
      ...(this.component !== undefined ? { component: this.component } : {}),
    };
  }
}

/** Creates a configuration error. */
export function createConfigurationError(
  message = "Application configuration is invalid.",
  options: ConfigurationErrorOptions = {},
): ConfigurationError {
  return new ConfigurationError(message, options);
}

/** Determines whether an unknown value is a ConfigurationError. */
export function isConfigurationError(value: unknown): value is ConfigurationError {
  return value instanceof ConfigurationError;
}

/** Creates an error for a missing configuration key. */
export function missingConfigurationError(configKey: string, component?: string): ConfigurationError {
  return new ConfigurationError(
    component
      ? `Required configuration "${configKey}" is missing for ${component}.`
      : `Required configuration "${configKey}" is missing.`,
    { code: ErrorCode.CONFIGURATION_MISSING, category: ErrorCategory.CONFIGURATION, severity: ErrorSeverity.CRITICAL, configKey, component },
  );
}

/** Creates an error for an invalid configuration key. */
export function invalidConfigurationError(configKey: string, component?: string): ConfigurationError {
  return new ConfigurationError(
    component
      ? `Configuration "${configKey}" is invalid for ${component}.`
      : `Configuration "${configKey}" is invalid.`,
    { code: ErrorCode.CONFIGURATION_INVALID, category: ErrorCategory.CONFIGURATION, severity: ErrorSeverity.CRITICAL, configKey, component },
  );
}
