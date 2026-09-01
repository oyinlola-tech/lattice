import type { ModuleId } from "../module.js";

import { ModuleErrorCode, ModuleError } from "./moduleError.base.js";

/**
 * Checks whether an unknown value is a ModuleError.
 */
export function isModuleError(error: unknown): error is ModuleError {
  return error instanceof ModuleError;
}

/**
 * Checks whether an unknown value represents
 * a particular module error code.
 */
export function hasModuleErrorCode(
  error: unknown,
  code: ModuleErrorCode,
): boolean {
  return isModuleError(error) && error.code === code;
}

/**
 * Converts an arbitrary error into a ModuleError.
 *
 * Existing ModuleErrors are returned unchanged.
 */
export function toModuleError(
  error: unknown,
  options: {
    readonly moduleId?: ModuleId;

    readonly code?: ModuleErrorCode;

    readonly phase?: string;
  } = {},
): ModuleError {
  if (error instanceof ModuleError) {
    return error;
  }

  const message = error instanceof Error ? error.message : String(error);

  return new ModuleError(message, {
    moduleId: options.moduleId,

    code: options.code ?? ModuleErrorCode.UNKNOWN,

    phase: options.phase,

    cause: error,
  });
}
