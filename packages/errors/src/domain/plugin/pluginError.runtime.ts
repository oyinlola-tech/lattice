/**
 * Plugin runtime error classes — timeout, state transitions.
 */

import type { ErrorMetadataValue } from "../../base/core/errorMetadata.type.js";
import { ErrorCode } from "../../base/types/errorCode.type.js";
import { PluginError, type PluginErrorOptions } from "./pluginError.base.js";

/** Error thrown when a plugin operation times out. */
export class PluginTimeoutError extends PluginError {
  constructor(pluginName: string, timeout: number, options: PluginErrorOptions = {}) {
    super(`Plugin "${pluginName}" timed out after ${timeout}ms.`, {
      ...options, code: ErrorCode.PLUGIN_TIMEOUT, pluginName, statusCode: 504, expose: false,
      metadata: { timeout } as Record<string, ErrorMetadataValue>,
    });
    this.name = "PluginTimeoutError";
  }
}

/** Error thrown when an invalid plugin state transition is attempted. */
export class PluginStateError extends PluginError {
  constructor(pluginName: string, fromState: string, toState: string, options: PluginErrorOptions = {}) {
    super(`Cannot transition plugin "${pluginName}" from "${fromState}" to "${toState}".`, {
      ...options, code: ErrorCode.PLUGIN_STATE, pluginName, statusCode: 400, expose: true,
      metadata: { fromState, toState } as Record<string, ErrorMetadataValue>,
    });
    this.name = "PluginStateError";
  }
}
