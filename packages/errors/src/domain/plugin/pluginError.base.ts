/**
 * Base PluginError class, options, and factory functions.
 */

import { BaseError } from "../../base/core/baseError.core.js";
import type { BaseErrorOptions } from "../../base/types/baseError.type.js";
import { ErrorCategory } from "../../base/types/errorCategory.type.js";
import { ErrorCode } from "../../base/types/errorCode.type.js";
import { ErrorSeverity } from "../../base/types/errorSeverity.type.js";

/** Options for creating a plugin error. */
export interface PluginErrorOptions extends Omit<BaseErrorOptions, "category"> {
  readonly category?: ErrorCategory;
  readonly pluginName?: string;
}

/** Base error for all plugin failures. */
export class PluginError extends BaseError {
  public readonly pluginName?: string;

  constructor(message: string, options: PluginErrorOptions = {}) {
    super(message, {
      ...options,
      code: options.code ?? ErrorCode.PLUGIN_ERROR,
      category: options.category ?? ErrorCategory.PLUGIN,
      severity: options.severity ?? ErrorSeverity.ERROR,
      statusCode: options.statusCode ?? 500,
      expose: options.expose ?? false,
      isOperational: options.isOperational ?? true,
    });
    this.pluginName = options.pluginName;
  }

  public override toJSON() {
    return {
      ...super.toJSON(),
      ...(this.pluginName !== undefined ? { pluginName: this.pluginName } : {}),
    };
  }
}

/** Creates a plugin error. */
export function createPluginError(message: string, options: PluginErrorOptions = {}): PluginError {
  return new PluginError(message, options);
}

/** Determines whether an unknown value is a PluginError. */
export function isPluginError(value: unknown): value is PluginError {
  return value instanceof PluginError;
}
