/**
 * Plugin lifecycle error classes — registration, dependency, initialization.
 */

import type { ErrorMetadataValue } from "../../base/core/errorMetadata.type.js";
import { ErrorCode } from "../../base/types/errorCode.type.js";
import { PluginError, type PluginErrorOptions } from "./pluginError.base.js";

/** Error thrown when a plugin registration fails. */
export class PluginRegistrationError extends PluginError {
  constructor(message: string, pluginName?: string, options: PluginErrorOptions = {}) {
    super(message, { ...options, code: ErrorCode.PLUGIN_REGISTRATION, pluginName, statusCode: 400, expose: true });
    this.name = "PluginRegistrationError";
  }
}

/** Error thrown when a plugin is already registered. */
export class PluginAlreadyRegisteredError extends PluginError {
  constructor(pluginName: string, options: PluginErrorOptions = {}) {
    super(`Plugin "${pluginName}" is already registered.`, {
      ...options, code: ErrorCode.PLUGIN_ALREADY_REGISTERED, pluginName, statusCode: 409, expose: true,
    });
    this.name = "PluginAlreadyRegisteredError";
  }
}

/** Error thrown when a plugin is not found. */
export class PluginNotFoundError extends PluginError {
  constructor(pluginName: string, options: PluginErrorOptions = {}) {
    super(`Plugin "${pluginName}" is not registered.`, {
      ...options, code: ErrorCode.PLUGIN_NOT_FOUND, pluginName, statusCode: 404, expose: true,
    });
    this.name = "PluginNotFoundError";
  }
}

/** Error thrown when a plugin dependency is missing. */
export class PluginDependencyError extends PluginError {
  constructor(pluginName: string, dependencyName: string, options: PluginErrorOptions = {}) {
    super(`Plugin "${pluginName}" depends on "${dependencyName}" which is not registered.`, {
      ...options, code: ErrorCode.PLUGIN_DEPENDENCY, pluginName, statusCode: 400, expose: true,
      metadata: { dependencyName } as Record<string, ErrorMetadataValue>,
    });
    this.name = "PluginDependencyError";
  }
}

/** Error thrown when a circular plugin dependency is detected. */
export class PluginDependencyCycleError extends PluginError {
  constructor(cycle: readonly string[], options: PluginErrorOptions = {}) {
    super(`Circular plugin dependency detected: ${cycle.join(" -> ")}.`, {
      ...options, code: ErrorCode.PLUGIN_DEPENDENCY_CYCLE, statusCode: 400, expose: true,
      metadata: { cycle: [...cycle] } as Record<string, ErrorMetadataValue>,
    });
    this.name = "PluginDependencyCycleError";
  }
}

/** Error thrown when a plugin initialization fails. */
export class PluginInitializationError extends PluginError {
  constructor(message: string, pluginName?: string, options: PluginErrorOptions = {}) {
    super(message, { ...options, code: ErrorCode.PLUGIN_INITIALIZATION, pluginName, statusCode: 500, expose: false });
    this.name = "PluginInitializationError";
  }
}

/** Error thrown when a plugin start fails. */
export class PluginStartError extends PluginError {
  constructor(message: string, pluginName?: string, options: PluginErrorOptions = {}) {
    super(message, { ...options, code: ErrorCode.PLUGIN_START, pluginName, statusCode: 500, expose: false });
    this.name = "PluginStartError";
  }
}

/** Error thrown when a plugin stop fails. */
export class PluginStopError extends PluginError {
  constructor(message: string, pluginName?: string, options: PluginErrorOptions = {}) {
    super(message, { ...options, code: ErrorCode.PLUGIN_STOP, pluginName, statusCode: 500, expose: false });
    this.name = "PluginStopError";
  }
}

/** Error thrown when a plugin dispose fails. */
export class PluginDisposeError extends PluginError {
  constructor(message: string, pluginName?: string, options: PluginErrorOptions = {}) {
    super(message, { ...options, code: ErrorCode.PLUGIN_DISPOSE, pluginName, statusCode: 500, expose: false });
    this.name = "PluginDisposeError";
  }
}
