import type { ModuleId } from "../module.js";

import { ModuleErrorCode, ModuleError } from "./moduleError.base.js";

/**
 * Error thrown when a module definition is invalid.
 */
export class InvalidModuleDefinitionError extends ModuleError {
  public constructor(message: string, moduleId?: ModuleId, cause?: unknown) {
    super(message, {
      code: ModuleErrorCode.INVALID_DEFINITION,
      moduleId,
      cause,
    });

    this.name = "InvalidModuleDefinitionError";
  }
}

/**
 * Error thrown when a module is not registered.
 */
export class ModuleNotFoundError extends ModuleError {
  public constructor(moduleId: ModuleId) {
    super(`Module "${moduleId}" is not registered.`, {
      code: ModuleErrorCode.NOT_FOUND,
      moduleId,
    });

    this.name = "ModuleNotFoundError";
  }
}

/**
 * Error thrown when a module is registered more than once.
 */
export class DuplicateModuleError extends ModuleError {
  public constructor(moduleId: ModuleId) {
    super(`Module "${moduleId}" is already registered.`, {
      code: ModuleErrorCode.DUPLICATE,
      moduleId,
    });

    this.name = "DuplicateModuleError";
  }
}
